package com.limitbeyond.dto.exercise;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ExerciseTemplateRequest {

    @NotBlank
    private String name;

    @NotNull
    private String primaryMuscleGroupId;

    private String secondaryMuscleGroupId;

    private String description;

    @NotNull
    private Boolean requiresWeight;

    // Getters and setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPrimaryMuscleGroupId() {
        return primaryMuscleGroupId;
    }

    public void setPrimaryMuscleGroupId(String primaryMuscleGroupId) {
        this.primaryMuscleGroupId = primaryMuscleGroupId;
    }

    public String getSecondaryMuscleGroupId() {
        return secondaryMuscleGroupId;
    }

    public void setSecondaryMuscleGroupId(String secondaryMuscleGroupId) {
        this.secondaryMuscleGroupId = secondaryMuscleGroupId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getRequiresWeight() {
        return requiresWeight;
    }

    public void setRequiresWeight(Boolean requiresWeight) {
        this.requiresWeight = requiresWeight;
    }
}
