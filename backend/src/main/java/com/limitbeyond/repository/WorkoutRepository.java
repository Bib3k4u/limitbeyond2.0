package com.limitbeyond.repository;

import com.limitbeyond.model.MuscleGroup;
import com.limitbeyond.model.User;
import com.limitbeyond.model.Workout;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface WorkoutRepository extends MongoRepository<Workout, String> {
    // Find workouts by member
    List<Workout> findByMember(User member);

    // Find workouts by trainer
    List<Workout> findByTrainer(User trainer);

    // Find workouts by member and date range
    List<Workout> findByMemberAndScheduledDateBetween(User member, LocalDateTime start, LocalDateTime end);

    // Find workouts by trainer and date range
    List<Workout> findByTrainerAndScheduledDateBetween(User trainer, LocalDateTime start, LocalDateTime end);

    // Find completed workouts for a member
    List<Workout> findByMemberAndCompletedTrue(User member);

    // Find incomplete workouts for a member
    List<Workout> findByMemberAndCompletedFalse(User member);

    // New: find by member and containing target muscle group
    List<Workout> findByMemberAndTargetMuscleGroupsContaining(User member, MuscleGroup muscleGroup);
}
