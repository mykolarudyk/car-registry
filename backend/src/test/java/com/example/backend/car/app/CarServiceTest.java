package com.example.backend.car.app;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.example.backend.car.api.CarDtos.CarRequest;
import com.example.backend.car.domain.Car;
import com.example.backend.car.infra.CarRepository;
import java.math.BigDecimal;
import java.net.URI;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class CarServiceTest {

  @Mock CarRepository repo;
  @InjectMocks CarService svc;

  @Test
  void listMapsEntitiesToResponses() {
    var e = new Car("A", "B", 2020, bd("12300.00"));
    var page = new PageImpl<>(java.util.List.of(e), PageRequest.of(0, 20), 1);
    when(repo.findAll(any(Pageable.class))).thenReturn(page);

    var res = svc.list(PageRequest.of(0, 20));
    assertThat(res.getTotalElements()).isEqualTo(1);
    assertThat(res.getContent()).hasSize(1);
    assertThat(res.getContent().get(0).model()).isEqualTo("A");
  }

  @Test
  void getReturnsMappedResponse() {
    var e = new Car("A", "B", 2020, bd("12300.00"));
    var id = UUID.randomUUID();
    e.setId(id);
    when(repo.findById(id)).thenReturn(Optional.of(e));

    var res = svc.get(id);
    assertThat(res.id()).isEqualTo(id);
    assertThat(res.productionYear()).isEqualTo(2020);
    assertThat(res.price()).isEqualByComparingTo("12300.00");
  }

  @Test
  void getThrows404WhenMissing() {
    var id = UUID.randomUUID();
    when(repo.findById(id)).thenReturn(Optional.empty());

    var ex = assertThrows(ResponseStatusException.class, () -> svc.get(id));
    assertThat(ex.getStatusCode().value()).isEqualTo(404);
  }

  @Test
  void createSavesAndReturnsLocation() {
    var req = new CarRequest("X", "Y", 2021, bd("15000.00"));
    var saved = new Car(req.model(), req.brand(), req.productionYear(), req.price());
    saved.setId(UUID.randomUUID());
    when(repo.save(any(Car.class))).thenReturn(saved);

    var created = svc.create(req);
    assertThat(created.id()).isEqualTo(saved.getId());
    assertThat(created.location()).isEqualTo(URI.create("/api/v1/car/" + saved.getId()));
  }

  @Test
  void updateRewritesFields() {
    var id = UUID.randomUUID();
    var existing = new Car("A", "B", 2020, bd("10000.00"));
    existing.setId(id);
    when(repo.findById(id)).thenReturn(Optional.of(existing));

    var req = new CarRequest("A2", "B2", 2021, bd("20000.00"));
    var res = svc.update(id, req);

    assertThat(res.model()).isEqualTo("A2");
    assertThat(res.brand()).isEqualTo("B2");
    assertThat(res.productionYear()).isEqualTo(2021);
    assertThat(res.price()).isEqualByComparingTo("20000.00");
  }

  @Test
  void updateThrows404WhenMissing() {
    var id = UUID.randomUUID();
    when(repo.findById(id)).thenReturn(Optional.empty());

    var req = new CarRequest("A", "B", 2020, bd("10000.00"));
    var ex = assertThrows(ResponseStatusException.class, () -> svc.update(id, req));
    assertThat(ex.getStatusCode().value()).isEqualTo(404);
  }

  @Test
  void deleteWhenExistsDeletes() {
    var id = UUID.randomUUID();
    when(repo.existsById(id)).thenReturn(true);

    svc.delete(id);
    verify(repo).deleteById(id);
  }

  @Test
  void deleteThrows404WhenMissing() {
    var id = UUID.randomUUID();
    when(repo.existsById(id)).thenReturn(false);

    var ex = assertThrows(ResponseStatusException.class, () -> svc.delete(id));
    assertThat(ex.getStatusCode().value()).isEqualTo(404);
  }

  private static BigDecimal bd(String value) {
    return new BigDecimal(value);
  }
}

