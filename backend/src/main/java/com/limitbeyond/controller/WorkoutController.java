package com.limitbeyond.controller;

import com.limitbeyond.dto.workout.WorkoutRequest;
import com.limitbeyond.dto.workout.WorkoutResponse;
import com.limitbeyond.model.MuscleGroup;
import com.limitbeyond.model.User;
import com.limitbeyond.model.Workout;
import com.limitbeyond.repository.UserRepository;
import com.limitbeyond.service.MuscleGroupService;
import com.limitbeyond.service.WorkoutService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/workouts")
public class WorkoutController {

    @Autowired
    private WorkoutService workoutService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MuscleGroupService muscleGroupService;

    private static final Logger logger = LoggerFactory.getLogger(WorkoutController.class);

    private User getCurrentUserOrThrow() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<WorkoutResponse>> getMyWorkouts(@RequestParam(required = false) String memberId) {
        User me = getCurrentUserOrThrow();

        User memberToQuery = me;

        if (memberId != null && !memberId.isEmpty()) {
            // Allow ADMIN and TRAINER to query other members' workouts; regular MEMBERs
            // cannot
            if (me.getRoles().contains(com.limitbeyond.model.Role.ADMIN)
                    || me.getRoles().contains(com.limitbeyond.model.Role.TRAINER)) {
                memberToQuery = userRepository.findById(memberId)
                        .orElseThrow(() -> new RuntimeException("Member not found"));
            } else {
                // Members cannot request other members' workouts; ignore memberId and fall back
                // to self
                memberToQuery = me;
            }
        }

        List<Workout> workouts = workoutService.findByMember(memberToQuery);
        if (workouts == null) {
            workouts = new ArrayList<>();
        }
        // Debug logging to help trace memberId lookups and returned counts
        try {
            String callerId = me != null ? me.getId() : "unknown";
            String resolvedMemberId = memberToQuery != null ? memberToQuery.getId() : "null";
            int found = workouts != null ? workouts.size() : 0;
            logger.info("getMyWorkouts called by={} requestedMemberId={} resolvedMemberId={} returnedCount={}",
                    callerId, memberId, resolvedMemberId, found);
        } catch (Exception e) {
            logger.warn("Failed to log getMyWorkouts debug info", e);
        }
        List<WorkoutResponse> responses = new ArrayList<>();
        for (Workout w : workouts)
            responses.add(WorkoutResponse.fromWorkout(w));
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<WorkoutResponse> getWorkoutById(@PathVariable String id) {
        Workout workout = workoutService.findById(id);
        // Ensure current user is owner or trainer/admin could be allowed in future. For
        // now, just return.
        return ResponseEntity.ok(WorkoutResponse.fromWorkout(workout));
    }

    @GetMapping("/by-date-range")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<WorkoutResponse>> getWorkoutsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        User me = getCurrentUserOrThrow();
        LocalDateTime start = LocalDateTime.of(startDate, LocalTime.MIN);
        LocalDateTime end = LocalDateTime.of(endDate, LocalTime.MAX);
        List<Workout> workouts = workoutService.findByMemberAndDateRange(me, start, end);
        List<WorkoutResponse> responses = new ArrayList<>();
        for (Workout w : workouts)
            responses.add(WorkoutResponse.fromWorkout(w));
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/by-muscle-group/{muscleGroupId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<WorkoutResponse>> getWorkoutsByMuscleGroup(@PathVariable String muscleGroupId) {
        User me = getCurrentUserOrThrow();
        MuscleGroup mg = muscleGroupService.findById(muscleGroupId);
        // Direct repository call for this filter since service interface does not
        // expose it
        // or we could extend the service; using repository through service is
        // preferable,
        // but we keep it simple here by filtering from all for the user.
        List<Workout> all = workoutService.findByMember(me);
        List<Workout> filtered = new ArrayList<>();
        for (Workout w : all) {
            if (w.getTargetMuscleGroups() != null
                    && w.getTargetMuscleGroups().stream().anyMatch(g -> g.getId().equals(mg.getId()))) {
                filtered.add(w);
            }
        }
        List<WorkoutResponse> responses = new ArrayList<>();
        for (Workout w : filtered)
            responses.add(WorkoutResponse.fromWorkout(w));
        return ResponseEntity.ok(responses);
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<WorkoutResponse> createWorkout(@Valid @RequestBody WorkoutRequest request) {
        // If memberId not provided, create for current user
        if (request.getMemberId() == null || request.getMemberId().isEmpty()) {
            User me = getCurrentUserOrThrow();
            request.setMemberId(me.getId());
        }
        Workout workout = workoutService.createWorkout(request);
        return ResponseEntity.ok(WorkoutResponse.fromWorkout(workout));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<WorkoutResponse> updateWorkout(@PathVariable String id,
            @Valid @RequestBody WorkoutRequest request) {
        Workout updated = workoutService.update(id, request);
        return ResponseEntity.ok(WorkoutResponse.fromWorkout(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteWorkout(@PathVariable String id) {
        workoutService.delete(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/copy")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<WorkoutResponse> copyWorkout(@PathVariable String id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate newDate) {
        LocalDateTime newScheduled = LocalDateTime.of(newDate, LocalTime.MIDNIGHT);
        Workout copied = workoutService.copyWorkout(id, newScheduled);
        return ResponseEntity.ok(WorkoutResponse.fromWorkout(copied));
    }

    // Exercise operations inside a workout based on provided example
    public static class WorkoutExerciseRequest {
        private String exerciseTemplateId;
        private List<SetDto> sets;

        public static class SetDto {
            public Integer reps;
            public Double weight;
        }

        public String getExerciseTemplateId() {
            return exerciseTemplateId;
        }

        public void setExerciseTemplateId(String exerciseTemplateId) {
            this.exerciseTemplateId = exerciseTemplateId;
        }

        public List<SetDto> getSets() {
            return sets;
        }

        public void setSets(List<SetDto> sets) {
            this.sets = sets;
        }
    }

    @PostMapping("/{id}/exercises")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<WorkoutResponse> addExercise(@PathVariable String id,
            @RequestBody WorkoutExerciseRequest body) {
        // The domain currently models each WorkoutSet as a single set with one
        // exercise.
        // To align, we will append multiple WorkoutSet entries for each provided set.
        Workout workout = workoutService.findById(id);
        // Reuse service update path by constructing an update request merging existing
        // sets + new ones
        WorkoutRequest req = new WorkoutRequest();
        req.setName(workout.getName());
        req.setDescription(workout.getDescription());
        req.setScheduledDate(workout.getScheduledDate());
        req.setNotes(workout.getNotes());
        List<WorkoutRequest.WorkoutSetRequest> merged = new ArrayList<>();
        if (workout.getSets() != null) {
            for (var s : workout.getSets()) {
                WorkoutRequest.WorkoutSetRequest sr = new WorkoutRequest.WorkoutSetRequest();
                sr.setExerciseId(s.getExercise().getId());
                sr.setReps(s.getReps());
                sr.setWeight(s.getWeight());
                sr.setNotes(s.getNotes());
                merged.add(sr);
            }
        }
        if (body.getSets() != null && body.getExerciseTemplateId() != null) {
            for (var s : body.getSets()) {
                WorkoutRequest.WorkoutSetRequest sr = new WorkoutRequest.WorkoutSetRequest();
                sr.setExerciseId(body.getExerciseTemplateId());
                sr.setReps(s.reps);
                sr.setWeight(s.weight);
                merged.add(sr);
            }
        }
        req.setSets(merged);
        // Preserve target muscle groups
        if (workout.getTargetMuscleGroups() != null) {
            List<String> mgIds = new ArrayList<>();
            for (var mg : workout.getTargetMuscleGroups())
                mgIds.add(mg.getId());
            req.setTargetMuscleGroupIds(mgIds);
        }
        Workout updated = workoutService.update(id, req);
        return ResponseEntity.ok(WorkoutResponse.fromWorkout(updated));
    }

    @PutMapping("/{workoutId}/exercises/{exerciseId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<WorkoutResponse> updateExercise(@PathVariable String workoutId,
            @PathVariable String exerciseId,
            @RequestBody WorkoutExerciseRequest body) {
        // Replace all sets for the given exercise with the new list
        Workout workout = workoutService.findById(workoutId);
        List<WorkoutRequest.WorkoutSetRequest> rebuilt = new ArrayList<>();
        // Keep sets for other exercises
        if (workout.getSets() != null) {
            workout.getSets().forEach(s -> {
                if (!s.getExercise().getId().equals(exerciseId)) {
                    WorkoutRequest.WorkoutSetRequest sr = new WorkoutRequest.WorkoutSetRequest();
                    sr.setExerciseId(s.getExercise().getId());
                    sr.setReps(s.getReps());
                    sr.setWeight(s.getWeight());
                    sr.setNotes(s.getNotes());
                    rebuilt.add(sr);
                }
            });
        }
        // Add new sets for this exerciseId
        if (body.getSets() != null) {
            for (var s : body.getSets()) {
                WorkoutRequest.WorkoutSetRequest sr = new WorkoutRequest.WorkoutSetRequest();
                sr.setExerciseId(exerciseId);
                sr.setReps(s.reps);
                sr.setWeight(s.weight);
                rebuilt.add(sr);
            }
        }
        WorkoutRequest req = new WorkoutRequest();
        req.setName(workout.getName());
        req.setDescription(workout.getDescription());
        req.setScheduledDate(workout.getScheduledDate());
        req.setNotes(workout.getNotes());
        req.setSets(rebuilt);
        if (workout.getTargetMuscleGroups() != null) {
            List<String> mgIds = new ArrayList<>();
            for (var mg : workout.getTargetMuscleGroups())
                mgIds.add(mg.getId());
            req.setTargetMuscleGroupIds(mgIds);
        }
        Workout updated = workoutService.update(workoutId, req);
        return ResponseEntity.ok(WorkoutResponse.fromWorkout(updated));
    }

    @DeleteMapping("/{workoutId}/exercises/{exerciseId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<WorkoutResponse> deleteExercise(@PathVariable String workoutId,
            @PathVariable String exerciseId) {
        // Remove all sets with this exercise id
        Workout workout = workoutService.findById(workoutId);
        List<WorkoutRequest.WorkoutSetRequest> rebuilt = new ArrayList<>();
        if (workout.getSets() != null) {
            workout.getSets().forEach(s -> {
                if (!s.getExercise().getId().equals(exerciseId)) {
                    WorkoutRequest.WorkoutSetRequest sr = new WorkoutRequest.WorkoutSetRequest();
                    sr.setExerciseId(s.getExercise().getId());
                    sr.setReps(s.getReps());
                    sr.setWeight(s.getWeight());
                    sr.setNotes(s.getNotes());
                    rebuilt.add(sr);
                }
            });
        }
        WorkoutRequest req = new WorkoutRequest();
        req.setName(workout.getName());
        req.setDescription(workout.getDescription());
        req.setScheduledDate(workout.getScheduledDate());
        req.setNotes(workout.getNotes());
        req.setSets(rebuilt);
        if (workout.getTargetMuscleGroups() != null) {
            List<String> mgIds = new ArrayList<>();
            for (var mg : workout.getTargetMuscleGroups())
                mgIds.add(mg.getId());
            req.setTargetMuscleGroupIds(mgIds);
        }
        Workout updated = workoutService.update(workoutId, req);
        return ResponseEntity.ok(WorkoutResponse.fromWorkout(updated));
    }

    @PostMapping("/{workoutId}/sets/{setId}/complete")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<WorkoutResponse> completeSet(@PathVariable String workoutId, @PathVariable String setId) {
        Workout updated = workoutService.completeSet(workoutId, setId);
        return ResponseEntity.ok(WorkoutResponse.fromWorkout(updated));
    }

    @PostMapping("/{workoutId}/sets/{setId}/uncomplete")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<WorkoutResponse> uncompleteSet(@PathVariable String workoutId, @PathVariable String setId) {
        Workout updated = workoutService.uncompleteSet(workoutId, setId);
        return ResponseEntity.ok(WorkoutResponse.fromWorkout(updated));
    }

    @PostMapping("/{workoutId}/complete")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<WorkoutResponse> completeWorkout(@PathVariable String workoutId) {
        Workout updated = workoutService.completeWorkout(workoutId);
        return ResponseEntity.ok(WorkoutResponse.fromWorkout(updated));
    }
}