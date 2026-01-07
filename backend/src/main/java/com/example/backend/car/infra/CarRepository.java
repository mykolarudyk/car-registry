package com.example.backend.car.infra;

import com.example.backend.car.domain.Car;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CarRepository extends JpaRepository<Car, UUID> {}

