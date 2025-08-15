package com.limitbeyond.dto.workout;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class WorkoutRequest {
    @NotBlank
    private String name;

    private String description;

    // Optional: when creating for current user, this may be null; else required
    private String memberId; // The member who will perform the workout

    private String trainerId; // Optional: The trainer assigning the workout

    private List<WorkoutSetRequest> sets;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime scheduledDate;

    // Convenience: allow simple ISO date via "date" separate from scheduledDate
    @JsonProperty("date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate scheduledLocalDate;

    // Target muscle groups the workout aims to train
    private List<String> targetMuscleGroupIds;

    private String notes;

    // Nested class for workout sets
    public static class WorkoutSetRequest {
        @NotNull
        private String exerciseId;

        @NotNull
        private Integer reps;

        private Double weight;

        private String notes;

        // Getters and setters
        public String getExerciseId() {
            return exerciseId;
        }

        public void setExerciseId(String exerciseId) {
            this.exerciseId = exerciseId;
        }

        public Integer getReps() {
            return reps;
        }

        public void setReps(Integer reps) {
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
    }

    // Getters and setters for main class
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

    public String getMemberId() {
        return memberId;
    }

    public void setMemberId(String memberId) {
        this.memberId = memberId;
    }

    public String getTrainerId() {
        return trainerId;
    }

    public void setTrainerId(String trainerId) {
        this.trainerId = trainerId;
    }

    public List<WorkoutSetRequest> getSets() {
        return sets;
    }

    public void setSets(List<WorkoutSetRequest> sets) {
        this.sets = sets;
    }

    public LocalDateTime getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(LocalDateTime scheduledDate) {
        this.scheduledDate = scheduledDate;
    }

    public LocalDate getScheduledLocalDate() {
        return scheduledLocalDate;
    }

    public void setScheduledLocalDate(LocalDate scheduledLocalDate) {
        this.scheduledLocalDate = scheduledLocalDate;
    }

    public List<String> getTargetMuscleGroupIds() {
        return targetMuscleGroupIds;
    }

    public void setTargetMuscleGroupIds(List<String> targetMuscleGroupIds) {
        this.targetMuscleGroupIds = targetMuscleGroupIds;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
