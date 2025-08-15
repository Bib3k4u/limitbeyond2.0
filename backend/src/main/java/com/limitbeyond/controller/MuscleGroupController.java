package com.limitbeyond.controller;

import com.limitbeyond.model.MuscleGroup;
import com.limitbeyond.service.MuscleGroupService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/muscle-groups")
//@CrossOrigin(origins = "*", maxAge = 3600)
public class MuscleGroupController {

    @Autowired
    private MuscleGroupService muscleGroupService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MuscleGroup>> getAllMuscleGroups() {
        try {
            List<MuscleGroup> muscleGroups = muscleGroupService.findAll();
            return ResponseEntity.ok(muscleGroups);
        } catch (Exception e) {
            // Log the error for debugging
            System.err.println("Error retrieving muscle groups: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Public endpoint to retrieve all muscle groups without authentication
     * This helps prevent timeouts when the user is not authenticated
     */
    @GetMapping("/public")
    public ResponseEntity<List<MuscleGroup>> getPublicMuscleGroups() {
        try {
            List<MuscleGroup> muscleGroups = muscleGroupService.findAll();
            return ResponseEntity.ok(muscleGroups);
        } catch (Exception e) {
            // Log the error
            System.err.println("Error retrieving public muscle groups: " + e.getMessage());
            e.printStackTrace();

            // Return an empty list instead of an error to avoid client-side issues
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MuscleGroup> getMuscleGroupById(@PathVariable String id) {
        try {
            MuscleGroup muscleGroup = muscleGroupService.findById(id);
            return ResponseEntity.ok(muscleGroup);
        } catch (Exception e) {
            // Log the error for debugging
            System.err.println("Error retrieving muscle group by ID: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Public endpoint to retrieve muscle group by ID without authentication
     */
    @GetMapping("/public/{id}")
    public ResponseEntity<MuscleGroup> getPublicMuscleGroupById(@PathVariable String id) {
        try {
            MuscleGroup muscleGroup = muscleGroupService.findById(id);
            return ResponseEntity.ok(muscleGroup);
        } catch (Exception e) {
            // Log the error
            System.err.println("Error retrieving public muscle group by ID: " + e.getMessage());
            e.printStackTrace();

            // Return a 404 Not Found instead of a 500 Internal Server Error
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MuscleGroup> createMuscleGroup(@Valid @RequestBody MuscleGroupRequest request) {
        MuscleGroup newMuscleGroup = muscleGroupService.createMuscleGroup(request.getName());
        return ResponseEntity.ok(newMuscleGroup);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MuscleGroup> updateMuscleGroup(@PathVariable String id,
                                                         @Valid @RequestBody MuscleGroupRequest request) {
        MuscleGroup updatedMuscleGroup = muscleGroupService.update(id, request.getName());
        return ResponseEntity.ok(updatedMuscleGroup);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteMuscleGroup(@PathVariable String id) {
        muscleGroupService.delete(id);
        return ResponseEntity.ok().build();
    }

    static class MuscleGroupRequest {
        private String name;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }
}
