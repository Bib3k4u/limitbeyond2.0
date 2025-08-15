package com.limitbeyond.repository;

import com.limitbeyond.model.ExerciseTemplate;
import com.limitbeyond.model.MuscleGroup;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ExerciseTemplateRepository extends MongoRepository<ExerciseTemplate, String> {
    Optional<ExerciseTemplate> findByName(String name);

    Optional<ExerciseTemplate> findByNameIgnoreCase(String name);

    List<ExerciseTemplate> findByPrimaryMuscleGroup(MuscleGroup muscleGroup);

    List<ExerciseTemplate> findBySecondaryMuscleGroup(MuscleGroup muscleGroup);

    List<ExerciseTemplate> findByPrimaryMuscleGroupOrSecondaryMuscleGroup(MuscleGroup primaryMuscleGroup,
                                                                          MuscleGroup secondaryMuscleGroup);
}
