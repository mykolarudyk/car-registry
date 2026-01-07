import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CarService } from './car.service';

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

  it('list() calls GET /car with paging params and returns the page', () => {
    let result: any;
    svc.list(1, 20, 'model,desc').subscribe(r => (result = r));

    const req = http.expectOne(r => r.method === 'GET' && r.url.endsWith('/car'));
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('size')).toBe('20');
    expect(req.request.params.get('sort')).toBe('model,desc');

    req.flush({
      content: [{ id: '1', model: 'Camry', brand: 'Toyota', productionYear: 2020, price: 25000.00 }],
      totalElements: 1,
    });

    expect(result).toBeTruthy();
    expect(result.content.length).toBe(1);
    expect(result.totalElements).toBe(1);
  });

  it('create() POSTs to /car', () => {
    let created: any;
    svc.create({ model: 'Civic', brand: 'Honda', productionYear: 2021, price: 22000 }).subscribe(r => (created = r));

    const req = http.expectOne(r => r.method === 'POST' && r.url.endsWith('/car'));
    expect(req.request.body).toEqual({ model: 'Civic', brand: 'Honda', productionYear: 2021, price: 22000 });
    req.flush({ id: '123', model: 'Civic', brand: 'Honda', productionYear: 2021, price: 22000.00 });

    expect(created).toBeTruthy();
    expect(created.id).toBe('123');
  });

  it('update() PUTs to /car/{id}', () => {
    let updated: any;
    svc.update('abc', { model: 'X', brand: 'Y', productionYear: 2020, price: 10000 }).subscribe(r => (updated = r));

    const req = http.expectOne(r => r.method === 'PUT' && r.url.endsWith('/car/abc'));
    expect(req.request.body).toEqual({ model: 'X', brand: 'Y', productionYear: 2020, price: 10000 });
    req.flush({ id: 'abc', model: 'X', brand: 'Y', productionYear: 2020, price: 10000.00 });

    expect(updated).toBeTruthy();
    expect(updated.id).toBe('abc');
  });

  it('delete() DELETEs /car/{id}', () => {
    let done = false;
    svc.delete('abc').subscribe(() => (done = true));

    const req = http.expectOne(r => r.method === 'DELETE' && r.url.endsWith('/car/abc'));
    expect(req.request.method).toBe('DELETE');
    req.flush({});

    expect(done).toBeTrue();
  });
});

