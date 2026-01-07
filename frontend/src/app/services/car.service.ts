import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Page } from '../models/page.model';
import { Car } from '../models/car.model';
import { CarConstants } from '../constants/car.constants';

@Injectable({ providedIn: 'root' })
export class CarService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/v1/car`;

  list(page = CarConstants.DEFAULT_PAGE, size = CarConstants.DEFAULT_PAGE_SIZE, sort = CarConstants.DEFAULT_SORT): Observable<Page<Car>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', sort);
    return this.http.get<Page<Car>>(this.base, { params });
  }

  get(id: string) {
    return this.http.get<Car>(`${this.base}/${id}`);
  }

  create(body: Omit<Car, 'id'>) {
    return this.http.post<Car>(this.base, body);
  }

  update(id: string, body: Omit<Car, 'id'>) {
    return this.http.put<Car>(`${this.base}/${id}`, body);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}

