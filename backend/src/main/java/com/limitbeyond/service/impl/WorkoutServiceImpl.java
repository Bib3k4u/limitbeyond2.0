package com.limitbeyond.service.impl;

import com.limitbeyond.dto.workout.WorkoutRequest;
import com.limitbeyond.model.ExerciseTemplate;
import com.limitbeyond.model.MuscleGroup;
import com.limitbeyond.model.User;
import com.limitbeyond.model.Workout;
import com.limitbeyond.model.WorkoutSet;
import com.limitbeyond.repository.WorkoutRepository;
import com.limitbeyond.repository.WorkoutSetRepository;
import com.limitbeyond.repository.UserRepository;
import com.limitbeyond.repository.ExerciseTemplateRepository;
import com.limitbeyond.service.WorkoutService;
import com.limitbeyond.service.MuscleGroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class WorkoutServiceImpl implements WorkoutService {

    @Autowired
    private WorkoutRepository workoutRepository;

    @Autowired
    private WorkoutSetRepository workoutSetRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExerciseTemplateRepository exerciseTemplateRepository;

    @Autowired
    private MuscleGroupService muscleGroupService;

    private static final Logger logger = LoggerFactory.getLogger(WorkoutServiceImpl.class);

    @Override
    public Workout createWorkout(WorkoutRequest request) {
        // Get member
        User member = null;
        if (request.getMemberId() != null) {
            member = userRepository.findById(request.getMemberId())
                    .orElseThrow(() -> new UsernameNotFoundException("Member not found"));
        }

        // Get trainer if provided
        User trainer = null;
        if (request.getTrainerId() != null) {
            trainer = userRepository.findById(request.getTrainerId())
                    .orElseThrow(() -> new UsernameNotFoundException("Trainer not found"));
        }

        // Create workout
        Workout workout = new Workout(request.getName(), member);
        workout.setDescription(request.getDescription());
        workout.setTrainer(trainer);

        // Map date fields: scheduledDate takes precedence, else from LocalDate at midnight
        if (request.getScheduledDate() != null) {
            workout.setScheduledDate(request.getScheduledDate());
        } else if (request.getScheduledLocalDate() != null) {
            LocalDate d = request.getScheduledLocalDate();
            workout.setScheduledDate(LocalDateTime.of(d, LocalTime.MIDNIGHT));
        }

        workout.setNotes(request.getNotes());

        // Map target muscle groups
        if (request.getTargetMuscleGroupIds() != null && !request.getTargetMuscleGroupIds().isEmpty()) {
            List<MuscleGroup> groups = new ArrayList<>();
            for (String mgId : request.getTargetMuscleGroupIds()) {
                groups.add(muscleGroupService.findById(mgId));
            }
            workout.setTargetMuscleGroups(groups);
        }

        // Create and add sets
        if (request.getSets() != null) {
            for (WorkoutRequest.WorkoutSetRequest setRequest : request.getSets()) {
                ExerciseTemplate exercise = exerciseTemplateRepository.findById(setRequest.getExerciseId())
                        .orElseThrow(() -> new RuntimeException("Exercise not found"));

                WorkoutSet set = new WorkoutSet(exercise, setRequest.getReps());
                set.setWeight(setRequest.getWeight());
                set.setNotes(setRequest.getNotes());
                Double w = setRequest.getWeight() != null ? setRequest.getWeight() : 0.0;
                set.setVolume(w * setRequest.getReps());
                set = workoutSetRepository.save(set);
                workout.addSet(set);
            }
        }

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
        try {
            String mid = member != null ? member.getId() : "null";
            int found = results != null ? results.size() : 0;
            logger.info("WorkoutServiceImpl.findByMember memberId={} found={}", mid, found);
        } catch (Exception e) {
            logger.warn("Failed to log findByMember debug info", e);
        }
        return results;
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

        // Update basic info
        workout.setName(request.getName());
        workout.setDescription(request.getDescription());

        if (request.getScheduledDate() != null) {
            workout.setScheduledDate(request.getScheduledDate());
        } else if (request.getScheduledLocalDate() != null) {
            LocalDate d = request.getScheduledLocalDate();
            workout.setScheduledDate(LocalDateTime.of(d, LocalTime.MIDNIGHT));
        }

        workout.setNotes(request.getNotes());

        // Update trainer if provided
        if (request.getTrainerId() != null) {
            User trainer = userRepository.findById(request.getTrainerId())
                    .orElseThrow(() -> new UsernameNotFoundException("Trainer not found"));
            workout.setTrainer(trainer);
        }

        // Update target muscle groups if provided
        if (request.getTargetMuscleGroupIds() != null) {
            List<MuscleGroup> groups = new ArrayList<>();
            for (String mgId : request.getTargetMuscleGroupIds()) {
                groups.add(muscleGroupService.findById(mgId));
            }
            workout.setTargetMuscleGroups(groups);
        }

        // Update sets if provided
        if (request.getSets() != null) {
            // Remove existing sets
            List<WorkoutSet> existingSets = workout.getSets();
            workout.setSets(new ArrayList<>());
            workoutSetRepository.deleteAll(existingSets);

            // Add new sets
            for (WorkoutRequest.WorkoutSetRequest setRequest : request.getSets()) {
                ExerciseTemplate exercise = exerciseTemplateRepository.findById(setRequest.getExerciseId())
                        .orElseThrow(() -> new RuntimeException("Exercise not found"));

                WorkoutSet set = new WorkoutSet(exercise, setRequest.getReps());
                set.setWeight(setRequest.getWeight());
                set.setNotes(setRequest.getNotes());
                Double w = setRequest.getWeight() != null ? setRequest.getWeight() : 0.0;
                set.setVolume(w * setRequest.getReps());
                set = workoutSetRepository.save(set);
                workout.addSet(set);
            }
        }

        return workoutRepository.save(workout);
    }

    @Override
    public Workout completeSet(String workoutId, String setId) {
        Workout workout = findById(workoutId);

        for (WorkoutSet set : workout.getSets()) {
            if (set.getId().equals(setId)) {
                set.setCompleted(true);
                workoutSetRepository.save(set);
                break;
            }
        }

        // Check if all sets are completed
        boolean allCompleted = workout.getSets().stream().allMatch(WorkoutSet::isCompleted);
        if (allCompleted) {
            workout.setCompleted(true);
        }

        return workoutRepository.save(workout);
    }

    @Override
    public Workout uncompleteSet(String workoutId, String setId) {
        Workout workout = findById(workoutId);
        for (WorkoutSet set : workout.getSets()) {
            if (set.getId().equals(setId)) {
                set.setCompleted(false);
                workoutSetRepository.save(set);
                break;
            }
        }
        // If any set is not completed, mark workout as not completed
        boolean allCompleted = workout.getSets().stream().allMatch(WorkoutSet::isCompleted);
        if (!allCompleted) {
            workout.setCompleted(false);
        }
        return workoutRepository.save(workout);
    }

    @Override
    public Workout completeWorkout(String id) {
        Workout workout = findById(id);

        // Mark all sets as completed
        for (WorkoutSet set : workout.getSets()) {
            set.setCompleted(true);
            workoutSetRepository.save(set);
        }

        workout.setCompleted(true);
        return workoutRepository.save(workout);
    }

    @Override
    public Workout copyWorkout(String id, LocalDateTime newScheduledDate) {
        Workout original = findById(id);

        // Create new workout with copied data
        Workout copy = new Workout(original.getName(), original.getMember());
        copy.setDescription(original.getDescription());
        copy.setTrainer(original.getTrainer());
        copy.setScheduledDate(newScheduledDate);
        copy.setNotes(original.getNotes());
        copy.setTargetMuscleGroups(original.getTargetMuscleGroups());

        // Copy sets
        for (WorkoutSet originalSet : original.getSets()) {
            WorkoutSet newSet = new WorkoutSet(originalSet.getExercise(), originalSet.getReps());
            newSet.setWeight(originalSet.getWeight());
            newSet.setNotes(originalSet.getNotes());
            newSet.setVolume(originalSet.getVolume());
            newSet = workoutSetRepository.save(newSet);
            copy.addSet(newSet);
        }

        return workoutRepository.save(copy);
    }

    @Override
    public void delete(String id) {
        Workout workout = findById(id);

        // Delete associated sets first
        workoutSetRepository.deleteAll(workout.getSets());

        // Delete the workout
        workoutRepository.delete(workout);
    }
}
