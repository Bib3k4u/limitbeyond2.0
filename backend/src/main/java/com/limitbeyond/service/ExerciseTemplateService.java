package com.limitbeyond.service;

import com.limitbeyond.dto.exercise.ExerciseTemplateRequest;
import com.limitbeyond.model.ExerciseTemplate;
import com.limitbeyond.model.MuscleGroup;

import java.util.List;

public interface ExerciseTemplateService {
    ExerciseTemplate createExerciseTemplate(ExerciseTemplateRequest request);

    ExerciseTemplate findById(String id);

    ExerciseTemplate findByName(String name);

    List<ExerciseTemplate> findAll();

    List<ExerciseTemplate> findByMuscleGroup(MuscleGroup muscleGroup);

    List<ExerciseTemplate> findByMuscleGroups(List<MuscleGroup> muscleGroups);

    ExerciseTemplate update(String id, ExerciseTemplateRequest request);

    void delete(String id);
}
