package com.example.backend.car.api;

import com.example.backend.car.constants.CarConstants;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.UUID;

public final class CarDtos {

  public record CarRequest(
      @NotBlank @Size(max = CarConstants.FIELD_MAX_LENGTH) String model,
      @NotBlank @Size(max = CarConstants.FIELD_MAX_LENGTH) String brand,
      @Min(CarConstants.PRODUCTION_YEAR_MIN) 
      int productionYear,
      @DecimalMin(value = "0.01")
      @DecimalMax(value = "99999999.99")
      BigDecimal price
  ) {}

  public record CarResponse(
      UUID id, 
      String model, 
      String brand, 
      int productionYear, 
      BigDecimal price
  ) {}
}

