package com.limitbeyond.dto.exercise;

import com.limitbeyond.model.ExerciseTemplate;
import com.limitbeyond.model.MuscleGroup;

import java.util.ArrayList;
import java.util.List;

public class ExerciseTemplateResponse {
    private String id;
    private String name;
    private String description;
    private boolean requiresWeight;
    private List<MuscleGroupDto> muscleGroups;

    // Default constructor
    public ExerciseTemplateResponse() {
    }

    // Constructor from ExerciseTemplate model
    public ExerciseTemplateResponse(ExerciseTemplate template) {
        this.id = template.getId();
        this.name = template.getName();
        this.description = template.getDescription();
        this.requiresWeight = template.getRequiresWeight() != null ? template.getRequiresWeight() : true;

        // Add muscle groups
        this.muscleGroups = new ArrayList<>();

        // Add primary muscle group if available
        if (template.getPrimaryMuscleGroup() != null) {
            this.muscleGroups.add(new MuscleGroupDto(
                    template.getPrimaryMuscleGroup().getId(),
                    template.getPrimaryMuscleGroup().getName()));
        }

        // Add secondary muscle group if available
        if (template.getSecondaryMuscleGroup() != null) {
            this.muscleGroups.add(new MuscleGroupDto(
                    template.getSecondaryMuscleGroup().getId(),
                    template.getSecondaryMuscleGroup().getName()));
        }
    }

    // Static method to convert a list of templates
    public static List<ExerciseTemplateResponse> fromTemplateList(List<ExerciseTemplate> templates) {
        List<ExerciseTemplateResponse> responses = new ArrayList<>();
        for (ExerciseTemplate template : templates) {
            responses.add(new ExerciseTemplateResponse(template));
        }
        return responses;
    }

    // Muscle Group DTO for nested data
    public static class MuscleGroupDto {
        private String id;
        private String name;

        public MuscleGroupDto(String id, String name) {
            this.id = id;
            this.name = name;
        }

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }

    // Getters and setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isRequiresWeight() {
        return requiresWeight;
    }

    public void setRequiresWeight(boolean requiresWeight) {
        this.requiresWeight = requiresWeight;
    }

    public List<MuscleGroupDto> getMuscleGroups() {
        return muscleGroups;
    }

    public void setMuscleGroups(List<MuscleGroupDto> muscleGroups) {
        this.muscleGroups = muscleGroups;
    }
}
