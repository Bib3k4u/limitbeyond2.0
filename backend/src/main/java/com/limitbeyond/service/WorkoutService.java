package com.limitbeyond.service;

import com.limitbeyond.dto.workout.WorkoutRequest;
import com.limitbeyond.model.Workout;
import com.limitbeyond.model.User;
import java.time.LocalDateTime;
import java.util.List;

public interface WorkoutService {
    Workout createWorkout(WorkoutRequest request);

    Workout findById(String id);

    List<Workout> findByMember(User member);

    List<Workout> findByTrainer(User trainer);

    List<Workout> findByMemberAndDateRange(User member, LocalDateTime start, LocalDateTime end);

    List<Workout> findByTrainerAndDateRange(User trainer, LocalDateTime start, LocalDateTime end);

    List<Workout> findCompletedWorkouts(User member);

    List<Workout> findIncompleteWorkouts(User member);

    Workout update(String id, WorkoutRequest request);

    Workout completeSet(String workoutId, String setId);

    Workout completeWorkout(String id);

    Workout copyWorkout(String id, LocalDateTime newScheduledDate);

    void delete(String id);

    // New: mark a set as not completed
    Workout uncompleteSet(String workoutId, String setId);
}
