package com.limitbeyond.service;

import com.limitbeyond.model.MuscleGroup;

import java.util.List;

public interface MuscleGroupService {
    MuscleGroup createMuscleGroup(String name);

    MuscleGroup findById(String id);

    MuscleGroup findByName(String name);

    List<MuscleGroup> findAll();

    MuscleGroup update(String id, String name);

    void delete(String id);
}
