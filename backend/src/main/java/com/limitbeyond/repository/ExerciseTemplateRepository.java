package com.limitbeyond.repository;

import com.limitbeyond.model.ExerciseTemplate;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

/**
 * Muscle groups are now embedded inside ExerciseTemplate (no @DBRef).
 * Derived queries use the embedded field path: primaryMuscleGroup.id → primaryMuscleGroup._id in MongoDB.
 */
public interface ExerciseTemplateRepository extends MongoRepository<ExerciseTemplate, String> {

    Optional<ExerciseTemplate> findByName(String name);

    Optional<ExerciseTemplate> findByNameIgnoreCase(String name);

    // Query by embedded muscle group id
    List<ExerciseTemplate> findByPrimaryMuscleGroupId(String primaryMuscleGroupId);

    List<ExerciseTemplate> findBySecondaryMuscleGroupId(String secondaryMuscleGroupId);

    List<ExerciseTemplate> findByPrimaryMuscleGroupIdOrSecondaryMuscleGroupId(
            String primaryMuscleGroupId, String secondaryMuscleGroupId);
}
