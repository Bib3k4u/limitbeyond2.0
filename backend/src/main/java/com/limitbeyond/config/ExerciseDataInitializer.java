package com.limitbeyond.config;

import com.limitbeyond.model.ExerciseTemplate;
import com.limitbeyond.model.MuscleGroup;
import com.limitbeyond.repository.ExerciseTemplateRepository;
import com.limitbeyond.repository.MuscleGroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Component
@Order(2) // Run after user initialization
public class ExerciseDataInitializer implements CommandLineRunner {

    @Autowired
    private MuscleGroupRepository muscleGroupRepository;

    @Autowired
    private ExerciseTemplateRepository exerciseTemplateRepository;

    private Map<String, MuscleGroup> muscleGroupMap = new HashMap<>();

    @Override
    public void run(String... args) {
        if (exerciseTemplateRepository.count() == 0) {
            System.out.println("Initializing exercise data...");

            // Create muscle groups and store them in the map
            muscleGroupMap.put("Chest", createMuscleGroupIfNotExists("Chest"));
            muscleGroupMap.put("Back", createMuscleGroupIfNotExists("Back"));
            muscleGroupMap.put("Shoulders", createMuscleGroupIfNotExists("Shoulders"));
            muscleGroupMap.put("Biceps", createMuscleGroupIfNotExists("Biceps"));
            muscleGroupMap.put("Triceps", createMuscleGroupIfNotExists("Triceps"));
            muscleGroupMap.put("Legs", createMuscleGroupIfNotExists("Legs"));
            muscleGroupMap.put("Abs", createMuscleGroupIfNotExists("Abs"));
            muscleGroupMap.put("Forearms", createMuscleGroupIfNotExists("Forearms"));

            // Create exercise templates for each muscle group
            createChestExercises();
            createBackExercises();
            createShoulderExercises();
            createBicepsExercises();
            createTricepsExercises();
            createLegExercises();
            createAbsExercises();

            System.out.println("Exercise data initialization completed");
        }
    }

    private MuscleGroup createMuscleGroupIfNotExists(String name) {
        Optional<MuscleGroup> existingGroup = muscleGroupRepository.findByName(name);
        if (existingGroup.isPresent()) {
            return existingGroup.get();
        } else {
            MuscleGroup muscleGroup = new MuscleGroup(name);
            return muscleGroupRepository.save(muscleGroup);
        }
    }

    private void createExerciseTemplateIfNotExists(String name, MuscleGroup primaryMuscleGroup,
            MuscleGroup secondaryMuscleGroup, String description, Boolean requiresWeight) {
        if (!exerciseTemplateRepository.findByName(name).isPresent()) {
            ExerciseTemplate template = new ExerciseTemplate(name, primaryMuscleGroup, description, requiresWeight);
            if (secondaryMuscleGroup != null) {
                template.setSecondaryMuscleGroup(secondaryMuscleGroup);
            }
            exerciseTemplateRepository.save(template);
        }
    }

    private void createChestExercises() {
        MuscleGroup chest = muscleGroupMap.get("Chest");
        MuscleGroup triceps = muscleGroupMap.get("Triceps");
        MuscleGroup shoulders = muscleGroupMap.get("Shoulders");

        createExerciseTemplateIfNotExists("Bench Press", chest, triceps,
                "Lie on a flat bench and press the weight upward", true);
        createExerciseTemplateIfNotExists("Incline Bench Press", chest, shoulders,
                "Lie on an inclined bench and press the weight upward", true);
        createExerciseTemplateIfNotExists("Dumbbell Fly", chest, null,
                "Lie on a bench with dumbbells extended to the sides, then bring them together in an arc", true);
        createExerciseTemplateIfNotExists("Push-Up", chest, triceps,
                "Standard push-up exercise", false);
        createExerciseTemplateIfNotExists("Cable Crossover", chest, null,
                "Stand between cable machines and bring the handles together in front of you", true);
    }

    private void createBackExercises() {
        MuscleGroup back = muscleGroupMap.get("Back");
        MuscleGroup biceps = muscleGroupMap.get("Biceps");

        createExerciseTemplateIfNotExists("Deadlift", back, null,
                "Lift a barbell from the ground to a standing position", true);
        createExerciseTemplateIfNotExists("Pull-Up", back, biceps,
                "Pull your body upward by gripping an overhead bar", false);
        createExerciseTemplateIfNotExists("Barbell Row", back, biceps,
                "Bend over and row a barbell toward your lower chest", true);
        createExerciseTemplateIfNotExists("Lat Pulldown", back, biceps,
                "Pull a bar down to your chest while seated at a machine", true);
        createExerciseTemplateIfNotExists("Face Pull", back, null,
                "Pull a rope attachment toward your face at a high cable station", true);
    }

