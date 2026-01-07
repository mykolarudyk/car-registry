package com.example.backend.car.domain;

import com.example.backend.car.constants.CarConstants;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "car")
public class Car {

  @Id
  @GeneratedValue
  private UUID id;

  @Column(nullable = false, length = CarConstants.FIELD_MAX_LENGTH)
  @NotBlank @Size(max = CarConstants.FIELD_MAX_LENGTH)
  private String model;

  @Column(nullable = false, length = CarConstants.FIELD_MAX_LENGTH)
  @NotBlank @Size(max = CarConstants.FIELD_MAX_LENGTH)
  private String brand;

  @Column(name = "production_year", nullable = false)
  @Min(CarConstants.PRODUCTION_YEAR_MIN)
  private int productionYear;

  @Column(nullable = false, precision = CarConstants.PRICE_PRECISION, scale = CarConstants.PRICE_SCALE)
  @DecimalMin(value = "0.01")
  @DecimalMax(value = "99999999.99")
  private BigDecimal price;

  protected Car() {}

  public Car(String model, String brand, int productionYear, BigDecimal price) {
    this.model = model;
    this.brand = brand;
    this.productionYear = productionYear;
    this.price = price;
  }

  public UUID getId() { return id; }
  public void setId(UUID id) { this.id = id; }
  public String getModel() { return model; }
  public void setModel(String model) { this.model = model; }
  public String getBrand() { return brand; }
  public void setBrand(String brand) { this.brand = brand; }
  public int getProductionYear() { return productionYear; }
  public void setProductionYear(int productionYear) { this.productionYear = productionYear; }
  public BigDecimal getPrice() { return price; }
  public void setPrice(BigDecimal price) { this.price = price; }
}

