import { AfterViewInit, Component, ViewChild, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule} from '@angular/material/sort';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { merge, switchMap, tap, catchError, finalize, EMPTY, Subject, debounceTime, concat, of } from 'rxjs';
import { takeUntilDestroyed as takeUntilDestroyedRxjs } from '@angular/core/rxjs-interop';
import { CarService } from '../../../services/car.service';
import { Car } from '../../../models/car.model';
import { FormGroupDirective } from '@angular/forms';
import { CarConstants } from '../../../constants/car.constants';

type CarForm = FormGroup<{
  model: FormControl<string>;
  brand: FormControl<string>;
  productionYear: FormControl<number>;
  price: FormControl<number>;
}>;

@Component({
  selector: 'app-car-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './car-list.component.html',
  styleUrls: ['./car-list.component.scss'],
})

export class CarListComponent implements AfterViewInit{
  private carService = inject(CarService);
  private fb = inject(NonNullableFormBuilder);
  private destroyRef = inject(DestroyRef);
  
  readonly CarConstants = CarConstants;

  displayedColumns = ['model', 'brand', 'productionYear', 'price', 'actions'];
  rows = signal<Car[]>([]);
  total = signal<number>(0);
  loading = signal<boolean>(true);
  pageSize = CarConstants.DEFAULT_PAGE_SIZE;
  pageSizeOptions = CarConstants.PAGE_SIZE_OPTIONS;

  private forms = new Map<string, CarForm>();
  private refreshTrigger = new Subject<void>();
  private isSortChange = false;
  showNewForm = signal(false);
  creatingInline = signal(false);
  editingId = signal<string | null>(null);
  isEditing = (id: string) => this.editingId() === id;

  newForm: CarForm = this.fb.group({
    model: this.fb.control('', { validators: [Validators.required, Validators.maxLength(CarConstants.FIELD_MAX_LENGTH)] }),
    brand: this.fb.control('', { validators: [Validators.required, Validators.maxLength(CarConstants.FIELD_MAX_LENGTH)] }),
    productionYear: this.fb.control(0, { validators: [Validators.required, Validators.min(CarConstants.PRODUCTION_YEAR_MIN), Validators.max(CarConstants.PRODUCTION_YEAR_MAX)] }),
    price: this.fb.control(0, { validators: [Validators.required, Validators.min(CarConstants.PRICE_MIN), Validators.max(CarConstants.PRICE_MAX)] }),
  });

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('createForm', { read: FormGroupDirective })
  createFormDir!: FormGroupDirective;

  ngAfterViewInit(): void {
    this.setupDataLoading();
  }

  startEdit(row: Car) {
    const current = this.editingId();
    if (current && current !== row.id) {
      const prev = this.rows().find(r => r.id === current);
      if (prev) this.cancelEdit(prev);
    }
    this.formFor(row);
    this.editingId.set(row.id);
  }

  cancelEdit(row: Car) {
    const form = this.forms.get(row.id);
    if (form) form.reset({
      model: row.model,
      brand: row.brand,
      productionYear: row.productionYear,
      price: row.price,
    });
    if (this.editingId() === row.id) this.editingId.set(null);
    if (row.id === CarConstants.NEW_ROW_ID) {
      this.rows.update(rs => rs.filter(r => r.id !== CarConstants.NEW_ROW_ID));
      this.forms.delete(CarConstants.NEW_ROW_ID);
      this.creatingInline.set(false);
    }
  }

  save(row: Car) {
    const form = this.formFor(row);
    if (form.invalid) { form.markAllAsTouched(); return; }
    const { model, brand, productionYear, price } = form.getRawValue();
    this.loading.set(true);
    
    const operation = row.id === CarConstants.NEW_ROW_ID
      ? this.carService.create({ model, brand, productionYear, price })
      : this.carService.update(row.id, { model, brand, productionYear, price });

    operation
      .pipe(
        takeUntilDestroyedRxjs(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: () => {
          if (row.id === CarConstants.NEW_ROW_ID) {
            this.editingId.set(null);
            this.creatingInline.set(false);
            this.forms.delete(CarConstants.NEW_ROW_ID);
            this.refreshCurrentPage(true);
          } else {
            this.editingId.set(null);
            this.refreshCurrentPage();
          }
        },
        error: () => {}
      });
  }

  remove(row: Car) {
    if (!confirm(`Delete "${row.model}"?`)) return;
    this.loading.set(true);
    this.carService.delete(row.id)
      .pipe(
        takeUntilDestroyedRxjs(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: () => {
          this.forms.delete(row.id);
          this.refreshCurrentPage();
        },
        error: () => {}
      });
  }

  create() {
    if (this.newForm.invalid) {
      this.newForm.markAllAsTouched();
      return;
    }
    const body = this.newForm.getRawValue();
    this.loading.set(true);
    this.carService.create(body)
      .pipe(
        takeUntilDestroyedRxjs(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: () => {
          if (this.createFormDir) {
            this.createFormDir.resetForm({ model: '', brand: '', productionYear: 0, price: 0 });
          } else {
            this.newForm.reset({ model: '', brand: '', productionYear: 0, price: 0 });
          }
          this.showNewForm.set(false);
          this.refreshCurrentPage(true);
        },
        error: () => {}
      });
  }