    private void createShoulderExercises() {
        MuscleGroup shoulders = muscleGroupMap.get("Shoulders");
        MuscleGroup triceps = muscleGroupMap.get("Triceps");

        createExerciseTemplateIfNotExists("Overhead Press", shoulders, triceps,
                "Press a barbell or dumbbells overhead while standing", true);
        createExerciseTemplateIfNotExists("Lateral Raise", shoulders, null,
                "Raise weights out to your sides with a slight bend in the elbows", true);
        createExerciseTemplateIfNotExists("Front Raise", shoulders, null,
                "Raise weights in front of you with arms extended", true);
        createExerciseTemplateIfNotExists("Military Press", shoulders, triceps,
                "Strict overhead press with a barbell", true);
        createExerciseTemplateIfNotExists("Arnold Press", shoulders, triceps,
                "A rotational dumbbell press named after Arnold Schwarzenegger", true);
    }

    private void createBicepsExercises() {
        MuscleGroup biceps = muscleGroupMap.get("Biceps");
        MuscleGroup forearms = muscleGroupMap.get("Forearms");

        createExerciseTemplateIfNotExists("Barbell Curl", biceps, forearms,
                "Curl a barbell from a standing position", true);
        createExerciseTemplateIfNotExists("Dumbbell Curl", biceps, forearms,
                "Curl dumbbells one at a time or simultaneously", true);
        createExerciseTemplateIfNotExists("Hammer Curl", biceps, forearms,
                "Curl dumbbells with a neutral grip (palms facing each other)", true);
        createExerciseTemplateIfNotExists("Preacher Curl", biceps, forearms,
                "Curl using a preacher bench that supports your arms", true);
        createExerciseTemplateIfNotExists("Concentration Curl", biceps, null,
                "Seated curl with your elbow braced against your inner thigh", true);
    }

    private void createTricepsExercises() {
        MuscleGroup triceps = muscleGroupMap.get("Triceps");
        MuscleGroup chest = muscleGroupMap.get("Chest");

        createExerciseTemplateIfNotExists("Triceps Pushdown", triceps, null,
                "Push a bar or rope down using a high cable pulley", true);
        createExerciseTemplateIfNotExists("Close-Grip Bench Press", triceps, chest,
                "Bench press with hands closer together to target triceps", true);
        createExerciseTemplateIfNotExists("Skullcrusher", triceps, null,
                "Lower a barbell to your forehead while lying on a bench", true);
        createExerciseTemplateIfNotExists("Overhead Triceps Extension", triceps, null,
                "Extend a weight overhead while keeping upper arms stationary", true);
        createExerciseTemplateIfNotExists("Diamond Push-Up", triceps, chest,
                "Push-up with hands close together forming a diamond shape", false);
    }

    private void createLegExercises() {
        MuscleGroup legs = muscleGroupMap.get("Legs");

        createExerciseTemplateIfNotExists("Squat", legs, null,
                "Bend your knees and lower your body while keeping the back straight", true);
        createExerciseTemplateIfNotExists("Leg Press", legs, null,
                "Push a weighted platform away from you using your legs", true);
        createExerciseTemplateIfNotExists("Leg Extension", legs, null,
                "Extend your legs using a machine that targets the quadriceps", true);
        createExerciseTemplateIfNotExists("Leg Curl", legs, null,
                "Curl your legs using a machine that targets the hamstrings", true);
        createExerciseTemplateIfNotExists("Romanian Deadlift", legs, null,
                "Deadlift variation that targets the hamstrings", true);
    }

    private void createAbsExercises() {
        MuscleGroup abs = muscleGroupMap.get("Abs");

        createExerciseTemplateIfNotExists("Crunch", abs, null,
                "Lie on your back and curl your shoulders toward your hips", false);
        createExerciseTemplateIfNotExists("Leg Raise", abs, null,
                "Lie on your back and raise your legs toward the ceiling", false);
        createExerciseTemplateIfNotExists("Plank", abs, null,
                "Hold a push-up position with your body in a straight line", false);
        createExerciseTemplateIfNotExists("Russian Twist", abs, null,
                "Sit with knees bent and twist your torso from side to side", true);
        createExerciseTemplateIfNotExists("Cable Crunch", abs, null,
                "Kneel in front of a cable machine and crunch downward", true);
    }
}
