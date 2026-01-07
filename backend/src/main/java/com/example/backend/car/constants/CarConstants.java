package com.example.backend.car.constants;

import java.math.BigDecimal;
import java.time.Year;

public final class CarConstants {
  
  private CarConstants() {
  }
  
  // Pagination
  public static final int DEFAULT_PAGE_SIZE = 20;
  public static final String DEFAULT_SORT_FIELD = "model";
  
  // Field validation limits
  public static final int FIELD_MAX_LENGTH = 100;
  public static final int PRODUCTION_YEAR_MIN = 1;
  public static final int PRODUCTION_YEAR_MAX = Year.now().getValue();
  public static final BigDecimal PRICE_MIN = new BigDecimal("0.01");
  public static final BigDecimal PRICE_MAX = new BigDecimal("99999999.99");
  
  // Database column constraints
  public static final int PRICE_PRECISION = 10;
  public static final int PRICE_SCALE = 2;
}

