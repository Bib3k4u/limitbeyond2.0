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
@Order(2)
public class ExerciseDataInitializer implements CommandLineRunner {

    @Autowired
    private MuscleGroupRepository muscleGroupRepository;

    @Autowired
    private ExerciseTemplateRepository exerciseTemplateRepository;

    private Map<String, MuscleGroup> mg = new HashMap<>();

    @Override
    public void run(String... args) {
        if (exerciseTemplateRepository.count() == 0) {
            System.out.println("Initializing exercise data...");

            // ── Muscle groups ──────────────────────────────────────────────
            mg.put("Chest",     createMuscleGroup("Chest"));
            mg.put("Back",      createMuscleGroup("Back"));
            mg.put("Shoulders", createMuscleGroup("Shoulders"));
            mg.put("Biceps",    createMuscleGroup("Biceps"));
            mg.put("Triceps",   createMuscleGroup("Triceps"));
            mg.put("Legs",      createMuscleGroup("Legs"));
            mg.put("Glutes",    createMuscleGroup("Glutes"));
            mg.put("Calves",    createMuscleGroup("Calves"));
            mg.put("Abs",       createMuscleGroup("Abs"));
            mg.put("Forearms",  createMuscleGroup("Forearms"));
            mg.put("Cardio",    createMuscleGroup("Cardio"));

            // ── Exercises ──────────────────────────────────────────────────
            createChestExercises();
            createBackExercises();
            createShoulderExercises();
            createBicepsExercises();
            createTricepsExercises();
            createLegExercises();
            createGlutesExercises();
            createCalvesExercises();
            createAbsExercises();
            createForearmsExercises();
            createCardioExercises();

            System.out.println("Exercise data initialization completed.");
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private MuscleGroup createMuscleGroup(String name) {
        return muscleGroupRepository.findByName(name)
                .orElseGet(() -> muscleGroupRepository.save(new MuscleGroup(name)));
    }

    private void ex(String name, String primary, String secondary, String description, boolean weight) {
        if (exerciseTemplateRepository.findByName(name).isPresent()) return;
        ExerciseTemplate t = new ExerciseTemplate(name, mg.get(primary), description, weight);
        if (secondary != null) t.setSecondaryMuscleGroup(mg.get(secondary));
        exerciseTemplateRepository.save(t);
    }

    // ── CHEST (20 exercises) ──────────────────────────────────────────────────

    private void createChestExercises() {
        // Barbell
        ex("Barbell Bench Press",          "Chest", "Triceps",   "Flat bench barbell press — king of chest exercises", true);
        ex("Incline Barbell Bench Press",  "Chest", "Shoulders", "Barbell press on an incline bench to hit upper chest", true);
        ex("Decline Barbell Bench Press",  "Chest", "Triceps",   "Barbell press on a decline bench to hit lower chest", true);
        ex("Close-Grip Barbell Bench",     "Chest", "Triceps",   "Narrow grip bench press; shifts load to triceps and inner chest", true);
        ex("Spoto Press",                  "Chest", "Triceps",   "Pause the bar 1 inch off the chest then press — builds bottom strength", true);
        // Dumbbell
        ex("Dumbbell Bench Press",         "Chest", "Triceps",   "Press dumbbells on a flat bench for greater range of motion", true);
        ex("Incline Dumbbell Press",       "Chest", "Shoulders", "Dumbbell press on an incline bench — isolates upper chest", true);
        ex("Dumbbell Fly",                 "Chest", null,        "Lie flat, arc dumbbells out wide and squeeze them together at the top", true);
        ex("Incline Dumbbell Fly",         "Chest", null,        "Same fly motion on an incline bench for upper chest stretch", true);
        ex("Decline Dumbbell Press",       "Chest", "Triceps",   "Dumbbell press on a decline bench for lower chest emphasis", true);
        ex("Hex Press",                    "Chest", "Triceps",   "Press two dumbbells pressed together on a flat bench — constant tension", true);
        ex("Floor Press (Dumbbell)",       "Chest", "Triceps",   "Dumbbell press from the floor — limits shoulder strain", true);
        // Cable / Machine
        ex("Cable Fly (Low to High)",      "Chest", null,        "Pull low cable handles upward and together — hits upper chest", true);
        ex("Cable Fly (High to Low)",      "Chest", null,        "Pull high cable handles downward and together — hits lower chest", true);
        ex("Cable Crossover",              "Chest", null,        "Cross cables in front of your chest with both arms simultaneously", true);
        ex("Pec Deck Machine",             "Chest", null,        "Bring padded arms together in a machine for isolation work", true);
        ex("Chest Press Machine",          "Chest", "Triceps",   "Guided press machine; great for beginners and drop sets", true);
        ex("Seated Cable Chest Press",     "Chest", "Triceps",   "Press cable handles forward while seated — constant cable tension", true);
        // Bodyweight
        ex("Push-Up",                      "Chest", "Triceps",   "Classic bodyweight push-up; adjust hand width for different emphasis", false);
        ex("Wide-Grip Push-Up",            "Chest", null,        "Hands placed wider than shoulder-width to increase pec stretch", false);
        ex("Decline Push-Up",              "Chest", "Shoulders", "Feet elevated to shift load onto upper chest", false);
        ex("Diamond Push-Up",              "Chest", "Triceps",   "Hands form a diamond shape — targets inner chest and triceps", false);
        // Kettlebell
        ex("Kettlebell Floor Press",       "Chest", "Triceps",   "Single or double kettlebell press from the floor", true);
        ex("Kettlebell Svend Press",       "Chest", null,        "Press a kettlebell between your palms outward from your chest", true);
    }

    // ── BACK (22 exercises) ───────────────────────────────────────────────────

    private void createBackExercises() {
        // Barbell
        ex("Conventional Deadlift",        "Back", null,        "Lift a barbell from the floor to hip extension — full posterior chain", true);
        ex("Sumo Deadlift",                "Back", "Legs",      "Wide-stance deadlift targeting inner thighs and lower back", true);
        ex("Barbell Bent-Over Row",        "Back", "Biceps",    "Hinge at hips and row a barbell to your lower chest", true);
        ex("Pendlay Row",                  "Back", "Biceps",    "Explosive row from a dead stop on the floor each rep", true);
        ex("Reverse-Grip Barbell Row",     "Back", "Biceps",    "Underhand barbell row — more biceps and lower lat involvement", true);
        ex("Rack Pull",                    "Back", null,        "Partial deadlift from knee height — trains upper back and traps", true);
        ex("Good Morning",                 "Back", "Legs",      "Bar on upper back, hinge forward — strengthens erectors and hamstrings", true);
        // Dumbbell
        ex("Single-Arm Dumbbell Row",      "Back", "Biceps",    "Brace on a bench and row one dumbbell — great for lat width", true);
        ex("Dumbbell Bent-Over Row",       "Back", "Biceps",    "Both arms row simultaneously while hinged at the hips", true);
        ex("Renegade Row",                 "Back", "Abs",       "Row dumbbells alternately from a plank position", true);
        ex("Meadows Row",                  "Back", "Biceps",    "Landmine-style unilateral row for lat thickness", true);
        ex("Dumbbell Seal Row",            "Back", null,        "Lie face-down on a raised bench and row to eliminate body swing", true);
        // Cable / Machine
        ex("Lat Pulldown",                 "Back", "Biceps",    "Pull a wide bar down to your chest at a cable station", true);
        ex("Close-Grip Lat Pulldown",      "Back", "Biceps",    "Narrow grip pulldown — emphasises lower lats", true);
        ex("Seated Cable Row",             "Back", "Biceps",    "Pull a cable row handle to your torso while seated", true);
        ex("Straight-Arm Pulldown",        "Back", null,        "Keep arms straight and pull the cable bar to your thighs — lat isolation", true);
        ex("Face Pull",                    "Back", "Shoulders", "Pull a rope to your face at a high cable — rear delts and external rotators", true);
        ex("Cable Shrug",                  "Back", null,        "Shrug from a low cable for continuous trap tension", true);
        ex("Machine Row",                  "Back", "Biceps",    "Chest-supported row machine — removes lower back from the equation", true);
        // Bodyweight
        ex("Pull-Up",                      "Back", "Biceps",    "Overhand bodyweight pull-up — best lat width builder", false);
        ex("Chin-Up",                      "Back", "Biceps",    "Underhand pull-up — more bicep involvement than pull-up", false);
        ex("Inverted Row (TRX/Barbell)",   "Back", "Biceps",    "Pull your body to a low bar — scalable alternative to pull-ups", false);
        // Resistance Band / Kettlebell
        ex("Band Pull-Apart",              "Back", "Shoulders", "Pull a band apart horizontally — rear delt and postural work", true);
        ex("Barbell Shrug",                "Back", null,        "Shrug heavy barbell for upper trap development", true);
    }

    // ── SHOULDERS (20 exercises) ──────────────────────────────────────────────

    private void createShoulderExercises() {
        // Barbell
        ex("Barbell Overhead Press",       "Shoulders", "Triceps",   "Press a barbell from the front rack position overhead", true);
        ex("Military Press",               "Shoulders", "Triceps",   "Strict standing overhead press — no leg drive allowed", true);
        ex("Behind-the-Neck Press",        "Shoulders", "Triceps",   "Lower barbell behind the head before pressing — advanced movement", true);
        ex("Z Press",                      "Shoulders", "Triceps",   "Seated overhead press with legs extended — eliminates leg drive", true);
        ex("Push Press",                   "Shoulders", "Triceps",   "Use leg drive to help press barbell overhead for heavier loads", true);
        // Dumbbell
        ex("Dumbbell Shoulder Press",      "Shoulders", "Triceps",   "Press dumbbells overhead seated or standing", true);
        ex("Arnold Press",                 "Shoulders", "Triceps",   "Rotate palms inward to outward as you press overhead", true);
        ex("Dumbbell Lateral Raise",       "Shoulders", null,        "Raise dumbbells out to shoulder height — medial delt isolation", true);
        ex("Dumbbell Front Raise",         "Shoulders", null,        "Raise dumbbells to shoulder height in front — anterior delt", true);
        ex("Dumbbell Rear Delt Fly",       "Shoulders", "Back",      "Bent-over fly for posterior deltoid development", true);
        ex("Single-Arm Dumbbell Press",    "Shoulders", "Triceps",   "Unilateral shoulder press for stability and balance", true);
        ex("Incline Dumbbell Rear Delt",   "Shoulders", "Back",      "Lie on an incline bench face down and raise dumbbells to sides", true);
        ex("Leaning Lateral Raise",        "Shoulders", null,        "Hold a cable or dumbbell; lean away to get a better stretch", true);
        // Cable
        ex("Cable Lateral Raise",          "Shoulders", null,        "Single-arm cable raise — constant tension throughout the movement", true);
        ex("Cable Rear Delt Fly",          "Shoulders", "Back",      "Pull cable handles from opposite sides across your body", true);
        ex("Cable Front Raise",            "Shoulders", null,        "Raise a cable handle in front — front delt isolation", true);
        ex("Cable Face Pull",              "Shoulders", "Back",      "Pull a rope attachment to forehead height — external rotation health", true);
        ex("Upright Row (Cable)",          "Shoulders", "Biceps",    "Pull a bar up close to your body to ear height", true);
        // Machine / Bodyweight / Band
        ex("Machine Shoulder Press",       "Shoulders", "Triceps",   "Guided overhead press machine — safe for beginners", true);
        ex("Resistance Band Lateral Raise","Shoulders", null,        "Lateral raise with a resistance band anchored underfoot", true);
        ex("Handstand Push-Up",            "Shoulders", "Triceps",   "Inverted push-up against a wall — elite bodyweight shoulder press", false);
        ex("Cuban Press",                  "Shoulders", null,        "Upright row into external rotation into overhead press — rotator cuff health", true);
        // Kettlebell
        ex("Kettlebell Military Press",    "Shoulders", "Triceps",   "Single kettlebell pressed overhead — rotational challenge for stabilisers", true);
        ex("Kettlebell Windmill",          "Shoulders", "Abs",       "Hold a kettlebell overhead and hinge laterally — shoulder and core stability", true);
    }

    // ── BICEPS (20 exercises) ─────────────────────────────────────────────────

    private void createBicepsExercises() {
        // Barbell
        ex("Barbell Curl",                 "Biceps", "Forearms", "Standard standing barbell curl — maximum overload for biceps", true);
        ex("EZ-Bar Curl",                  "Biceps", "Forearms", "Curl with an angled EZ-bar — reduces wrist strain", true);
        ex("Reverse Barbell Curl",         "Biceps", "Forearms", "Overhand grip curl — hits brachialis and forearms hard", true);
        ex("21s Barbell Curl",             "Biceps", "Forearms", "7 reps lower half + 7 upper half + 7 full reps — intense pump", true);
        ex("Drag Curl",                    "Biceps", null,       "Curl bar close to body dragging it upward — eliminates front delt", true);
        // Dumbbell
        ex("Alternating Dumbbell Curl",    "Biceps", "Forearms", "Curl dumbbells one at a time for better mind-muscle connection", true);
        ex("Hammer Curl",                  "Biceps", "Forearms", "Neutral grip curl — hits brachialis and brachioradialis", true);
        ex("Incline Dumbbell Curl",        "Biceps", "Forearms", "Curl on an incline bench for maximum stretch at the bottom", true);
        ex("Concentration Curl",           "Biceps", null,       "Elbow braced on inner thigh — peak contraction bicep isolation", true);
        ex("Cross-Body Hammer Curl",       "Biceps", "Forearms", "Hammer curl across the body — brachialis emphasis", true);
        ex("Zottman Curl",                 "Biceps", "Forearms", "Supinate up, pronate on the way down — biceps and forearms", true);
        ex("Spider Curl",                  "Biceps", null,       "Curl over the front of an incline bench — no momentum possible", true);
        ex("Seated Dumbbell Curl",         "Biceps", "Forearms", "Seated curl to eliminate body swing", true);
        // Cable
        ex("Cable Curl",                   "Biceps", "Forearms", "Standing cable curl — constant tension at bottom and top", true);
        ex("Cable Hammer Curl (Rope)",     "Biceps", "Forearms", "Hammer curl using the cable rope attachment", true);
        ex("Overhead Cable Curl",          "Biceps", null,       "Arms extended overhead pulling cable — maximum peak stretch", true);
        ex("Low-Pulley Cable Curl",        "Biceps", "Forearms", "Curl from a low cable — great for biceps peak", true);
        // Machine / Bodyweight / Band
        ex("Preacher Curl Machine",        "Biceps", "Forearms", "Pad supports upper arms fully — strict isolation", true);
        ex("Resistance Band Curl",         "Biceps", "Forearms", "Curl a resistance band anchored underfoot", true);
        ex("Chin-Up",                      "Biceps", "Back",     "Underhand bodyweight pull-up — compound bicep and lat builder", false);
        // Kettlebell
        ex("Kettlebell Curl",              "Biceps", "Forearms", "Offset handle provides instability — activates more forearm stabilisers", true);
    }

    // ── TRICEPS (20 exercises) ────────────────────────────────────────────────

    private void createTricepsExercises() {
        // Barbell
        ex("Close-Grip Bench Press",       "Triceps", "Chest",  "Narrow-grip bench press — most overloadable triceps movement", true);
        ex("Skullcrusher (Barbell)",       "Triceps", null,     "Lower a barbell to your forehead while lying on a bench", true);
        ex("JM Press",                     "Triceps", null,     "Hybrid close-grip press and skullcrusher — heavy tricep builder", true);
        ex("Floor Press (Barbell)",        "Triceps", "Chest",  "Barbell press from the floor — limits ROM and shoulder stress", true);
        // Dumbbell
        ex("Overhead Dumbbell Extension",  "Triceps", null,     "Two-handed dumbbell extension overhead — long head focus", true);
        ex("Single-Arm Overhead Extension","Triceps", null,     "Unilateral overhead extension for tricep long head stretch", true);
        ex("Triceps Kickback",             "Triceps", null,     "Extend dumbbell backward while bent-over — great isolation", true);
        ex("Tate Press",                   "Triceps", null,     "Elbows flared, lower dumbbells toward chest and extend — lateral head", true);
        ex("Skullcrusher (Dumbbell)",      "Triceps", null,     "Lower dumbbells to temples while lying flat — constant tension", true);
        // Cable / Rope
        ex("Rope Pushdown",                "Triceps", null,     "Push rope attachment downward; flare ends at bottom for lateral head", true);
        ex("Straight-Bar Pushdown",        "Triceps", null,     "Push a straight bar down — heavy overloading tricep pushdown", true);
        ex("Reverse-Grip Pushdown",        "Triceps", null,     "Underhand bar pushdown — targets medial head of triceps", true);
        ex("Cable Overhead Extension (Rope)","Triceps",null,   "Face away from cable and extend rope overhead — long head", true);
        ex("Single-Arm Cable Pushdown",    "Triceps", null,     "Unilateral cable pushdown for balanced tricep development", true);
        // Machine / Bodyweight
        ex("Triceps Press Machine",        "Triceps", null,     "Guided pushdown machine — good for beginners and drop sets", true);
        ex("Dips (Triceps Focus)",         "Triceps", "Chest",  "Keep torso upright on parallel bars to maximise tricep load", true);
        ex("Diamond Push-Up",              "Triceps", "Chest",  "Hands form diamond under chest — bodyweight tricep isolation", false);
        ex("Bench Dip",                    "Triceps", null,     "Lower body between two benches — beginner-friendly", false);
        ex("Pike Push-Up",                 "Triceps", "Shoulders","Inverted V position push-up — hits triceps and shoulders", false);
        // Resistance Band / Kettlebell
        ex("Resistance Band Pushdown",     "Triceps", null,     "Anchor a band overhead and push downward — useful at home", true);
        ex("EZ-Bar Skullcrusher",          "Triceps", null,     "EZ-bar to the forehead — reduces wrist strain vs straight bar", true);
    }

    // ── LEGS (22 exercises) ───────────────────────────────────────────────────

    private void createLegExercises() {
        // Barbell / Free Weight
        ex("Barbell Back Squat",           "Legs", "Glutes",   "Bar on upper back, squat to parallel — king of leg movements", true);
        ex("Barbell Front Squat",          "Legs", "Glutes",   "Bar in front rack; more upright torso — quad dominant", true);
        ex("Romanian Deadlift",            "Legs", "Glutes",   "Hinge with soft knees lowering bar to mid-shin — hamstring focus", true);
        ex("Stiff-Leg Deadlift",           "Legs", "Glutes",   "Straight-leg deadlift variant — extreme hamstring stretch", true);
        ex("Barbell Lunge",                "Legs", "Glutes",   "Step forward with a barbell — unilateral leg development", true);
        ex("Barbell Step-Up",              "Legs", "Glutes",   "Step onto a bench with a barbell — quad and glute activation", true);
        // Dumbbell / Kettlebell
        ex("Dumbbell Goblet Squat",        "Legs", "Glutes",   "Hold a dumbbell at chest level while squatting — great for beginners", true);
        ex("Dumbbell Walking Lunge",       "Legs", "Glutes",   "Continuous lunging steps holding dumbbells", true);
        ex("Dumbbell Bulgarian Split Squat","Legs","Glutes",   "Rear foot elevated on a bench — most demanding single-leg movement", true);
        ex("Kettlebell Swing",             "Legs", "Glutes",   "Hip-hinge power movement — hamstrings, glutes and power", true);
        ex("Dumbbell Romanian Deadlift",   "Legs", "Glutes",   "Hinge with dumbbells — great for hamstring mind-muscle connection", true);
        // Machine
        ex("Leg Press (Machine)",          "Legs", "Glutes",   "Push a weighted sled with your legs — high volume quad builder", true);
        ex("Leg Extension (Machine)",      "Legs", null,       "Extend legs against pad — strict quad isolation", true);
        ex("Lying Leg Curl (Machine)",     "Legs", null,       "Curl legs from a prone position — hamstring isolation", true);
        ex("Seated Leg Curl (Machine)",    "Legs", null,       "Curl legs while seated — different hamstring angle", true);
        ex("Hack Squat (Machine)",         "Legs", "Glutes",   "Plate-loaded or machine squat with back supported", true);
        ex("Sissy Squat",                  "Legs", null,       "Lean back and squat — extreme quad isolation", false);
        // Bodyweight
        ex("Bodyweight Squat",             "Legs", "Glutes",   "Unweighted squat — warm-up or high rep endurance", false);
        ex("Pistol Squat",                 "Legs", "Glutes",   "Single-leg squat to full depth — elite bodyweight strength", false);
        ex("Box Jump",                     "Legs", "Glutes",   "Explosive jump onto a box — power and fast-twitch development", false);
        ex("Wall Sit",                     "Legs", null,       "Hold a static squat against the wall — isometric quad endurance", false);
        ex("Jump Squat",                   "Legs", "Glutes",   "Explosive squat with a jump at the top — plyometric power", false);
    }

    // ── GLUTES (18 exercises) ─────────────────────────────────────────────────

    private void createGlutesExercises() {
        // Barbell
        ex("Barbell Hip Thrust",           "Glutes", "Legs",    "Shoulders on bench, drive hips up with barbell on lap — peak glute exercise", true);
        ex("Barbell Glute Bridge",         "Glutes", "Legs",    "Lie on the floor and drive hips upward with barbell", true);
        ex("Sumo Squat",                   "Glutes", "Legs",    "Wide-stance squat with toes turned out — inner thigh and glute focus", true);
        ex("Cable Pull-Through",           "Glutes", "Legs",    "Face away from cable, hinge and drive hips forward — hip hinge pattern", true);
        // Dumbbell / Kettlebell
        ex("Dumbbell Hip Thrust",          "Glutes", "Legs",    "Hip thrust with a dumbbell — great starter movement", true);
        ex("Kettlebell Deadlift",          "Glutes", "Legs",    "Hinge and lift a kettlebell from the floor — hip hinge pattern", true);
        ex("Dumbbell Step-Back Lunge",     "Glutes", "Legs",    "Reverse lunge emphasising glute loading", true);
        ex("Single-Leg Romanian Deadlift", "Glutes", "Legs",    "Balance on one leg while hinging — glute and hamstring stretch", true);
        // Machine / Cable
        ex("Hip Abduction Machine",        "Glutes", null,      "Push padded legs outward — glute med and glute min isolation", true);
        ex("Cable Kickback",               "Glutes", null,      "Kick leg back against a cable — glute max isolation", true);
        ex("Reverse Hyper",                "Glutes", "Legs",    "Swing legs back on a reverse hyperextension machine", true);
        ex("Glute Ham Raise",              "Glutes", "Legs",    "Use a GHR machine to bridge glutes and curl hamstrings", false);
        // Bodyweight / Resistance Band
        ex("Bodyweight Glute Bridge",      "Glutes", "Legs",    "Lie on back and drive hips up — activation exercise", false);
        ex("Donkey Kick",                  "Glutes", null,      "On all fours, kick one leg straight back against resistance", false);
        ex("Fire Hydrant",                 "Glutes", null,      "On all fours, raise knee out to the side — glute med focus", false);
        ex("Clamshell",                    "Glutes", null,      "Side-lying hip external rotation with a resistance band", false);
        ex("Band Hip Thrust",              "Glutes", "Legs",    "Hip thrust with resistance band across the hips", true);
        ex("Curtsy Lunge",                 "Glutes", "Legs",    "Step behind and across body — glute med and lateral hip", false);
    }

    // ── CALVES (15 exercises) ─────────────────────────────────────────────────

    private void createCalvesExercises() {
        ex("Standing Calf Raise (Machine)","Calves", null,     "Push up on toes on a standing calf raise machine — gastrocnemius focus", true);
        ex("Seated Calf Raise (Machine)",  "Calves", null,     "Raise heels while seated — emphasises soleus below the knee", true);
        ex("Donkey Calf Raise",            "Calves", null,     "Bent-over calf raise — old-school stretch and contraction", true);
        ex("Single-Leg Calf Raise",        "Calves", null,     "Bodyweight calf raise on one leg — great for balance and isolation", false);
        ex("Barbell Standing Calf Raise",  "Calves", null,     "Barbell on back, raise on toes — high overload potential", true);
        ex("Dumbbell Calf Raise",          "Calves", null,     "Hold dumbbells and raise on toes — accessible anywhere", true);
        ex("Leg Press Calf Raise",         "Calves", null,     "Use the leg press machine — allows very heavy loading", true);
        ex("Smith Machine Calf Raise",     "Calves", null,     "Calf raise inside a smith machine for stability", true);
        ex("Seated Dumbbell Calf Raise",   "Calves", null,     "Dumbbell on knee while seated — soleus and gastrocnemius", true);
        ex("Box Calf Raise",               "Calves", null,     "Raise on edge of a step or box — deeper range of motion", false);
        ex("Jump Rope Calf Raise",         "Calves", null,     "Explosive calf raises mimicking jump rope movement", false);
        ex("Band Calf Raise",              "Calves", null,     "Resistance band under foot for portable calf training", true);
        ex("Tiptoe Walk",                  "Calves", null,     "Walk on toes for distance — endurance and activation", false);
        ex("Calf Raise on Hack Squat",     "Calves", null,     "Raise heels on the hack squat machine footplate", true);
        ex("Farmer's Carry on Toes",       "Calves", null,     "Walk on tiptoes while carrying heavy dumbbells — functional calves", true);
    }

    // ── ABS / CORE (20 exercises) ─────────────────────────────────────────────

    private void createAbsExercises() {
        // Bodyweight
        ex("Crunch",                       "Abs", null,  "Lie on back, hands behind head, curl shoulders toward hips", false);
        ex("Reverse Crunch",               "Abs", null,  "Lie on back, bring knees to chest curling pelvis off the floor", false);
        ex("Plank",                        "Abs", null,  "Hold a push-up position — anti-extension core stability", false);
        ex("Side Plank",                   "Abs", null,  "Lateral plank on one forearm — oblique and hip stability", false);
        ex("Hollow Body Hold",             "Abs", null,  "Lie flat, press lower back to floor, extend arms and legs — gymnastics core", false);
        ex("Hanging Leg Raise",            "Abs", null,  "Hang from a bar and raise straight legs to 90 degrees", false);
        ex("Hanging Knee Raise",           "Abs", null,  "Hang from a bar and raise knees to chest — beginner version", false);
        ex("Toes-to-Bar",                  "Abs", null,  "Hang from a bar and raise feet to touch the bar — advanced", false);
        ex("Bicycle Crunch",               "Abs", null,  "Alternate elbow to opposite knee in a cycling motion", false);
        ex("V-Up",                         "Abs", null,  "Simultaneously raise torso and legs forming a V — hip flexors and abs", false);
        ex("Dragon Flag",                  "Abs", null,  "Lie on bench, keep body rigid, lower legs while shoulder stays fixed", false);
        ex("Mountain Climber",             "Abs", null,  "Plank position, alternate driving knees to chest rapidly", false);
        ex("Flutter Kick",                 "Abs", null,  "Lie flat and alternate shallow kicks — hip flexors and lower abs", false);
        ex("Dead Bug",                     "Abs", null,  "Lie on back and extend opposite arm and leg while bracing core", false);
        // Weighted / Cable
        ex("Cable Crunch",                 "Abs", null,  "Kneel at cable machine and crunch downward — resistance for overload", true);
        ex("Ab Wheel Rollout",             "Abs", null,  "Roll ab wheel forward from knees — maximum anti-extension demand", true);
        ex("Russian Twist",                "Abs", null,  "Sit with knees bent, hold weight and rotate side to side", true);
        ex("Cable Woodchopper",            "Abs", null,  "Rotate while pulling cable from high to low — rotational power", true);
        ex("Weighted Decline Crunch",      "Abs", null,  "Crunch on a decline bench holding a weight plate", true);
        ex("Landmine Rotation",            "Abs", null,  "Rotate a loaded barbell from side to side — anti-rotation strength", true);
    }

    // ── FOREARMS (15 exercises) ───────────────────────────────────────────────

    private void createForearmsExercises() {
        // Barbell / EZ-Bar
        ex("Barbell Wrist Curl",           "Forearms", null,    "Seated, barbell resting on knees, curl wrists upward — flexors", true);
        ex("Barbell Reverse Wrist Curl",   "Forearms", null,    "Same position with overhand grip — wrist extensors", true);
        ex("Behind-the-Back Wrist Curl",   "Forearms", null,    "Bar behind the body, allow it to roll down fingers and curl back", true);
        // Dumbbell
        ex("Dumbbell Wrist Curl",          "Forearms", null,    "Wrist curl with a single dumbbell — good for isolating each side", true);
        ex("Dumbbell Reverse Curl",        "Forearms", "Biceps","Overhand dumbbell curl — brachioradialis and wrist extensors", true);
        ex("Hammer Curl",                  "Forearms", "Biceps","Neutral grip curl — thick forearm and brachialis builder", true);
        ex("Zottman Curl",                 "Forearms", "Biceps","Supinate on the way up, pronate on the way down", true);
        // Cable
        ex("Cable Reverse Curl",           "Forearms", "Biceps","Overhand cable curl — constant tension on extensors", true);
        ex("Cable Wrist Extension",        "Forearms", null,    "Extend wrist against cable resistance — extensor isolation", true);
        // Grip / Functional
        ex("Farmer's Carry",               "Forearms", null,    "Walk with heavy dumbbells or barbells — functional grip strength", true);
        ex("Dead Hang",                    "Forearms", "Back",  "Hang from a bar as long as possible — grip and lat stretch", false);
        ex("Towel Pull-Up",                "Forearms", "Back",  "Pull-ups with a towel draped over the bar — extreme grip demand", false);
        ex("Plate Pinch",                  "Forearms", null,    "Pinch two weight plates together between thumb and fingers", true);
        ex("Gripper Squeeze",              "Forearms", null,    "Squeeze a hand gripper for reps or time", true);
        ex("Rice Bucket Rotation",         "Forearms", null,    "Rotate hands through a bucket of rice — rehab and forearm endurance", false);
    }

    // ── CARDIO / FULL BODY (15 exercises) ────────────────────────────────────

    private void createCardioExercises() {
        ex("Treadmill Run",                "Cardio", null,  "Sustained running on a treadmill — aerobic base builder", false);
        ex("Stationary Bike",              "Cardio", null,  "Cycling on a stationary bike — low-impact cardio", false);
        ex("Rowing Machine",               "Cardio", "Back","Full-body rowing ergometer — best calorie-burn-per-minute machine", false);
        ex("Jump Rope",                    "Cardio", "Calves","Continuous skipping — coordination and calf conditioning", false);
        ex("Burpee",                       "Cardio", null,  "Drop to the floor, push-up, jump up — full body conditioning", false);
        ex("Kettlebell Swing",             "Cardio", "Glutes","Hip-hinge power movement used as metabolic conditioning", true);
        ex("Battle Rope Waves",            "Cardio", "Shoulders","Alternating rope waves — intense upper body conditioning", true);
        ex("Sled Push",                    "Cardio", "Legs", "Push a weighted sled for distance — legs and lungs", true);
        ex("Assault Bike Sprint",          "Cardio", null,  "All-out sprint on an assault air bike — brutal metabolic conditioning", false);
        ex("Box Jump",                     "Cardio", "Legs","Explosive jump onto a box — plyometric power", false);
        ex("Sprint (Track / Treadmill)",   "Cardio", null,  "Short all-out running sprints — speed and fast-twitch development", false);
        ex("Stair Climber",                "Cardio", "Glutes","Continuous stair stepping — glutes and cardio combined", false);
        ex("Swimming Laps",                "Cardio", "Back","Full-body low-impact cardio — great for recovery days", false);
        ex("Elliptical",                   "Cardio", null,  "Low-impact full-body cardio machine", false);
        ex("Jumping Jacks",                "Cardio", null,  "Full-body warm-up and conditioning exercise", false);
    }
}
