package com.limitbeyond.model;

import org.springframework.data.annotation.Id;

/**
 * WorkoutSet is now embedded inside Workout — NOT a top-level MongoDB document.
 * Removing @Document and @DBRef eliminates the N+1 query explosion:
 * previously each WorkoutSet (and its @DBRef exercise) triggered individual DB round-trips.
 * Now the entire workout including all sets loads in a single query.
 *
 * IDs are assigned manually (UUID) when sets are created.
 */
public class WorkoutSet {
    @Id
    private String id;

    // Embedded inline — no @DBRef, no separate collection lookup
    private ExerciseTemplate exercise;

    private int reps;
    private Double weight; // Optional, may be null for bodyweight exercises
    private String notes; // Optional notes about the set
    private boolean completed;

    // New: store computed volume for this set (reps * weight, weight defaults to 0)
    private Double volume;

    // Default constructor
    public WorkoutSet() {
    }

    // Constructor with required fields
    public WorkoutSet(ExerciseTemplate exercise, int reps) {
        this.exercise = exercise;
        this.reps = reps;
        this.completed = false;
    }

    // Getters and setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public ExerciseTemplate getExercise() {
        return exercise;
    }

    public void setExercise(ExerciseTemplate exercise) {
        this.exercise = exercise;
    }

    public int getReps() {
        return reps;
    }

    public void setReps(int reps) {
        this.reps = reps;
    }

    public Double getWeight() {
        return weight;
    }

    public void setWeight(Double weight) {
        this.weight = weight;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public Double getVolume() {
        return volume;
    }

    public void setVolume(Double volume) {
        this.volume = volume;
    }

}
