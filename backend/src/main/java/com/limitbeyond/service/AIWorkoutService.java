package com.limitbeyond.service;

import com.limitbeyond.model.WorkoutSet;
import com.limitbeyond.model.Workout;
import com.limitbeyond.model.User;
import com.limitbeyond.model.ExerciseTemplate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface AIWorkoutService {
    /**
     * Get AI-suggested workout parameters based on user's workout history
     * 
     * @param user        The user to get suggestions for
     * @param exerciseId  The exercise to get suggestions for
     * @param historyDays Number of days to look back in history
     * @return Map containing suggested reps, sets, and weights
     */
    Map<String, Object> getSuggestedParameters(User user, String exerciseId, int historyDays);

    /**
     * Get weekly workout suggestions based on user's past patterns
     * 
     * @param user The user to get suggestions for
     * @return List of suggested workouts for the upcoming week
     */
    List<String> getWeeklyWorkoutSuggestions(User user);

    /**
     * Get suggestions for progressive overload based on last 5 sets
     * 
     * @param user       The user to get suggestions for
     * @param exerciseId The exercise to get suggestions for
     * @return Map containing suggested progressive overload parameters
     */
    Map<String, Object> getProgressiveOverloadSuggestions(User user, String exerciseId);
}