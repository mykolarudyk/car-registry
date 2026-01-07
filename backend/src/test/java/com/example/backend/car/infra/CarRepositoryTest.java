package com.example.backend.car.infra;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.example.backend.car.domain.Car;
import jakarta.validation.ConstraintViolationException;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

@DataJpaTest
class CarRepositoryTest {

  @Autowired
  CarRepository repo;

  @Test
  void saveAndFindAll() {
    var c = new Car("Camry", "Toyota", 2020, new BigDecimal("25000.00"));
    repo.saveAndFlush(c);

    List<Car> all = repo.findAll();
    assertThat(all).isNotEmpty();
    assertThat(all).allSatisfy(x -> {
      assertThat(x.getModel()).isEqualTo("Camry");
      assertThat(x.getBrand()).isEqualTo("Toyota");
      assertThat(x.getProductionYear()).isEqualTo(2020);
      assertThat(x.getPrice()).isEqualTo(new BigDecimal("25000.00"));
    });
  }

  @Test
  void validationConstraintsAreEnforced() {
    var bad = new Car("", "", 0, new BigDecimal("0.00"));
    assertThatThrownBy(() -> repo.saveAndFlush(bad))
        .isInstanceOf(ConstraintViolationException.class);
  }
}

