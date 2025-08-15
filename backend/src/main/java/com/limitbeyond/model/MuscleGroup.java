package com.limitbeyond.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "muscle_groups")
public class MuscleGroup {
    @Id
    private String id;

    private String name;

    // Constructors
    public MuscleGroup() {
    }

    public MuscleGroup(String name) {
        this.name = name;
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
}
