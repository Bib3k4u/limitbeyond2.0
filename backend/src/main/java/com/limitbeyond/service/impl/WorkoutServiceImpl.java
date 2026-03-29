package com.limitbeyond.service.impl;

import com.limitbeyond.dto.workout.WorkoutRequest;
import com.limitbeyond.model.ExerciseTemplate;
import com.limitbeyond.model.MuscleGroup;
import com.limitbeyond.model.User;
import com.limitbeyond.model.Workout;
import com.limitbeyond.model.WorkoutSet;
import com.limitbeyond.repository.WorkoutRepository;
import com.limitbeyond.repository.UserRepository;
import com.limitbeyond.repository.ExerciseTemplateRepository;
import com.limitbeyond.service.WorkoutService;
import com.limitbeyond.service.MuscleGroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * WorkoutSets are now EMBEDDED inside the Workout document (no @DBRef, no workout_sets collection).
 * This eliminates the N+1 query problem:
 *   Before: 1 workout page query + 1 query/set + 1 query/exercise-in-set = 300-500 queries.
 *   After:  1 query returns the full workout with all embedded sets and exercise data.
 *
 * WorkoutSetRepository is intentionally NOT used — sets are saved as part of the parent Workout.
 */
@Service
public class WorkoutServiceImpl implements WorkoutService {

    @Autowired
    private WorkoutRepository workoutRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExerciseTemplateRepository exerciseTemplateRepository;

    @Autowired
    private MuscleGroupService muscleGroupService;

    private static final Logger logger = LoggerFactory.getLogger(WorkoutServiceImpl.class);

    // ── Helpers ───────────────────────────────────────────────────────────────

    /** Build an embedded WorkoutSet from a request. ID is generated here. */
    private WorkoutSet buildSet(WorkoutRequest.WorkoutSetRequest req) {
        ExerciseTemplate exercise = exerciseTemplateRepository.findById(req.getExerciseId())
                .orElseThrow(() -> new RuntimeException("Exercise not found: " + req.getExerciseId()));
        WorkoutSet set = new WorkoutSet(exercise, req.getReps());
        set.setId(UUID.randomUUID().toString());
        set.setWeight(req.getWeight());
        set.setNotes(req.getNotes());
        double w = req.getWeight() != null ? req.getWeight() : 0.0;
        set.setVolume(w * req.getReps());
        return set;
    }

    // ── CRUD ──────────────────────────────────────────────────────────────────

    @Override
    public Workout createWorkout(WorkoutRequest request) {
        User member = null;
        if (request.getMemberId() != null) {
            member = userRepository.findById(request.getMemberId())
                    .orElseThrow(() -> new UsernameNotFoundException("Member not found"));
        }

        User trainer = null;
        if (request.getTrainerId() != null) {
            trainer = userRepository.findById(request.getTrainerId())
                    .orElseThrow(() -> new UsernameNotFoundException("Trainer not found"));
        }

        Workout workout = new Workout(request.getName(), member);
        workout.setDescription(request.getDescription());
        workout.setTrainer(trainer);

        if (request.getScheduledDate() != null) {
            workout.setScheduledDate(request.getScheduledDate());
        } else if (request.getScheduledLocalDate() != null) {
            LocalDate d = request.getScheduledLocalDate();
            workout.setScheduledDate(LocalDateTime.of(d, LocalTime.MIDNIGHT));
        }

        workout.setNotes(request.getNotes());

        if (request.getTargetMuscleGroupIds() != null && !request.getTargetMuscleGroupIds().isEmpty()) {
            List<MuscleGroup> groups = new ArrayList<>();
            for (String mgId : request.getTargetMuscleGroupIds()) {
                groups.add(muscleGroupService.findById(mgId));
            }
            workout.setTargetMuscleGroups(groups);
        }

        if (request.getSets() != null) {
            for (WorkoutRequest.WorkoutSetRequest setRequest : request.getSets()) {
                workout.addSet(buildSet(setRequest));
            }
        }

        // Single save — sets are embedded, no separate collection write needed
        return workoutRepository.save(workout);
    }

    @Override
    public Workout findById(String id) {
        return workoutRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workout not found"));
    }

    @Override
    public List<Workout> findByMember(User member) {
        List<Workout> results = workoutRepository.findByMember(member);
        logger.info("WorkoutServiceImpl.findByMember memberId={} found={}",
                member != null ? member.getId() : "null",
                results != null ? results.size() : 0);
        return results;
    }

    @Override
    public Page<Workout> findByMember(User member, Pageable pageable) {
        return workoutRepository.findByMember(member, pageable);
    }

