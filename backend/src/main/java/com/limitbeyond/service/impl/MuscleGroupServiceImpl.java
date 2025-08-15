package com.limitbeyond.service.impl;

import com.limitbeyond.model.MuscleGroup;
import com.limitbeyond.repository.MuscleGroupRepository;
import com.limitbeyond.service.MuscleGroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MuscleGroupServiceImpl implements MuscleGroupService {

    @Autowired
    private MuscleGroupRepository muscleGroupRepository;

    @Override
    public MuscleGroup createMuscleGroup(String name) {
        if (muscleGroupRepository.existsByName(name)) {
            throw new RuntimeException("Muscle group with name " + name + " already exists");
        }

        MuscleGroup muscleGroup = new MuscleGroup(name);
        return muscleGroupRepository.save(muscleGroup);
    }

    @Override
    public MuscleGroup findById(String id) {
        return muscleGroupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Muscle group with id " + id + " not found"));
    }

    @Override
    public MuscleGroup findByName(String name) {
        return muscleGroupRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Muscle group with name " + name + " not found"));
    }

    @Override
    public List<MuscleGroup> findAll() {
        return muscleGroupRepository.findAll();
    }

    @Override
    public MuscleGroup update(String id, String name) {
        MuscleGroup muscleGroup = findById(id);

        if (!muscleGroup.getName().equals(name) && muscleGroupRepository.existsByName(name)) {
            throw new RuntimeException("Muscle group with name " + name + " already exists");
        }

        muscleGroup.setName(name);
        return muscleGroupRepository.save(muscleGroup);
    }

    @Override
    public void delete(String id) {
        if (!muscleGroupRepository.existsById(id)) {
            throw new RuntimeException("Muscle group with id " + id + " not found");
        }

        muscleGroupRepository.deleteById(id);
    }
}