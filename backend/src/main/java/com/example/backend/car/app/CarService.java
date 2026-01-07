package com.example.backend.car.app;

import static com.example.backend.car.api.CarDtos.*;

import com.example.backend.car.domain.Car;
import com.example.backend.car.infra.CarRepository;
import com.example.backend.common.InputSanitizer;
import java.net.URI;
import java.time.Year;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class CarService {

  private final CarRepository repo;

  public CarService(CarRepository repo) {
    this.repo = repo;
  }

  public Page<CarResponse> list(Pageable pageable) {
    return repo.findAll(pageable).map(this::toResponse);
  }

  public CarResponse get(UUID id) {
    var entity = repo.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Car " + id + " not found"));
    return toResponse(entity);
  }

  public Created create(CarRequest req) {
    validateProductionYear(req.productionYear());
    String sanitizedModel = InputSanitizer.sanitize(req.model());
    String sanitizedBrand = InputSanitizer.sanitize(req.brand());
    var entity = repo.save(new Car(sanitizedModel, sanitizedBrand, req.productionYear(), req.price()));
    return new Created(entity.getId(), URI.create("/api/v1/car/" + entity.getId()));
  }

  public CarResponse update(UUID id, CarRequest req) {
    validateProductionYear(req.productionYear());
    var entity = repo.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Car " + id + " not found"));
    String sanitizedModel = InputSanitizer.sanitize(req.model());
    String sanitizedBrand = InputSanitizer.sanitize(req.brand());
    entity.setModel(sanitizedModel);
    entity.setBrand(sanitizedBrand);
    entity.setProductionYear(req.productionYear());
    entity.setPrice(req.price());
    return toResponse(entity);
  }

  public void delete(UUID id) {
    if (!repo.existsById(id)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Car " + id + " not found");
    }
    repo.deleteById(id);
  }

  private CarResponse toResponse(Car c) {
    return new CarResponse(c.getId(), c.getModel(), c.getBrand(), c.getProductionYear(), c.getPrice());
  }

  private void validateProductionYear(int productionYear) {
    int currentYear = Year.now().getValue();
    if (productionYear > currentYear) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, 
          "Production year cannot be greater than the current year (" + currentYear + ")"
      );
    }
  }

  public record Created(UUID id, URI location) {}
}