  openCreateInline() {
    if (this.editingId() || this.creatingInline()) return;
    const newRow: Car = { id: CarConstants.NEW_ROW_ID, model: '', brand: '', productionYear: CarConstants.INLINE_CREATE_DEFAULT_YEAR, price: CarConstants.INLINE_CREATE_DEFAULT_PRICE };
    this.rows.update(rs => [newRow, ...rs]);
    this.forms.set(CarConstants.NEW_ROW_ID, this.fb.group({
      model: this.fb.control('', { validators: [Validators.required, Validators.maxLength(CarConstants.FIELD_MAX_LENGTH)] }),
      brand: this.fb.control('', { validators: [Validators.required, Validators.maxLength(CarConstants.FIELD_MAX_LENGTH)] }),
      productionYear: this.fb.control(CarConstants.INLINE_CREATE_DEFAULT_YEAR, { validators: [Validators.required, Validators.min(CarConstants.PRODUCTION_YEAR_MIN), Validators.max(CarConstants.PRODUCTION_YEAR_MAX)] }),
      price: this.fb.control(CarConstants.INLINE_CREATE_DEFAULT_PRICE, { validators: [Validators.required, Validators.min(CarConstants.PRICE_MIN), Validators.max(CarConstants.PRICE_MAX)] }),
    }));
    this.editingId.set(CarConstants.NEW_ROW_ID);
    this.creatingInline.set(true);
  }

  openCreateForm() {
    if (this.editingId()) return;
    this.showNewForm.set(true);
  }

  discardCreate() {
    if (this.createFormDir) {
      this.createFormDir.resetForm({ model: '', brand: '', productionYear: 0, price: 0 });
    } else {
      this.newForm.reset({ model: '', brand: '', productionYear: 0, price: 0 });
      Object.values(this.newForm.controls).forEach(c => { c.markAsPristine(); c.markAsUntouched(); });
    }
    this.showNewForm.set(false);
  }

  rowInvalid(row: Car) {
    return this.formFor(row).invalid;
  }

  control<K extends keyof CarForm['controls']>(row: Car, key: K): CarForm['controls'][K] {
    return this.formFor(row).controls[key];
  }

  private setupDataLoading(): void {
    const dataSource = merge(
      this.sort.sortChange.pipe(
        tap(() => {
          this.isSortChange = true;
          if (this.paginator.pageIndex !== CarConstants.DEFAULT_PAGE) {
            this.paginator.pageIndex = CarConstants.DEFAULT_PAGE;
          }
        })
      ),
      this.paginator.page,
      this.refreshTrigger
    );

    concat(
      of({}),
      dataSource.pipe(debounceTime(CarConstants.DEBOUNCE_TIME_MS))
    )
      .pipe(
        switchMap(() => {
          this.loading.set(true);
          const sortExpr = `${this.sort.active || CarConstants.DEFAULT_SORT_FIELD},${this.sort.direction || CarConstants.DEFAULT_SORT_DIRECTION}`;
          const page = this.isSortChange ? CarConstants.DEFAULT_PAGE : (this.paginator.pageIndex ?? CarConstants.DEFAULT_PAGE);
          const size = this.paginator.pageSize || this.pageSize;
          this.isSortChange = false;
          return this.carService.list(page, size, sortExpr).pipe(
            tap(page => {
              this.total.set(page.totalElements ?? 0);
              this.rows.set(page.content ?? []);
              
              this.resetInlineState();
            }),
            catchError(() => {
              this.total.set(0);
              this.rows.set([]);
              return EMPTY;
            }),
            finalize(() => this.loading.set(false))
          );
        }),
        takeUntilDestroyedRxjs(this.destroyRef)
      )
      .subscribe();
  }

  private formFor(row: Car): CarForm {
    let form = this.forms.get(row.id);
    if (!form) {
      form = this.fb.group({
        model: this.fb.control(row.model, { validators: [Validators.required, Validators.maxLength(CarConstants.FIELD_MAX_LENGTH)] }),
        brand: this.fb.control(row.brand, { validators: [Validators.required, Validators.maxLength(CarConstants.FIELD_MAX_LENGTH)] }),
        productionYear: this.fb.control(row.productionYear, { validators: [Validators.required, Validators.min(CarConstants.PRODUCTION_YEAR_MIN), Validators.max(CarConstants.PRODUCTION_YEAR_MAX)] }),
        price: this.fb.control(row.price, { validators: [Validators.required, Validators.min(CarConstants.PRICE_MIN), Validators.max(CarConstants.PRICE_MAX)] }),
      });
      this.forms.set(row.id, form);
    }
    return form;
  }

  private resetInlineState(): void {
    if (this.creatingInline() || this.editingId()) {
      const currentEditingId = this.editingId();
      if (currentEditingId) {
        this.forms.delete(currentEditingId);
      }
      this.creatingInline.set(false);
      this.editingId.set(null);
    }
  }

  private refreshCurrentPage(goToFirst = false): void {
    if (goToFirst && this.paginator.pageIndex !== CarConstants.DEFAULT_PAGE) {
      this.paginator.firstPage();
    } else {
      this.refreshTrigger.next();
    }
  }

}

