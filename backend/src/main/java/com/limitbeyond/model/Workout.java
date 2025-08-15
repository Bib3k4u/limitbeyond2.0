package com.limitbeyond.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "workouts")
public class Workout {
    @Id
    private String id;

    @DBRef
    private User member; // The member doing the workout

    @DBRef
    private User trainer; // Optional, the trainer who created/assigned the workout

    private String name;
    private String description;

    @DBRef
    private List<WorkoutSet> sets = new ArrayList<>();

    // New: explicitly store target muscle groups selected for this workout
    @DBRef
    private List<MuscleGroup> targetMuscleGroups = new ArrayList<>();

    private LocalDateTime scheduledDate; // When the workout is scheduled for
    private LocalDateTime completedDate; // When the workout was completed
    private boolean completed;
    private String notes; // Optional notes about the workout

    // Default constructor
    public Workout() {
    }

    // Constructor with required fields
    public Workout(String name, User member) {
        this.name = name;
        this.member = member;
        this.completed = false;
    }

    // Getters and setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public User getMember() {
        return member;
    }

    public void setMember(User member) {
        this.member = member;
    }

    public User getTrainer() {
        return trainer;
    }

    public void setTrainer(User trainer) {
        this.trainer = trainer;
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

    public List<WorkoutSet> getSets() {
        return sets;
    }

    public void setSets(List<WorkoutSet> sets) {
        this.sets = sets;
    }

    public void addSet(WorkoutSet set) {
        if (this.sets == null) {
            this.sets = new ArrayList<>();
        }
        this.sets.add(set);
    }

    public List<MuscleGroup> getTargetMuscleGroups() {
        return targetMuscleGroups;
    }

    public void setTargetMuscleGroups(List<MuscleGroup> targetMuscleGroups) {
        this.targetMuscleGroups = targetMuscleGroups;
    }

    public void addTargetMuscleGroup(MuscleGroup muscleGroup) {
        if (this.targetMuscleGroups == null) {
            this.targetMuscleGroups = new ArrayList<>();
        }
        this.targetMuscleGroups.add(muscleGroup);
    }

    public LocalDateTime getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(LocalDateTime scheduledDate) {
        this.scheduledDate = scheduledDate;
    }

    public LocalDateTime getCompletedDate() {
        return completedDate;
    }

    public void setCompletedDate(LocalDateTime completedDate) {
        this.completedDate = completedDate;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
        if (completed) {
            this.completedDate = LocalDateTime.now();
        }
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
