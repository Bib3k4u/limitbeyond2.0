package com.limitbeyond.dto.workout;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.limitbeyond.dto.exercise.ExerciseTemplateResponse;
import com.limitbeyond.model.MuscleGroup;
import com.limitbeyond.model.Workout;
import com.limitbeyond.model.WorkoutSet;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class WorkoutResponse {
    private String id;
    private String name;
    private String description;
    private UserSummary member;
    private UserSummary trainer;
    private List<WorkoutSetResponse> sets;

    // Aggregated view per exercise to align with example payloads
    private List<ExerciseEntry> exercises;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime scheduledDate;

    // Convenience date only and day-of-week exposure
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;
    private String dayOfWeek;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime completedDate;

    private boolean completed;
    private String notes;

    private List<MuscleGroupDto> targetMuscleGroups;

    public static class MuscleGroupDto {
        private String id;
        private String name;

        public MuscleGroupDto(String id, String name) {
            this.id = id;
            this.name = name;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    // Aggregated exercise entry matching example contract
    public static class ExerciseEntry {
        private String id; // exerciseTemplateId
        private SimpleExerciseTemplate exerciseTemplate;
        private List<SimpleSet> sets;
        private Double totalVolume;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public SimpleExerciseTemplate getExerciseTemplate() { return exerciseTemplate; }
        public void setExerciseTemplate(SimpleExerciseTemplate exerciseTemplate) { this.exerciseTemplate = exerciseTemplate; }
        public List<SimpleSet> getSets() { return sets; }
        public void setSets(List<SimpleSet> sets) { this.sets = sets; }
        public Double getTotalVolume() { return totalVolume; }
        public void setTotalVolume(Double totalVolume) { this.totalVolume = totalVolume; }
    }

    public static class SimpleExerciseTemplate {
        private String id;
        private String name;
        public SimpleExerciseTemplate(String id, String name) { this.id = id; this.name = name; }
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    public static class SimpleSet {
        private Integer reps;
        private Double weight;
        public SimpleSet(Integer reps, Double weight) { this.reps = reps; this.weight = weight; }
        public Integer getReps() { return reps; }
        public void setReps(Integer reps) { this.reps = reps; }
        public Double getWeight() { return weight; }
        public void setWeight(Double weight) { this.weight = weight; }
    }

    // Nested class for user summary
    public static class UserSummary {
        private String id;
        private String username;
        private String email;
        private String firstName;
        private String lastName;

        public UserSummary(String id, String username, String email, String firstName, String lastName) {
            this.id = id;
            this.username = username;
            this.email = email;
            this.firstName = firstName;
            this.lastName = lastName;
        }

        // Getters and setters
        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getFirstName() {
            return firstName;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }
    }

    // Nested class for workout set response
    public static class WorkoutSetResponse {
        private String id;
        private ExerciseTemplateResponse exercise;
        private int reps;
        private Double weight;
        private String notes;
        private boolean completed;

        public static WorkoutSetResponse fromWorkoutSet(WorkoutSet set) {
            WorkoutSetResponse response = new WorkoutSetResponse();
            response.setId(set.getId());
            response.setExercise(new ExerciseTemplateResponse(set.getExercise()));
            response.setReps(set.getReps());
            response.setWeight(set.getWeight());
            response.setNotes(set.getNotes());
            response.setCompleted(set.isCompleted());
            return response;
        }

        // Getters and setters
        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public ExerciseTemplateResponse getExercise() {
            return exercise;
        }

        public void setExercise(ExerciseTemplateResponse exercise) {
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
    }

    // Factory method to create response from model
    public static WorkoutResponse fromWorkout(Workout workout) {
        WorkoutResponse response = new WorkoutResponse();
        response.setId(workout.getId());
        response.setName(workout.getName());
        response.setDescription(workout.getDescription());

        if (workout.getMember() != null) {
            response.setMember(new UserSummary(
                    workout.getMember().getId(),
                    workout.getMember().getUsername(),
                    workout.getMember().getEmail(),
                    workout.getMember().getFirstName(),
                    workout.getMember().getLastName()));
        }

        if (workout.getTrainer() != null) {
            response.setTrainer(new UserSummary(
                    workout.getTrainer().getId(),
                    workout.getTrainer().getUsername(),
                    workout.getTrainer().getEmail(),
                    workout.getTrainer().getFirstName(),
                    workout.getTrainer().getLastName()));
        }

        List<WorkoutSetResponse> setResponses = new ArrayList<>();
        for (WorkoutSet set : workout.getSets()) {
            setResponses.add(WorkoutSetResponse.fromWorkoutSet(set));
        }
        response.setSets(setResponses);

        // Build aggregated exercises view
        Map<String, ExerciseEntry> aggregate = new HashMap<>();
        for (WorkoutSet set : workout.getSets()) {
            if (set.getExercise() == null) continue;
            String exId = set.getExercise().getId();
            ExerciseEntry entry = aggregate.computeIfAbsent(exId, k -> {
                ExerciseEntry ne = new ExerciseEntry();
                ne.setId(exId);
                ne.setExerciseTemplate(new SimpleExerciseTemplate(exId, set.getExercise().getName()));
                ne.setSets(new ArrayList<>());
                ne.setTotalVolume(0.0);
                return ne;
            });
            entry.getSets().add(new SimpleSet(set.getReps(), set.getWeight()));
            double vol = entry.getTotalVolume() != null ? entry.getTotalVolume() : 0.0;
            double weight = set.getWeight() != null ? set.getWeight() : 0.0;
            entry.setTotalVolume(vol + (set.getReps() * weight));
        }
        response.setExercises(new ArrayList<>(aggregate.values()));

        response.setScheduledDate(workout.getScheduledDate());
        if (workout.getScheduledDate() != null) {
            LocalDate d = workout.getScheduledDate().toLocalDate();
            response.setDate(d);
            DayOfWeek dow = d.getDayOfWeek();
            response.setDayOfWeek(dow.name());
        }
        response.setCompletedDate(workout.getCompletedDate());
        response.setCompleted(workout.isCompleted());
        response.setNotes(workout.getNotes());

        List<MuscleGroupDto> mgDtos = new ArrayList<>();
        if (workout.getTargetMuscleGroups() != null) {
            for (MuscleGroup mg : workout.getTargetMuscleGroups()) {
                mgDtos.add(new MuscleGroupDto(mg.getId(), mg.getName()));
            }
        }
        response.setTargetMuscleGroups(mgDtos);

        return response;
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

    public UserSummary getMember() {
        return member;
    }

    public void setMember(UserSummary member) {
        this.member = member;
    }

    public UserSummary getTrainer() {
        return trainer;
    }

    public void setTrainer(UserSummary trainer) {
        this.trainer = trainer;
    }

    public List<WorkoutSetResponse> getSets() {
        return sets;
    }

    public void setSets(List<WorkoutSetResponse> sets) {
        this.sets = sets;
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
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<MuscleGroupDto> getTargetMuscleGroups() {
        return targetMuscleGroups;
    }

    public void setTargetMuscleGroups(List<MuscleGroupDto> targetMuscleGroups) {
        this.targetMuscleGroups = targetMuscleGroups;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(String dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public List<ExerciseEntry> getExercises() { return exercises; }
    public void setExercises(List<ExerciseEntry> exercises) { this.exercises = exercises; }
}
