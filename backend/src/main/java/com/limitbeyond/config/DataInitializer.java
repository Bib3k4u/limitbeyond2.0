package com.limitbeyond.config;

import com.limitbeyond.model.ExerciseTemplate;
import com.limitbeyond.model.MuscleGroup;
import com.limitbeyond.repository.ExerciseTemplateRepository;
import com.limitbeyond.repository.MuscleGroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private ExerciseTemplateRepository exerciseTemplateRepository;

    @Autowired
    private MuscleGroupRepository muscleGroupRepository;

    @Override
    public void run(String... args) throws Exception {
        // Initialize muscle groups if they don't exist
        initializeMuscleGroups();
        
        // Initialize exercise templates if they don't exist
        initializeExerciseTemplates();
    }

    private void initializeMuscleGroups() {
        if (muscleGroupRepository.count() == 0) {
            List<MuscleGroup> muscleGroups = Arrays.asList(
                createMuscleGroup("Chest", "Pectoral muscles"),
                createMuscleGroup("Back", "Back muscles including lats and rhomboids"),
                createMuscleGroup("Shoulders", "Deltoid muscles"),
                createMuscleGroup("Biceps", "Biceps brachii"),
                createMuscleGroup("Triceps", "Triceps brachii"),
                createMuscleGroup("Quads", "Quadriceps femoris"),
                createMuscleGroup("Hamstrings", "Hamstring muscles"),
                createMuscleGroup("Glutes", "Gluteal muscles"),
                createMuscleGroup("Calves", "Calf muscles"),
                createMuscleGroup("Core", "Abdominal and core muscles")
            );

            muscleGroupRepository.saveAll(muscleGroups);
            System.out.println("Muscle groups initialized");
        }
    }

    private void initializeExerciseTemplates() {
        if (exerciseTemplateRepository.count() == 0) {
            List<ExerciseTemplate> exercises = Arrays.asList(
                // Basic bodyweight exercises (used in templates)
                createExercise("Push-ups", "Basic push-ups for chest and triceps", "Chest"),
                createExercise("Pull-ups", "Bodyweight pull-ups for back and biceps", "Back"),
                createExercise("Dips", "Bodyweight dips for triceps and chest", "Triceps"),
                createExercise("Squats", "Bodyweight squats for leg strength", "Quads"),
                createExercise("Lunges", "Walking lunges for leg development", "Quads"),
                createExercise("Planks", "Plank hold for core stability", "Core"),
                createExercise("Side Planks", "Side plank for core and obliques", "Core"),
                createExercise("Glute Bridges", "Glute bridges for glute activation", "Glutes"),
                createExercise("Calf Raises", "Standing calf raises", "Calves"),
                createExercise("Burpees", "Full body conditioning exercise", "Core"),
                createExercise("Mountain Climbers", "Dynamic core exercise", "Core"),
                createExercise("Bird Dogs", "Core stability exercise", "Core"),
                createExercise("Dead Bugs", "Core control exercise", "Core"),
                createExercise("Superman", "Back strengthening exercise", "Back"),
                createExercise("Rows", "Bodyweight rows for back", "Back"),
                
                // Additional basic exercises
                createExercise("Jumping Jacks", "Cardiovascular exercise", "Core"),
                createExercise("High Knees", "Cardiovascular exercise", "Core"),
                createExercise("Butterfly Kicks", "Core exercise", "Core"),
                createExercise("Russian Twists", "Core rotation exercise", "Core"),
                createExercise("Wall Sit", "Isometric leg exercise", "Quads"),
                createExercise("Step-ups", "Leg exercise using stairs or platform", "Quads"),
                createExercise("Donkey Kicks", "Glute exercise", "Glutes"),
                createExercise("Fire Hydrants", "Glute and hip exercise", "Glutes"),
                createExercise("Cobra Stretch", "Back stretch and strengthen", "Back"),
                createExercise("Cat-Cow Stretch", "Spine mobility exercise", "Back"),
                
                // Weighted exercises (if available)
                createExercise("Bench Press", "Flat bench press for chest development", "Chest"),
                createExercise("Incline Barbell Press", "Incline press targeting upper chest", "Chest"),
                createExercise("Incline Dumbbell Press", "Incline dumbbell press for chest", "Chest"),
                createExercise("Dumbbell Flyes", "Dumbbell flyes for chest isolation", "Chest"),
                createExercise("Close Grip Bench Press", "Close grip bench for triceps focus", "Chest"),
                
                // Back exercises
                createExercise("Deadlift", "Conventional deadlift for overall back strength", "Back"),
                createExercise("Barbell Rows", "Barbell rows for back thickness", "Back"),
                createExercise("T-Bar Rows", "T-bar rows for back development", "Back"),
                createExercise("Lat Pulldowns", "Lat pulldowns for back width", "Back"),
                createExercise("Single Arm Dumbbell Rows", "Single arm rows for back", "Back"),
                
                // Shoulder exercises
                createExercise("Military Press", "Military press for shoulder strength", "Shoulders"),
                createExercise("Arnold Press", "Arnold press with rotation", "Shoulders"),
                createExercise("Lateral Raises", "Lateral raises for side delts", "Shoulders"),
                createExercise("Front Raises", "Front raises for front delts", "Shoulders"),
                createExercise("Face Pulls", "Face pulls for rear delts", "Shoulders"),
                
                // Biceps exercises
                createExercise("Barbell Curls", "Barbell curls for biceps", "Biceps"),
                createExercise("Hammer Curls", "Hammer curls for biceps and forearms", "Biceps"),
                createExercise("Preacher Curls", "Preacher curls for strict form", "Biceps"),
                createExercise("Concentration Curls", "Concentration curls for peak contraction", "Biceps"),
                
                // Triceps exercises
                createExercise("Tricep Pushdowns", "Cable tricep pushdowns", "Triceps"),
                createExercise("Overhead Tricep Extension", "Overhead tricep extensions", "Triceps"),
                
                // Leg exercises
                createExercise("Leg Press", "Leg press machine for quads", "Quads"),
                createExercise("Leg Extensions", "Leg extensions for quad isolation", "Quads"),
                createExercise("Hack Squats", "Hack squats for quad development", "Quads"),
                createExercise("Romanian Deadlift", "Romanian deadlift for hamstrings", "Hamstrings"),
                createExercise("Leg Curls", "Leg curls for hamstring isolation", "Hamstrings"),
                createExercise("Good Mornings", "Good mornings for hamstrings", "Hamstrings"),
                createExercise("Seated Calf Raises", "Seated calf raises", "Calves"),
                
                // Core exercises
                createExercise("Crunches", "Crunches for abdominal development", "Core")
            );

            exerciseTemplateRepository.saveAll(exercises);
            System.out.println("Exercise templates initialized");
        }
    }

    private MuscleGroup createMuscleGroup(String name, String description) {
        MuscleGroup muscleGroup = new MuscleGroup(name);
        return muscleGroup;
    }

    private ExerciseTemplate createExercise(String name, String description, String muscleGroupName) {
        ExerciseTemplate exercise = new ExerciseTemplate();
        exercise.setName(name);
        exercise.setDescription(description);
        exercise.setRequiresWeight(true); // Most exercises require weight
        
        // Find the muscle group by name
        muscleGroupRepository.findByName(muscleGroupName).ifPresent(muscleGroup -> {
            exercise.setPrimaryMuscleGroup(muscleGroup);
        });
        
        return exercise;
    }
}