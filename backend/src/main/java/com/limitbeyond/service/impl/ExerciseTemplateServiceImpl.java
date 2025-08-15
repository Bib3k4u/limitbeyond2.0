package com.limitbeyond.service.impl;

import com.limitbeyond.dto.exercise.ExerciseTemplateRequest;
import com.limitbeyond.model.ExerciseTemplate;
import com.limitbeyond.model.MuscleGroup;
import com.limitbeyond.repository.ExerciseTemplateRepository;
import com.limitbeyond.service.ExerciseTemplateService;
import com.limitbeyond.service.MuscleGroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class ExerciseTemplateServiceImpl implements ExerciseTemplateService {

    @Autowired
    private ExerciseTemplateRepository exerciseTemplateRepository;

    @Autowired
    private MuscleGroupService muscleGroupService;

    @Override
    public ExerciseTemplate createExerciseTemplate(ExerciseTemplateRequest request) {
        // Check if an exercise with the same name already exists
        if (exerciseTemplateRepository.findByName(request.getName()).isPresent()) {
            throw new RuntimeException("Exercise template with name " + request.getName() + " already exists");
        }

        // Get the primary muscle group
        MuscleGroup primaryMuscleGroup = muscleGroupService.findById(request.getPrimaryMuscleGroupId());

        // Create new exercise template
        ExerciseTemplate exerciseTemplate = new ExerciseTemplate(
                request.getName(),
                primaryMuscleGroup,
                request.getDescription(),
                request.getRequiresWeight());

        // Set secondary muscle group if provided
        if (request.getSecondaryMuscleGroupId() != null) {
            MuscleGroup secondaryMuscleGroup = muscleGroupService.findById(request.getSecondaryMuscleGroupId());
            exerciseTemplate.setSecondaryMuscleGroup(secondaryMuscleGroup);
        }

        return exerciseTemplateRepository.save(exerciseTemplate);
    }

    @Override
    public ExerciseTemplate findById(String id) {
        return exerciseTemplateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exercise template with id " + id + " not found"));
    }

    @Override
    public ExerciseTemplate findByName(String name) {
        return exerciseTemplateRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Exercise template with name " + name + " not found"));
    }

    @Override
    public List<ExerciseTemplate> findAll() {
        return exerciseTemplateRepository.findAll();
    }

    @Override
    public List<ExerciseTemplate> findByMuscleGroup(MuscleGroup muscleGroup) {
        return exerciseTemplateRepository.findByPrimaryMuscleGroupOrSecondaryMuscleGroup(muscleGroup, muscleGroup);
    }

    @Override
    public List<ExerciseTemplate> findByMuscleGroups(List<MuscleGroup> muscleGroups) {
        Set<ExerciseTemplate> result = new HashSet<>();

        for (MuscleGroup muscleGroup : muscleGroups) {
            result.addAll(findByMuscleGroup(muscleGroup));
        }

        return new ArrayList<>(result);
    }

    @Override
    public ExerciseTemplate update(String id, ExerciseTemplateRequest request) {
        ExerciseTemplate exerciseTemplate = findById(id);

        // Check if the name is being changed and if the new name already exists
        if (!exerciseTemplate.getName().equals(request.getName()) &&
                exerciseTemplateRepository.findByName(request.getName()).isPresent()) {
            throw new RuntimeException("Exercise template with name " + request.getName() + " already exists");
        }

        // Update the exercise template properties
        exerciseTemplate.setName(request.getName());

        MuscleGroup primaryMuscleGroup = muscleGroupService.findById(request.getPrimaryMuscleGroupId());
        exerciseTemplate.setPrimaryMuscleGroup(primaryMuscleGroup);

        if (request.getSecondaryMuscleGroupId() != null) {
            MuscleGroup secondaryMuscleGroup = muscleGroupService.findById(request.getSecondaryMuscleGroupId());
            exerciseTemplate.setSecondaryMuscleGroup(secondaryMuscleGroup);
        } else {
            exerciseTemplate.setSecondaryMuscleGroup(null);
        }

        exerciseTemplate.setDescription(request.getDescription());
        exerciseTemplate.setRequiresWeight(request.getRequiresWeight());

        return exerciseTemplateRepository.save(exerciseTemplate);
    }

    @Override
    public void delete(String id) {
        if (!exerciseTemplateRepository.existsById(id)) {
            throw new RuntimeException("Exercise template with id " + id + " not found");
        }

        exerciseTemplateRepository.deleteById(id);
    }
}