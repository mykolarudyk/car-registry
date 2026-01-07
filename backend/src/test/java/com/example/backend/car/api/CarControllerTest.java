package com.example.backend.car.api;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.example.backend.car.api.CarDtos.CarRequest;
import com.example.backend.car.api.CarDtos.CarResponse;
import com.example.backend.car.app.CarService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.test.context.bean.override.mockito.MockitoBean;

@WebMvcTest(CarController.class)
class CarControllerTest {

  @Autowired MockMvc mvc;
  @Autowired ObjectMapper om;

  @MockitoBean
  private CarService svc;

  @Test
  void listReturnsPage() throws Exception {
    var resp = new CarResponse(UUID.randomUUID(), "A", "B", 2020, bd("10000.00"));
    var page = new PageImpl<>(List.of(resp), PageRequest.of(0, 20), 1);
    when(svc.list(any(Pageable.class))).thenReturn(page);

    mvc.perform(get("/api/v1/car"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content[0].model").value("A"))
        .andExpect(jsonPath("$.totalElements").value(1));
  }

  @Test
  void getByIdReturnsEntity() throws Exception {
    var id = UUID.randomUUID();
    var resp = new CarResponse(id, "A", "B", 2020, bd("10000.00"));
    when(svc.get(id)).thenReturn(resp);

    mvc.perform(get("/api/v1/car/{id}", id))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(id.toString()))
        .andExpect(jsonPath("$.productionYear").value(2020));
  }

  @Test
  void getMissingReturns404() throws Exception {
    var id = UUID.randomUUID();
    when(svc.get(id)).thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Car " + id + " not found"));

    mvc.perform(get("/api/v1/car/{id}", id))
        .andExpect(status().isNotFound());
  }

  @Test
  void createReturns201WithLocationAndBody() throws Exception {
    var id = UUID.randomUUID();
    var req = new CarRequest("A", "B", 2020, bd("10000.00"));
    var resp = new CarResponse(id, "A", "B", 2020, bd("10000.00"));

    when(svc.create(any(CarRequest.class))).thenReturn(new com.example.backend.car.app.CarService.Created(id, URI.create("/api/v1/car/" + id)));
    when(svc.get(id)).thenReturn(resp);

    mvc.perform(post("/api/v1/car")
            .contentType(MediaType.APPLICATION_JSON)
            .content(om.writeValueAsString(req)))
        .andExpect(status().isCreated())
        .andExpect(header().string("Location", "/api/v1/car/" + id))
        .andExpect(jsonPath("$.id").value(id.toString()))
        .andExpect(jsonPath("$.model").value("A"));
  }

  @Test
  void validationErrorReturns400() throws Exception {
    var badJson = """
      {"model":"","brand":"","productionYear":0,"price":0}
      """;
    mvc.perform(post("/api/v1/car")
            .contentType(MediaType.APPLICATION_JSON)
            .content(badJson))
        .andExpect(status().isBadRequest());
  }

  @Test
  void updateReturnsUpdatedBody() throws Exception {
    var id = UUID.randomUUID();
    var req = new CarRequest("A2", "B2", 2021, bd("20000.00"));
    var resp = new CarResponse(id, "A2", "B2", 2021, bd("20000.00"));

    when(svc.update(eq(id), any(CarRequest.class))).thenReturn(resp);

    mvc.perform(put("/api/v1/car/{id}", id)
            .contentType(MediaType.APPLICATION_JSON)
            .content(om.writeValueAsString(req)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.model").value("A2"))
        .andExpect(jsonPath("$.productionYear").value(2021))
        .andExpect(jsonPath("$.price").value(20000.0));
  }

  @Test
  void deleteReturns204() throws Exception {
    var id = UUID.randomUUID();
    mvc.perform(delete("/api/v1/car/{id}", id))
        .andExpect(status().isNoContent());
  }

  @Test
  void deleteMissingReturns404() throws Exception {
    var id = UUID.randomUUID();
    doThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Car " + id + " not found"))
        .when(svc).delete(id);

    mvc.perform(delete("/api/v1/car/{id}", id))
        .andExpect(status().isNotFound());
  }

  private static BigDecimal bd(String value) {
    return new BigDecimal(value);
  }
}

