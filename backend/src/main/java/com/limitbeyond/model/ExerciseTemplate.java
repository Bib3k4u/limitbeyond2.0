package com.limitbeyond.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "exercise_templates")
public class ExerciseTemplate {
    @Id
    private String id;

    private String name;

    @DBRef(lazy = false)
    private MuscleGroup primaryMuscleGroup;

    @DBRef(lazy = false)
    private MuscleGroup secondaryMuscleGroup;


    private String description;

    private Boolean requiresWeight;

    // Constructors
    public ExerciseTemplate() {
    }

    public ExerciseTemplate(String name, MuscleGroup primaryMuscleGroup, String description, Boolean requiresWeight) {
        this.name = name;
        this.primaryMuscleGroup = primaryMuscleGroup;
        this.description = description;
        this.requiresWeight = requiresWeight;
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

    public MuscleGroup getPrimaryMuscleGroup() {
        return primaryMuscleGroup;
    }

    public void setPrimaryMuscleGroup(MuscleGroup primaryMuscleGroup) {
        this.primaryMuscleGroup = primaryMuscleGroup;
    }

    public MuscleGroup getSecondaryMuscleGroup() {
        return secondaryMuscleGroup;
    }

    public void setSecondaryMuscleGroup(MuscleGroup secondaryMuscleGroup) {
        this.secondaryMuscleGroup = secondaryMuscleGroup;
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