    @Override
    public List<Workout> findByTrainer(User trainer) {
        return workoutRepository.findByTrainer(trainer);
    }

    @Override
    public List<Workout> findByMemberAndDateRange(User member, LocalDateTime start, LocalDateTime end) {
        return workoutRepository.findByMemberAndScheduledDateBetween(member, start, end);
    }

    @Override
    public List<Workout> findByTrainerAndDateRange(User trainer, LocalDateTime start, LocalDateTime end) {
        return workoutRepository.findByTrainerAndScheduledDateBetween(trainer, start, end);
    }

    @Override
    public List<Workout> findCompletedWorkouts(User member) {
        return workoutRepository.findByMemberAndCompletedTrue(member);
    }

    @Override
    public List<Workout> findIncompleteWorkouts(User member) {
        return workoutRepository.findByMemberAndCompletedFalse(member);
    }

    @Override
    public Workout update(String id, WorkoutRequest request) {
        Workout workout = findById(id);

        workout.setName(request.getName());
        workout.setDescription(request.getDescription());

        if (request.getScheduledDate() != null) {
            workout.setScheduledDate(request.getScheduledDate());
        } else if (request.getScheduledLocalDate() != null) {
            LocalDate d = request.getScheduledLocalDate();
            workout.setScheduledDate(LocalDateTime.of(d, LocalTime.MIDNIGHT));
        }

        workout.setNotes(request.getNotes());

        if (request.getTrainerId() != null) {
            User trainer = userRepository.findById(request.getTrainerId())
                    .orElseThrow(() -> new UsernameNotFoundException("Trainer not found"));
            workout.setTrainer(trainer);
        }

        if (request.getTargetMuscleGroupIds() != null) {
            List<MuscleGroup> groups = new ArrayList<>();
            for (String mgId : request.getTargetMuscleGroupIds()) {
                groups.add(muscleGroupService.findById(mgId));
            }
            workout.setTargetMuscleGroups(groups);
        }

        if (request.getSets() != null) {
            // Replace all sets — embedded, so just reassign the list
            List<WorkoutSet> newSets = new ArrayList<>();
            for (WorkoutRequest.WorkoutSetRequest setRequest : request.getSets()) {
                newSets.add(buildSet(setRequest));
            }
            workout.setSets(newSets);
        }

        return workoutRepository.save(workout);
    }

    @Override
    public Workout completeSet(String workoutId, String setId) {
        Workout workout = findById(workoutId);
        for (WorkoutSet set : workout.getSets()) {
            if (set.getId().equals(setId)) {
                set.setCompleted(true);
                break;
            }
        }
        boolean allCompleted = workout.getSets().stream().allMatch(WorkoutSet::isCompleted);
        if (allCompleted) workout.setCompleted(true);
        // Single save — set change is part of the embedded document
        return workoutRepository.save(workout);
    }

    @Override
    public Workout uncompleteSet(String workoutId, String setId) {
        Workout workout = findById(workoutId);
        for (WorkoutSet set : workout.getSets()) {
            if (set.getId().equals(setId)) {
                set.setCompleted(false);
                break;
            }
        }
        boolean allCompleted = workout.getSets().stream().allMatch(WorkoutSet::isCompleted);
        if (!allCompleted) workout.setCompleted(false);
        return workoutRepository.save(workout);
    }

    @Override
    public Workout completeWorkout(String id) {
        Workout workout = findById(id);
        workout.getSets().forEach(set -> set.setCompleted(true));
        workout.setCompleted(true);
        return workoutRepository.save(workout);
    }

    @Override
    public Workout copyWorkout(String id, LocalDateTime newScheduledDate) {
        Workout original = findById(id);

        Workout copy = new Workout(original.getName(), original.getMember());
        copy.setDescription(original.getDescription());
        copy.setTrainer(original.getTrainer());
        copy.setScheduledDate(newScheduledDate);
        copy.setNotes(original.getNotes());
        copy.setTargetMuscleGroups(original.getTargetMuscleGroups());

        for (WorkoutSet originalSet : original.getSets()) {
            WorkoutSet newSet = new WorkoutSet(originalSet.getExercise(), originalSet.getReps());
            newSet.setId(UUID.randomUUID().toString());
            newSet.setWeight(originalSet.getWeight());
            newSet.setNotes(originalSet.getNotes());
            newSet.setVolume(originalSet.getVolume());
            copy.addSet(newSet);
        }

        return workoutRepository.save(copy);
    }

    @Override
    public void delete(String id) {
        Workout workout = findById(id);
        // Sets are embedded — deleting the workout deletes them automatically
        workoutRepository.delete(workout);
    }
}
