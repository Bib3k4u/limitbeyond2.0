package com.limitbeyond.repository;

import com.limitbeyond.model.MuscleGroup;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface MuscleGroupRepository extends MongoRepository<MuscleGroup, String> {
    Optional<MuscleGroup> findByName(String name);

    Optional<MuscleGroup> findByNameIgnoreCase(String name);

    Boolean existsByName(String name);
}
