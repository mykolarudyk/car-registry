import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CarService } from './car.service';
import { Car } from '../models/car.model';
import { Page } from '../models/page.model';

describe('CarService', () => {
  let svc: CarService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CarService],
    });
    svc = TestBed.inject(CarService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('list() calls GET /v1/car with paging params and returns the page', () => {
    let result: Page<Car> | undefined;
    svc.list(1, 20, 'model,desc').subscribe(r => (result = r));

    const req = http.expectOne(r => r.method === 'GET' && r.url.endsWith('/v1/car'));
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('size')).toBe('20');
    expect(req.request.params.get('sort')).toBe('model,desc');

    const mockPage: Page<Car> = {
      content: [{ id: '1', model: 'Camry', brand: 'Toyota', productionYear: 2020, price: 25000 }],
      totalElements: 1,
      totalPages: 1,
      size: 20,
      number: 1,
    };
    req.flush(mockPage);

    expect(result).toBeTruthy();
    expect(result?.content.length).toBe(1);
    expect(result?.totalElements).toBe(1);
  });

  it('get() calls GET /v1/car/{id} and returns the car', () => {
    let result: Car | undefined;
    svc.get('123').subscribe(r => (result = r));

    const req = http.expectOne(r => r.method === 'GET' && r.url.endsWith('/v1/car/123'));
    const mockCar: Car = { id: '123', model: 'Camry', brand: 'Toyota', productionYear: 2020, price: 25000 };
    req.flush(mockCar);

    expect(result).toBeTruthy();
    expect(result?.id).toBe('123');
    expect(result?.model).toBe('Camry');
  });

  it('create() POSTs to /v1/car and returns the created car', () => {
    let created: Car | undefined;
    svc.create({ model: 'Civic', brand: 'Honda', productionYear: 2021, price: 22000 }).subscribe(r => (created = r));

    const req = http.expectOne(r => r.method === 'POST' && r.url.endsWith('/v1/car'));
    expect(req.request.body).toEqual({ model: 'Civic', brand: 'Honda', productionYear: 2021, price: 22000 });
    const mockCar: Car = { id: '123', model: 'Civic', brand: 'Honda', productionYear: 2021, price: 22000 };
    req.flush(mockCar);

    expect(created).toBeTruthy();
    expect(created?.id).toBe('123');
    expect(created?.model).toBe('Civic');
  });

  it('update() PUTs to /v1/car/{id} and returns the updated car', () => {
    let updated: Car | undefined;
    svc.update('abc', { model: 'X', brand: 'Y', productionYear: 2020, price: 10000 }).subscribe(r => (updated = r));

    const req = http.expectOne(r => r.method === 'PUT' && r.url.endsWith('/v1/car/abc'));
    expect(req.request.body).toEqual({ model: 'X', brand: 'Y', productionYear: 2020, price: 10000 });
    const mockCar: Car = { id: 'abc', model: 'X', brand: 'Y', productionYear: 2020, price: 10000 };
    req.flush(mockCar);

    expect(updated).toBeTruthy();
    expect(updated?.id).toBe('abc');
    expect(updated?.model).toBe('X');
  });

  it('delete() DELETEs /v1/car/{id}', () => {
    let done = false;
    svc.delete('abc').subscribe(() => (done = true));

    const req = http.expectOne(r => r.method === 'DELETE' && r.url.endsWith('/v1/car/abc'));
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(done).toBeTrue();
  });

  it('list() uses default parameters when not provided', () => {
    let result: Page<Car> | undefined;
    svc.list().subscribe(r => (result = r));

    const req = http.expectOne(r => r.method === 'GET' && r.url.endsWith('/v1/car'));
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('20');
    expect(req.request.params.get('sort')).toBe('model,asc');

    const mockPage: Page<Car> = {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 20,
      number: 0,
    };
    req.flush(mockPage);

    expect(result).toBeTruthy();
  });
});

