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

        createExerciseTemplateIfNotExists("Bench Press", chest, triceps, "Lie on a flat bench and press the weight upward", true);
        createExerciseTemplateIfNotExists("Incline Bench Press", chest, shoulders, "Lie on an inclined bench and press the weight upward", true);
        createExerciseTemplateIfNotExists("Decline Bench Press", chest, triceps, "Lie on a declined bench and press the weight upward", true);
        createExerciseTemplateIfNotExists("Dumbbell Bench Press", chest, triceps, "Press dumbbells upward while lying on a bench", true);
        createExerciseTemplateIfNotExists("Dumbbell Fly", chest, null, "Lie on a bench with dumbbells extended to the sides, then bring them together in an arc", true);
        createExerciseTemplateIfNotExists("Cable Fly", chest, null, "Stand between cable machines and bring the handles together in front of you", true);
        createExerciseTemplateIfNotExists("Pec Deck Fly", chest, null, "Use a pec deck machine to bring the pads together in front of you", true);
        createExerciseTemplateIfNotExists("Push-Up", chest, triceps, "Standard push-up exercise", false);
        createExerciseTemplateIfNotExists("Dips (Chest Focus)", chest, triceps, "Lean forward while performing dips to emphasize the chest", true);
        createExerciseTemplateIfNotExists("Cable Crossover", chest, null, "Stand between cable machines and bring the handles together in front of you", true);
        createExerciseTemplateIfNotExists("Incline Dumbbell Fly", chest, null, "Lie on an inclined bench and perform a fly motion with dumbbells", true);
        createExerciseTemplateIfNotExists("Decline Dumbbell Fly", chest, null, "Lie on a declined bench and perform a fly motion with dumbbells", true);
        createExerciseTemplateIfNotExists("Chest Press Machine", chest, null, "Use a chest press machine to push the handles forward", true);
        createExerciseTemplateIfNotExists("Landmine Press", chest, shoulders, "Press one end of a barbell from the floor at an angle", true);
        createExerciseTemplateIfNotExists("Svend Press", chest, null, "Press two weight plates together in front of your chest", true);
        createExerciseTemplateIfNotExists("Resistance Band Chest Press", chest, triceps, "Press resistance bands forward to mimic a bench press", true);
        createExerciseTemplateIfNotExists("Single-Arm Dumbbell Press", chest, triceps, "Press a single dumbbell upward while lying on a bench", true);
        createExerciseTemplateIfNotExists("Guillotine Press", chest, null, "Lower a barbell to your neck and press upward", true);
        createExerciseTemplateIfNotExists("Floor Press", chest, triceps, "Lie on the floor and press a barbell or dumbbells upward", true);
        createExerciseTemplateIfNotExists("Archer Push-Up", chest, null, "Perform a push-up with one arm extended to the side", false);
        createExerciseTemplateIfNotExists("Wide-Grip Bench Press", chest, null, "Press a barbell with a wider than shoulder-width grip", true);
        createExerciseTemplateIfNotExists("Close-Grip Push-Up", chest, triceps, "Perform a push-up with hands close together", false);
        createExerciseTemplateIfNotExists("Spoto Press", chest, triceps, "Press a barbell from the bottom position of a bench press", true);
        createExerciseTemplateIfNotExists("Hex Press", chest, triceps, "Press two dumbbells together in front of your chest", true);
        createExerciseTemplateIfNotExists("Plyometric Push-Up", chest, null, "Explosively push off the ground during a push-up", false);
        createExerciseTemplateIfNotExists("Isometric Chest Squeeze", chest, null, "Press your palms together in front of your chest and hold", false);
    }

    private void createBackExercises() {
        MuscleGroup back = muscleGroupMap.get("Back");
        MuscleGroup biceps = muscleGroupMap.get("Biceps");
        MuscleGroup shoulders = muscleGroupMap.get("Shoulders");

        createExerciseTemplateIfNotExists("Deadlift", back, null, "Lift a barbell from the ground to a standing position", true);
        createExerciseTemplateIfNotExists("Pull-Up", back, biceps, "Pull your body upward by gripping an overhead bar", false);
        createExerciseTemplateIfNotExists("Lat Pulldown", back, biceps, "Pull a bar down to your chest while seated at a machine", true);
        createExerciseTemplateIfNotExists("Barbell Row", back, biceps, "Bend over and row a barbell toward your lower chest", true);
        createExerciseTemplateIfNotExists("Seated Cable Row", back, biceps, "Pull a cable attachment toward your torso while seated", true);
        createExerciseTemplateIfNotExists("T-Bar Row", back, biceps, "Row a T-bar toward your torso while bent over", true);
        createExerciseTemplateIfNotExists("Single-Arm Dumbbell Row", back, null, "Row a dumbbell with one arm while bent over a bench", true);
        createExerciseTemplateIfNotExists("Face Pull", back, shoulders, "Pull a rope attachment toward your face at a high cable station", true);
        createExerciseTemplateIfNotExists("Bent-Over Dumbbell Row", back, biceps, "Row dumbbells toward your hips while bent over", true);
        createExerciseTemplateIfNotExists("Reverse Grip Barbell Row", back, biceps, "Row a barbell with an underhand grip", true);
        createExerciseTemplateIfNotExists("Chin-Up", back, biceps, "Pull your body upward with an underhand grip", false);
        createExerciseTemplateIfNotExists("Straight-Arm Pulldown", back, null, "Pull a bar down with straight arms to target the lats", true);
        createExerciseTemplateIfNotExists("Rack Pull", back, null, "Lift a barbell from a rack to a standing position", true);
        createExerciseTemplateIfNotExists("Inverted Row", back, biceps, "Pull your body upward while lying under a bar", false);
        createExerciseTemplateIfNotExists("Single-Arm Lat Pulldown", back, biceps, "Pull a single handle down with one arm", true);
        createExerciseTemplateIfNotExists("Meadows Row", back, biceps, "Row a barbell with one end anchored and the other in hand", true);
        createExerciseTemplateIfNotExists("Shrug", back, null, "Lift your shoulders toward your ears to target the traps", true);
        createExerciseTemplateIfNotExists("Good Morning", back, null, "Bend forward at the hips with a barbell on your shoulders", true);
        createExerciseTemplateIfNotExists("Seal Row", back, null, "Lie face down on a bench and row a barbell", true);
        createExerciseTemplateIfNotExists("Renegade Row", back, null, "Row dumbbells while in a plank position", true);
        createExerciseTemplateIfNotExists("Pendlay Row", back, biceps, "Row a barbell explosively from the floor", true);
        createExerciseTemplateIfNotExists("Reverse Pec Deck Fly", back, shoulders, "Use a pec deck machine in reverse to target the rear delts", true);
        createExerciseTemplateIfNotExists("Trap Bar Deadlift", back, null, "Lift a trap bar from the ground to a standing position", true);
        createExerciseTemplateIfNotExists("Superman", back, null, "Lie face down and lift your arms and legs off the ground", false);
    }

    private void createShoulderExercises() {
        MuscleGroup shoulders = muscleGroupMap.get("Shoulders");
        MuscleGroup triceps = muscleGroupMap.get("Triceps");

        createExerciseTemplateIfNotExists("Overhead Press", shoulders, triceps, "Press a barbell or dumbbells overhead while standing", true);
        createExerciseTemplateIfNotExists("Lateral Raise", shoulders, null, "Raise weights out to your sides with a slight bend in the elbows", true);
        createExerciseTemplateIfNotExists("Front Raise", shoulders, null, "Raise weights in front of you with arms extended", true);
        createExerciseTemplateIfNotExists("Rear Delt Fly", shoulders, null, "Bend over and raise weights out to your sides to target the rear delts", true);
        createExerciseTemplateIfNotExists("Military Press", shoulders, triceps, "Strict overhead press with a barbell", true);
        createExerciseTemplateIfNotExists("Arnold Press", shoulders, triceps, "A rotational dumbbell press named after Arnold Schwarzenegger", true);
        createExerciseTemplateIfNotExists("Upright Row", shoulders, null, "Pull a barbell or dumbbells upward close to your body", true);
        createExerciseTemplateIfNotExists("Face Pull", shoulders, null, "Pull a rope attachment toward your face at a high cable station", true);
        createExerciseTemplateIfNotExists("Front Plate Raise", shoulders, null, "Raise a weight plate in front of you with both hands", true);
        createExerciseTemplateIfNotExists("Cable Lateral Raise", shoulders, null, "Raise a cable attachment out to your side", true);
        createExerciseTemplateIfNotExists("Bent-Over Lateral Raise", shoulders, null, "Bend over and raise weights out to your sides", true);
        createExerciseTemplateIfNotExists("Push Press", shoulders, triceps, "Use your legs to help press a barbell overhead", true);
        createExerciseTemplateIfNotExists("Landmine Press", shoulders, triceps, "Press one end of a barbell from the floor at an angle", true);
        createExerciseTemplateIfNotExists("Cuban Press", shoulders, null, "A rotational movement to target the rotator cuff", true);
        createExerciseTemplateIfNotExists("Bradford Press", shoulders, triceps, "Press a barbell behind and then in front of your head", true);
        createExerciseTemplateIfNotExists("Single-Arm Overhead Press", shoulders, triceps, "Press a dumbbell overhead with one arm", true);
        createExerciseTemplateIfNotExists("Behind-the-Neck Press", shoulders, triceps, "Press a barbell overhead from behind your neck", true);
        createExerciseTemplateIfNotExists("Leaning Lateral Raise", shoulders, null, "Lean away while raising a dumbbell to your side", true);
        createExerciseTemplateIfNotExists("Bottle Cap Raise", shoulders, null, "Raise a dumbbell with your thumb pointing down", true);
        createExerciseTemplateIfNotExists("Scaption", shoulders, null, "Raise weights at a 30-degree angle in front of you", true);
        createExerciseTemplateIfNotExists("Band Pull-Apart", shoulders, null, "Pull a resistance band apart to target the rear delts", true);
        createExerciseTemplateIfNotExists("Z Press", shoulders, triceps, "Press a barbell overhead while seated with legs extended", true);
        createExerciseTemplateIfNotExists("Bottoms-Up Kettlebell Press", shoulders, triceps, "Press a kettlebell overhead with the bottom facing up", true);
    }

    private void createBicepsExercises() {
        MuscleGroup biceps = muscleGroupMap.get("Biceps");
        MuscleGroup forearms = muscleGroupMap.get("Forearms");

        createExerciseTemplateIfNotExists("Barbell Curl", biceps, forearms, "Curl a barbell from a standing position", true);
        createExerciseTemplateIfNotExists("Dumbbell Curl", biceps, forearms, "Curl dumbbells one at a time or simultaneously", true);
        createExerciseTemplateIfNotExists("Hammer Curl", biceps, forearms, "Curl dumbbells with a neutral grip (palms facing each other)", true);
        createExerciseTemplateIfNotExists("Preacher Curl", biceps, forearms, "Curl using a preacher bench that supports your arms", true);
        createExerciseTemplateIfNotExists("Concentration Curl", biceps, null, "Seated curl with your elbow braced against your inner thigh", true);
        createExerciseTemplateIfNotExists("Chin-Up", biceps, null, "Pull your body upward with an underhand grip", false);
        createExerciseTemplateIfNotExists("Reverse Curl", biceps, forearms, "Curl a barbell with an overhand grip", true);
        createExerciseTemplateIfNotExists("Incline Dumbbell Curl", biceps, forearms, "Curl dumbbells while seated on an inclined bench", true);
        createExerciseTemplateIfNotExists("Cable Curl", biceps, forearms, "Curl a cable attachment while standing", true);
        createExerciseTemplateIfNotExists("EZ-Bar Curl", biceps, forearms, "Curl an EZ-bar from a standing position", true);
        createExerciseTemplateIfNotExists("Spider Curl", biceps, null, "Curl a barbell or dumbbells while leaning over an inclined bench", true);
        createExerciseTemplateIfNotExists("Drag Curl", biceps, null, "Curl a barbell while keeping it close to your torso", true);
        createExerciseTemplateIfNotExists("Zottman Curl", biceps, forearms, "Curl dumbbells up with palms up and down with palms down", true);
        createExerciseTemplateIfNotExists("21s", biceps, forearms, "Perform 7 partial curls at the bottom, 7 at the top, and 7 full curls", true);
        createExerciseTemplateIfNotExists("Cross-Body Hammer Curl", biceps, forearms, "Curl a dumbbell across your body", true);
        createExerciseTemplateIfNotExists("Reverse Grip Barbell Curl", biceps, forearms, "Curl a barbell with an overhand grip", true);
        createExerciseTemplateIfNotExists("Isometric Biceps Hold", biceps, null, "Hold a dumbbell at a 90-degree angle and resist movement", true);
        createExerciseTemplateIfNotExists("Resistance Band Curl", biceps, forearms, "Curl a resistance band while standing", true);
        createExerciseTemplateIfNotExists("Seated Dumbbell Curl", biceps, forearms, "Curl dumbbells while seated on a bench", true);
        createExerciseTemplateIfNotExists("Bayesian Curl", biceps, forearms, "Curl a barbell with a wide grip and elbows back", true);
    }

    private void createTricepsExercises() {
        MuscleGroup triceps = muscleGroupMap.get("Triceps");
        MuscleGroup chest = muscleGroupMap.get("Chest");

        createExerciseTemplateIfNotExists("Triceps Pushdown", triceps, null, "Push a bar or rope down using a high cable pulley", true);
        createExerciseTemplateIfNotExists("Close-Grip Bench Press", triceps, chest, "Bench press with hands closer together to target triceps", true);
        createExerciseTemplateIfNotExists("Skullcrusher", triceps, null, "Lower a barbell to your forehead while lying on a bench", true);
        createExerciseTemplateIfNotExists("Overhead Triceps Extension", triceps, null, "Extend a weight overhead while keeping upper arms stationary", true);
        createExerciseTemplateIfNotExists("Diamond Push-Up", triceps, chest, "Push-up with hands close together forming a diamond shape", false);
        createExerciseTemplateIfNotExists("Dips (Triceps Focus)", triceps, chest, "Keep your body upright while performing dips to emphasize the triceps", true);
        createExerciseTemplateIfNotExists("Lying Triceps Extension", triceps, null, "Extend a barbell or dumbbells overhead while lying on a bench", true);
        createExerciseTemplateIfNotExists("Triceps Kickback", triceps, null, "Extend a dumbbell backward while bent over", true);
        createExerciseTemplateIfNotExists("Cable Overhead Triceps Extension", triceps, null, "Extend a cable attachment overhead", true);
        createExerciseTemplateIfNotExists("Reverse Grip Triceps Pushdown", triceps, null, "Push a bar down with an underhand grip", true);
        createExerciseTemplateIfNotExists("Bench Dip", triceps, null, "Lower and raise your body using parallel bars or a bench", false);
        createExerciseTemplateIfNotExists("Single-Arm Overhead Dumbbell Extension", triceps, null, "Extend a dumbbell overhead with one arm", true);
        createExerciseTemplateIfNotExists("Close-Grip Push-Up", triceps, chest, "Perform a push-up with hands close together", false);
        createExerciseTemplateIfNotExists("JM Press", triceps, null, "A hybrid between a close-grip bench press and a skullcrusher", true);
        createExerciseTemplateIfNotExists("Tate Press", triceps, null, "Extend dumbbells downward while lying on a bench with elbows out", true);
        createExerciseTemplateIfNotExists("Resistance Band Triceps Extension", triceps, null, "Extend a resistance band overhead", true);
        createExerciseTemplateIfNotExists("Floor Skullcrusher", triceps, null, "Extend a barbell or dumbbells overhead while lying on the floor", true);
        createExerciseTemplateIfNotExists("EZ-Bar Overhead Triceps Extension", triceps, null, "Extend an EZ-bar overhead while keeping upper arms stationary", true);
        createExerciseTemplateIfNotExists("Rope Pushdown", triceps, null, "Push a rope attachment down using a high cable pulley", true);
    }

    private void createLegExercises() {
        MuscleGroup legs = muscleGroupMap.get("Legs");

        createExerciseTemplateIfNotExists("Squat", legs, null, "Bend your knees and lower your body while keeping the back straight", true);
        createExerciseTemplateIfNotExists("Leg Press", legs, null, "Push a weighted platform away from you using your legs", true);
        createExerciseTemplateIfNotExists("Leg Extension", legs, null, "Extend your legs using a machine that targets the quadriceps", true);
        createExerciseTemplateIfNotExists("Leg Curl", legs, null, "Curl your legs using a machine that targets the hamstrings", true);
        createExerciseTemplateIfNotExists("Romanian Deadlift", legs, null, "Deadlift variation that targets the hamstrings", true);
        createExerciseTemplateIfNotExists("Lunge", legs, null, "Step forward and lower your body until both knees are bent at 90 degrees", true);
        createExerciseTemplateIfNotExists("Bulgarian Split Squat", legs, null, "Perform a lunge with one foot elevated on a bench", true);
        createExerciseTemplateIfNotExists("Hack Squat", legs, null, "Use a hack squat machine to perform a squat-like movement", true);
        createExerciseTemplateIfNotExists("Front Squat", legs, null, "Squat with a barbell held in front of your body", true);
        createExerciseTemplateIfNotExists("Goblet Squat", legs, null, "Squat while holding a dumbbell or kettlebell at your chest", true);
        createExerciseTemplateIfNotExists("Step-Up", legs, null, "Step onto a bench or box and drive through your heel", true);
        createExerciseTemplateIfNotExists("Calf Raise", legs, null, "Raise your heels off the ground to target the calves", true);
        createExerciseTemplateIfNotExists("Glute-Ham Raise", legs, null, "Use a GHR machine to target the hamstrings and glutes", true);
        createExerciseTemplateIfNotExists("Hip Thrust", legs, null, "Thrust your hips upward while seated on the ground with a weight on your lap", true);
        createExerciseTemplateIfNotExists("Sumo Deadlift", legs, null, "Deadlift with a wide stance to target the inner thighs", true);
        createExerciseTemplateIfNotExists("Box Jump", legs, null, "Jump onto a box or platform from a standing position", false);
        createExerciseTemplateIfNotExists("Pistol Squat", legs, null, "Perform a squat on one leg", false);
        createExerciseTemplateIfNotExists("Seated Calf Raise", legs, null, "Raise your heels while seated to target the calves", true);
        createExerciseTemplateIfNotExists("Walking Lunge", legs, null, "Step forward into a lunge and continue walking", true);
        createExerciseTemplateIfNotExists("Wall Sit", legs, null, "Hold a seated position with your back against a wall", false);
        createExerciseTemplateIfNotExists("Sled Push", legs, null, "Push a weighted sled forward", true);
    }

    private void createAbsExercises() {
        MuscleGroup abs = muscleGroupMap.get("Abs");

        createExerciseTemplateIfNotExists("Crunch", abs, null, "Lie on your back and curl your shoulders toward your hips", false);
        createExerciseTemplateIfNotExists("Leg Raise", abs, null, "Lie on your back and raise your legs toward the ceiling", false);
        createExerciseTemplateIfNotExists("Plank", abs, null, "Hold a push-up position with your body in a straight line", false);
        createExerciseTemplateIfNotExists("Russian Twist", abs, null, "Sit with knees bent and twist your torso from side to side", true);
        createExerciseTemplateIfNotExists("Cable Crunch", abs, null, "Kneel in front of a cable machine and crunch downward", true);
        createExerciseTemplateIfNotExists("Hanging Leg Raise", abs, null, "Hang from a bar and raise your legs toward your chest", false);
        createExerciseTemplateIfNotExists("Ab Wheel Rollout", abs, null, "Roll an ab wheel forward and then back to the starting position", true);
        createExerciseTemplateIfNotExists("Bicycle Crunch", abs, null, "Lie on your back and bring your elbow to the opposite knee in a cycling motion", false);
        createExerciseTemplateIfNotExists("Reverse Crunch", abs, null, "Lie on your back and bring your knees toward your chest", false);
        createExerciseTemplateIfNotExists("Dragon Flag", abs, null, "Lie on a bench and lift your body to a vertical position", false);
        createExerciseTemplateIfNotExists("Side Plank", abs, null, "Hold a plank position on your side", false);
        createExerciseTemplateIfNotExists("Cable Woodchopper", abs, null, "Rotate your torso while pulling a cable attachment", true);
        createExerciseTemplateIfNotExists("Mountain Climber", abs, null, "Alternate bringing your knees toward your chest in a plank position", false);
        createExerciseTemplateIfNotExists("Flutter Kick", abs, null, "Lie on your back and alternate kicking your legs up and down", false);
        createExerciseTemplateIfNotExists("V-Up", abs, null, "Lie on your back and lift your torso and legs to form a V shape", false);
        createExerciseTemplateIfNotExists("Dead Bug", abs, null, "Lie on your back and extend opposite arm and leg while keeping your core engaged", false);
        createExerciseTemplateIfNotExists("Cable Kneeling Crunch", abs, null, "Kneel in front of a cable machine and crunch downward", true);
        createExerciseTemplateIfNotExists("Standing Cable Lift", abs, null, "Lift a cable attachment upward while standing", true);
        createExerciseTemplateIfNotExists("Hanging Knee Raise", abs, null, "Hang from a bar and raise your knees toward your chest", false);
        createExerciseTemplateIfNotExists("Plank with Shoulder Tap", abs, null, "Tap your shoulders while holding a plank position", false);
    }
}
