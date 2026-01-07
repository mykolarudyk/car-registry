package com.example.backend;

import com.example.backend.car.domain.Car;
import com.example.backend.car.infra.CarRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BootstrapData {
  @Bean
  CommandLineRunner seedCar(CarRepository repo) {
    return args -> {
      if (repo.count() == 0) {
        repo.saveAll(List.of(
            new Car("Camry", "Toyota", 2020, new BigDecimal("25000.00")),
            new Car("Civic", "Honda", 2019, new BigDecimal("22000.00")),
            new Car("Corolla", "Toyota", 2021, new BigDecimal("23000.00")),
            new Car("Accord", "Honda", 2022, new BigDecimal("28000.00")),
            new Car("Altima", "Nissan", 2020, new BigDecimal("24000.00")),
            new Car("Sentra", "Nissan", 2021, new BigDecimal("20000.00")),
            new Car("Elantra", "Hyundai", 2022, new BigDecimal("21000.00")),
            new Car("Sonata", "Hyundai", 2021, new BigDecimal("25000.00")),
            new Car("Fusion", "Ford", 2019, new BigDecimal("18000.00")),
            new Car("Malibu", "Chevrolet", 2020, new BigDecimal("22000.00")),
            new Car("Impala", "Chevrolet", 2018, new BigDecimal("20000.00")),
            new Car("Focus", "Ford", 2021, new BigDecimal("19000.00")),
            new Car("Passat", "Volkswagen", 2022, new BigDecimal("27000.00")),
            new Car("Jetta", "Volkswagen", 2021, new BigDecimal("23000.00")),
            new Car("3 Series", "BMW", 2020, new BigDecimal("35000.00")),
            new Car("C-Class", "Mercedes-Benz", 2021, new BigDecimal("40000.00")),
            new Car("A4", "Audi", 2022, new BigDecimal("38000.00"))
        ));
      }
    };
  }
}
