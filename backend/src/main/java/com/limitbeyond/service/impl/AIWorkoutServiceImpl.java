package com.limitbeyond.service.impl;

import com.limitbeyond.service.AIWorkoutService;
import com.limitbeyond.service.WorkoutService;
import com.limitbeyond.service.CacheService;
import com.limitbeyond.model.Workout;
import com.limitbeyond.model.WorkoutSet;
import com.limitbeyond.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.core.ParameterizedTypeReference;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AIWorkoutServiceImpl implements AIWorkoutService {

    @Value("${mistral.api.key}")
    private String mistralApiKey;

    @Value("${mistral.api.url:https://api.mistral.ai/v1/chat/completions}")
    private String mistralApiUrl;

    private final WorkoutService workoutService;
    private final RestTemplate restTemplate;
    private final CacheService cacheService;

    public AIWorkoutServiceImpl(WorkoutService workoutService,
            RestTemplate restTemplate,
            CacheService cacheService) {
        this.workoutService = workoutService;
        this.restTemplate = restTemplate;
        this.cacheService = cacheService;
    }

    @Override
    public Map<String, Object> getSuggestedParameters(User user, String exerciseId, int historyDays) {
        String cacheKey = "suggestions:params:" + user.getId() + ":" + exerciseId + ":" + historyDays;

        Map<String, Object> cachedSuggestions = cacheService.get(cacheKey);
        if (cachedSuggestions != null) {
            return cachedSuggestions;
        }

        LocalDateTime startDate = LocalDateTime.now().minus(historyDays, ChronoUnit.DAYS);
        List<Workout> workouts = workoutService.findByMemberAndDateRange(user, startDate, LocalDateTime.now());

        List<WorkoutSet> relevantSets = workouts.stream()
                .flatMap(w -> w.getSets().stream())
                .filter(s -> s.getExercise().getId().equals(exerciseId))
                .collect(Collectors.toList());

        Map<String, Object> suggestions = relevantSets.isEmpty()
                ? getDefaultSuggestions()
                : calculateProgressiveOverload(relevantSets);

        cacheService.put(cacheKey, suggestions);
        return suggestions;
    }

    @Override
    public List<String> getWeeklyWorkoutSuggestions(User user) {
        String cacheKey = "suggestions:weekly:" + user.getId();

        List<String> cachedSuggestions = cacheService.get(cacheKey);
        if (cachedSuggestions != null) {
            return cachedSuggestions;
        }

        LocalDateTime lastWeekStart = LocalDateTime.now().minus(7, ChronoUnit.DAYS);
        List<Workout> lastWeekWorkouts = workoutService.findByMemberAndDateRange(
                user, lastWeekStart, LocalDateTime.now());

        String workoutHistory = formatWeeklyWorkoutHistoryForAI(lastWeekWorkouts);
        String aiResponse = getAISuggestions(workoutHistory);

        List<String> suggestions = parseWeeklyWorkoutSuggestions(aiResponse);
        cacheService.put(cacheKey, suggestions);
        return suggestions;
    }

    @Override
    public Map<String, Object> getProgressiveOverloadSuggestions(User user, String exerciseId) {
        String cacheKey = "suggestions:progressive:" + user.getId() + ":" + exerciseId;

        Map<String, Object> cachedSuggestions = cacheService.get(cacheKey);
        if (cachedSuggestions != null) {
            return cachedSuggestions;
        }

        List<Workout> recentWorkouts = workoutService.findByMember(user);
        List<WorkoutSet> lastFiveSets = recentWorkouts.stream()
                .flatMap(w -> w.getSets().stream())
                .filter(s -> s.getExercise() != null && s.getExercise().getId().equals(exerciseId))
                .filter(s -> s.getWorkout() != null && s.getWorkout().getScheduledDate() != null)
                .sorted((s1, s2) -> s2.getWorkout().getScheduledDate().compareTo(s1.getWorkout().getScheduledDate()))
                .limit(5)
                .collect(Collectors.toList());

        Map<String, Object> suggestions = lastFiveSets.isEmpty()
                ? getDefaultSuggestions()
                : calculateProgressiveOverload(lastFiveSets);

        cacheService.put(cacheKey, suggestions);
        return suggestions;
    }

    private String getAISuggestions(String prompt) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "mistral-medium");
        requestBody.put("messages", Arrays.asList(
                Map.of("role", "system",
                        "content",
                        "You are a professional fitness trainer specializing in progressive overload programming."),
                Map.of("role", "user",
                        "content", prompt)));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + mistralApiKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<HashMap<String, Object>> response = restTemplate.exchange(
                    mistralApiUrl,
                    HttpMethod.POST,
                    request,
                    new ParameterizedTypeReference<HashMap<String, Object>>() {
                    });

            if (response.getBody() == null) {
                return null;
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
            if (choices == null || choices.isEmpty()) {
                return null;
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            return message != null ? (String) message.get("content") : null;

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private List<String> parseWeeklyWorkoutSuggestions(String aiResponse) {
        if (aiResponse == null) {
            return Collections.emptyList();
        }
        return Arrays.stream(aiResponse.split("\n"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    private String formatWeeklyWorkoutHistoryForAI(List<Workout> workouts) {
        StringBuilder sb = new StringBuilder();
        sb.append("Last week's workout schedule:\n");
        for (Workout workout : workouts) {
            sb.append(String.format("Date: %s, Workout: %s, Exercises: %s\n",
                    workout.getScheduledDate(),
                    workout.getName(),
                    workout.getSets().stream()
                            .map(s -> s.getExercise().getName())
                            .distinct()
                            .collect(Collectors.joining(", "))));
        }
        sb.append("\nSuggest a workout schedule for next week following progressive overload principles.");
        return sb.toString();
    }

    private Map<String, Object> getDefaultSuggestions() {
        Map<String, Object> response = new HashMap<>();
        List<Map<String, Object>> sets = new ArrayList<>();

        int baseReps = 10;
        double baseWeight = 20.0;

        for (int i = 0; i < 3; i++) {
            Map<String, Object> set = new HashMap<>();
            set.put("reps", baseReps);
            set.put("weight", baseWeight);
            sets.add(set);

            baseReps = Math.max(baseReps - 1, 6);
            baseWeight += 2.5;
        }

        response.put("sets", sets);
        return response;
    }

    private Map<String, Object> calculateProgressiveOverload(List<WorkoutSet> previousSets) {
        Map<String, Object> response = new HashMap<>();
        List<Map<String, Object>> suggestedSets = new ArrayList<>();

        if (previousSets.isEmpty()) {
            return getDefaultSuggestions();
        }

        List<WorkoutSet> latestSets = previousSets.stream()
                .sorted((s1, s2) -> s2.getWorkout().getScheduledDate().compareTo(s1.getWorkout().getScheduledDate()))
                .limit(3)
                .collect(Collectors.toList());

        double avgWeight = latestSets.stream()
                .mapToDouble(set -> set.getWeight() != null ? set.getWeight() : 0)
                .average()
                .orElse(0);

        double avgReps = latestSets.stream()
                .mapToInt(WorkoutSet::getReps)
                .average()
                .orElse(0);

        double weightIncrement = 1.25;
        int startingReps = (int) Math.ceil(avgReps);
        double startingWeight = avgWeight;

        for (int i = 0; i < 3; i++) {
            Map<String, Object> set = new HashMap<>();

            if (i == 0) {
                set.put("reps", startingReps + 1);
                set.put("weight", startingWeight);
            } else if (i == 1) {
                set.put("reps", startingReps);
                set.put("weight", startingWeight + weightIncrement);
            } else {
                set.put("reps", Math.max(startingReps - 1, 6));
                set.put("weight", startingWeight + (weightIncrement * 2));
            }

            suggestedSets.add(set);
        }

        response.put("sets", suggestedSets);
        return response;
    }
}