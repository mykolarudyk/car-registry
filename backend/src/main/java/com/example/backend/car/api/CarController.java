package com.example.backend.car.api;

import static com.example.backend.car.api.CarDtos.*;
import static com.example.backend.car.constants.CarConstants.*;

import com.example.backend.car.app.CarService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/car")
@Validated
public class CarController {

  private final CarService svc;

  public CarController(CarService svc) {
    this.svc = svc;
  }

  @GetMapping
  public Page<CarResponse> list(@PageableDefault(size = DEFAULT_PAGE_SIZE, sort = DEFAULT_SORT_FIELD) Pageable pageable) {
    return svc.list(pageable);
  }

  @GetMapping("{id}")
  public CarResponse get(@PathVariable UUID id) {
    return svc.get(id);
  }

  @PostMapping
  public ResponseEntity<CarResponse> create(@RequestBody @Valid CarRequest req) {
    var created = svc.create(req);
    return ResponseEntity.created(created.location()).body(svc.get(created.id()));
  }

  @PutMapping("{id}")
  public CarResponse update(@PathVariable UUID id, @RequestBody @Valid CarRequest req) {
    return svc.update(id, req);
  }

  @DeleteMapping("{id}")
  public ResponseEntity<Void> delete(@PathVariable UUID id) {
    svc.delete(id);
    return ResponseEntity.noContent().build();
  }
}

