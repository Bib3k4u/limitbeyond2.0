package com.limitbeyond.repository;

import com.limitbeyond.model.WorkoutSet;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface WorkoutSetRepository extends MongoRepository<WorkoutSet, String> {
    // Base CRUD operations are provided by MongoRepository
}
