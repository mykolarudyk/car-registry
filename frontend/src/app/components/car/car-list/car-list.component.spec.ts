import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { of, throwError, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CarListComponent } from './car-list.component';
import { CarService } from '../../../services/car.service';
import { Car } from '../../../models/car.model';

describe('CarListComponent', () => {
  let component: CarListComponent;
  let fixture: ComponentFixture<CarListComponent>;
  let carService: jasmine.SpyObj<CarService>;

  const mockCars: Car[] = [
    { id: '1', model: 'Camry', brand: 'Toyota', productionYear: 2020, price: 25000 },
    { id: '2', model: 'Civic', brand: 'Honda', productionYear: 2021, price: 22000 },
  ];

  const mockPageResponse = {
    content: mockCars,
    totalElements: 2,
    totalPages: 1,
    size: 20,
    number: 0,
  };

  // Helper function to setup component with data loaded
  function setupComponentWithData() {
    carService.list.and.returnValue(of(mockPageResponse));
    fixture.detectChanges();
    component.ngAfterViewInit();
  }

  // Helper function to setup component for create operations
  function setupForCreate() {
    setupComponentWithData();
    component.newForm.patchValue({
      model: 'Test Model',
      brand: 'Test Brand',
      productionYear: 2020,
      price: 10000,
    });
  }

  // Helper function to setup component for edit operations
  function setupForEdit(car: Car = mockCars[0]) {
    setupComponentWithData();
    component.startEdit(car);
  }

  beforeEach(async () => {
    const carServiceSpy = jasmine.createSpyObj('CarService', ['list', 'create', 'update', 'delete']);

    await TestBed.configureTestingModule({
      imports: [CarListComponent, HttpClientTestingModule, NoopAnimationsModule],
      providers: [{ provide: CarService, useValue: carServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(CarListComponent);
    component = fixture.componentInstance;
    carService = TestBed.inject(CarService) as jasmine.SpyObj<CarService>;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default page size of 20', () => {
      expect(component.pageSize).toBe(20);
    });

    it('should initialize with empty rows and zero total', () => {
      expect(component.rows().length).toBe(0);
      expect(component.total()).toBe(0);
    });

    it('should initialize with loading state true', () => {
      expect(component.loading()).toBe(true);
    });

    it('should initialize with newForm as invalid', () => {
      expect(component.newForm.valid).toBe(false);
    });
  });

  describe('Data Loading', () => {
    it('should load cars on init', () => {
      carService.list.and.returnValue(of(mockPageResponse));
      fixture.detectChanges();
      component.ngAfterViewInit();

      expect(carService.list).toHaveBeenCalled();
      expect(component.rows().length).toBe(2);
      expect(component.total()).toBe(2);
    });

    it('should call list with correct parameters on init', () => {
      carService.list.and.returnValue(of(mockPageResponse));
      fixture.detectChanges();
      component.ngAfterViewInit();

      expect(carService.list).toHaveBeenCalledWith(0, 20, 'model,asc');
    });

    it('should set loading to false after successful load', () => {
      carService.list.and.returnValue(of(mockPageResponse));
      fixture.detectChanges();
      component.ngAfterViewInit();

      expect(component.loading()).toBe(false);
    });

    it('should handle errors when loading cars', () => {
      carService.list.and.returnValue(throwError(() => new Error('Network error')));

      fixture.detectChanges();
      component.ngAfterViewInit();

      expect(component.loading()).toBe(false);
      expect(component.rows().length).toBe(0);
      expect(component.total()).toBe(0);
    });
  });

  describe('Create Car', () => {
    it('should create a new car with valid form', () => {
      setupComponentWithData();
      const newCar: Car = { id: '3', model: 'Corolla', brand: 'Toyota', productionYear: 2022, price: 23000 };
      carService.create.and.returnValue(of(newCar));
      carService.list.and.returnValue(of(mockPageResponse));

      component.newForm.patchValue({
        model: 'Corolla',
        brand: 'Toyota',
        productionYear: 2022,
        price: 23000,
      });

      component.create();

      expect(carService.create).toHaveBeenCalledWith({
        model: 'Corolla',
        brand: 'Toyota',
        productionYear: 2022,
        price: 23000,
      });
    });

    it('should not create with invalid form', () => {
      component.newForm.patchValue({
        model: '',
        brand: 'Toyota',
        productionYear: 2020,
        price: 23000,
      });

      component.create();

      expect(carService.create).not.toHaveBeenCalled();
      expect(component.newForm.controls.model.touched).toBe(true);
    });

    it('should set loading during create', fakeAsync(() => {
      setupForCreate();
      carService.create.and.returnValue(timer(10).pipe(switchMap(() => of({} as Car))));
      carService.list.and.returnValue(of(mockPageResponse));

      component.create();
      expect(component.loading()).toBe(true);

      tick(10);
      expect(component.loading()).toBe(false);
    }));

    it('should handle create error', fakeAsync(() => {
      setupForCreate();
      carService.create.and.returnValue(throwError(() => new Error('Create failed')));

      component.create();
      tick();

      expect(component.loading()).toBe(false);
    }));

    it('should reset form and hide new form after successful create', fakeAsync(() => {
      setupForCreate();
      carService.create.and.returnValue(of({} as Car));
      carService.list.and.returnValue(of(mockPageResponse));
      component.showNewForm.set(true);

      component.create();
      tick();

      expect(component.showNewForm()).toBe(false);
      // Form should be reset (either via createFormDir or newForm.reset)
      expect(component.newForm.value.model).toBe('');
    }));
  });

  describe('Update Car', () => {
    it('should update a car with valid form', () => {
      setupForEdit();
      const updatedCar: Car = { id: '1', model: 'Camry Updated', brand: 'Toyota', productionYear: 2020, price: 26000 };
      carService.update.and.returnValue(of(updatedCar));
      carService.list.and.returnValue(of(mockPageResponse));

      const modelControl = component.control(mockCars[0], 'model');
      modelControl.setValue('Camry Updated');
      const priceControl = component.control(mockCars[0], 'price');
      priceControl.setValue(26000);

      component.save(mockCars[0]);

      expect(carService.update).toHaveBeenCalledWith('1', jasmine.objectContaining({
        model: 'Camry Updated',
        price: 26000,
      }));
    });

    it('should not save invalid form', () => {
      setupForEdit();
      const modelControl = component.control(mockCars[0], 'model');
      modelControl.setValue('');

      component.save(mockCars[0]);

      expect(carService.update).not.toHaveBeenCalled();
      expect(modelControl.touched).toBe(true);
    });

    it('should handle update error', fakeAsync(() => {
      setupForEdit();
      carService.update.and.returnValue(throwError(() => new Error('Update failed')));

      component.save(mockCars[0]);
      tick();

      expect(component.loading()).toBe(false);
    }));

    it('should set loading during update', fakeAsync(() => {
      setupForEdit();
      carService.update.and.returnValue(timer(10).pipe(switchMap(() => of(mockCars[0]))));
      carService.list.and.returnValue(of(mockPageResponse));

      component.save(mockCars[0]);
      expect(component.loading()).toBe(true);

      tick(10);
      expect(component.loading()).toBe(false);
    }));
  });

  describe('Delete Car', () => {
    it('should delete a car when confirmed', () => {
      setupComponentWithData();
      carService.delete.and.returnValue(of(undefined));
      carService.list.and.returnValue(of(mockPageResponse));
      spyOn(window, 'confirm').and.returnValue(true);

      component.remove(mockCars[0]);

      expect(carService.delete).toHaveBeenCalledWith('1');
    });

    it('should not delete if user cancels confirmation', () => {
      setupComponentWithData();
      spyOn(window, 'confirm').and.returnValue(false);

      component.remove(mockCars[0]);

      expect(carService.delete).not.toHaveBeenCalled();
    });

    it('should set loading during delete', fakeAsync(() => {
      setupComponentWithData();
      carService.delete.and.returnValue(timer(10).pipe(switchMap(() => of(undefined))));
      carService.list.and.returnValue(of(mockPageResponse));
      spyOn(window, 'confirm').and.returnValue(true);

      component.remove(mockCars[0]);
      expect(component.loading()).toBe(true);

      tick(10);
      expect(component.loading()).toBe(false);
    }));

    it('should handle delete error', fakeAsync(() => {
      setupComponentWithData();
      carService.delete.and.returnValue(throwError(() => new Error('Delete failed')));
      spyOn(window, 'confirm').and.returnValue(true);

      component.remove(mockCars[0]);
      tick();

      expect(component.loading()).toBe(false);
    }));
  });

  describe('Edit Mode', () => {
    it('should start edit mode', () => {
      setupComponentWithData();
      component.startEdit(mockCars[0]);

      expect(component.isEditing('1')).toBe(true);
      expect(component.control(mockCars[0], 'model').value).toBe('Camry');
    });

    it('should cancel editing and reset form', () => {
      setupForEdit();
      const modelControl = component.control(mockCars[0], 'model');
      modelControl.setValue('Modified');

      component.cancelEdit(mockCars[0]);

      expect(component.isEditing('1')).toBe(false);
      expect(modelControl.value).toBe('Camry'); // Reset to original
    });

    it('should cancel previous edit when starting new edit', () => {
      setupComponentWithData();
      component.startEdit(mockCars[0]);
      expect(component.isEditing('1')).toBe(true);

      component.startEdit(mockCars[1]);
      expect(component.isEditing('1')).toBe(false);
      expect(component.isEditing('2')).toBe(true);
    });
  });

  describe('Inline Create', () => {
    it('should open inline create form', () => {
      setupComponentWithData();
      component.openCreateInline();

      expect(component.creatingInline()).toBe(true);
      expect(component.editingId()).toBe('__new__');
      expect(component.rows().some(r => r.id === '__new__')).toBe(true);
    });

    it('should not open inline create if already editing', () => {
      setupForEdit();
      component.openCreateInline();

      expect(component.creatingInline()).toBe(false);
    });

    it('should not open inline create if already creating', () => {
      setupComponentWithData();
      component.openCreateInline();
      const initialCount = component.rows().length;
      component.openCreateInline();

      expect(component.rows().length).toBe(initialCount);
    });

    it('should discard inline create', () => {
      setupComponentWithData();
      component.openCreateInline();
      const newRow = component.rows().find(r => r.id === '__new__');
      expect(newRow).toBeTruthy();

      if (newRow) {
        component.cancelEdit(newRow);
      }

      expect(component.creatingInline()).toBe(false);
      expect(component.editingId()).toBe(null);
      expect(component.rows().some(r => r.id === '__new__')).toBe(false);
    });

    it('should create car via inline form', fakeAsync(() => {
      setupComponentWithData();
      const newCar: Car = { id: '3', model: 'New Car', brand: 'Brand', productionYear: 2023, price: 30000 };
      carService.create.and.returnValue(of(newCar));
      carService.list.and.returnValue(of(mockPageResponse));

      component.openCreateInline();
      const newRow = component.rows().find(r => r.id === '__new__')!;
      
      component.control(newRow, 'model').setValue('New Car');
      component.control(newRow, 'brand').setValue('Brand');
      component.control(newRow, 'productionYear').setValue(2023);
      component.control(newRow, 'price').setValue(30000);

      component.save(newRow);
      tick();

      expect(carService.create).toHaveBeenCalled();
      expect(component.creatingInline()).toBe(false);
    }));
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    describe('Required Fields', () => {
      it('should require model field', () => {
        component.newForm.patchValue({
          model: '',
          brand: 'Test Brand',
          productionYear: 2020,
          price: 10000,
        });

        expect(component.newForm.controls.model.invalid).toBe(true);
        expect(component.newForm.controls.model.hasError('required')).toBe(true);
      });

      it('should require brand field', () => {
        component.newForm.patchValue({
          model: 'Test Model',
          brand: '',
          productionYear: 2020,
          price: 10000,
        });

        expect(component.newForm.controls.brand.invalid).toBe(true);
        expect(component.newForm.controls.brand.hasError('required')).toBe(true);
      });
    });

    describe('Field Constraints', () => {
      it('should validate model maxLength', () => {
        component.newForm.patchValue({
          model: 'a'.repeat(101),
          brand: 'Brand',
          productionYear: 2020,
          price: 10000,
        });

        expect(component.newForm.controls.model.invalid).toBe(true);
        expect(component.newForm.controls.model.hasError('maxlength')).toBe(true);
      });

      it('should validate brand maxLength', () => {
        component.newForm.patchValue({
          model: 'Model',
          brand: 'a'.repeat(101),
          productionYear: 2020,
          price: 10000,
        });

        expect(component.newForm.controls.brand.invalid).toBe(true);
        expect(component.newForm.controls.brand.hasError('maxlength')).toBe(true);
      });

      it('should validate production year minimum', () => {
        component.newForm.patchValue({
          model: 'Test Model',
          brand: 'Test Brand',
          productionYear: 0,
          price: 10000,
        });

        expect(component.newForm.controls.productionYear.invalid).toBe(true);
        expect(component.newForm.controls.productionYear.hasError('min')).toBe(true);
      });

      it('should validate price minimum', () => {
        component.newForm.patchValue({
          model: 'Test Model',
          brand: 'Test Brand',
          productionYear: 2020,
          price: 0,
        });

        expect(component.newForm.controls.price.invalid).toBe(true);
        expect(component.newForm.controls.price.hasError('min')).toBe(true);
      });

      it('should validate price maximum', () => {
        component.newForm.patchValue({
          model: 'Test Model',
          brand: 'Test Brand',
          productionYear: 2020,
          price: 100000000,
        });

        expect(component.newForm.controls.price.invalid).toBe(true);
        expect(component.newForm.controls.price.hasError('max')).toBe(true);
      });
    });

    it('should validate complete valid form', () => {
      component.newForm.patchValue({
        model: 'Test Model',
        brand: 'Test Brand',
        productionYear: 2020,
        price: 10000,
      });

      expect(component.newForm.valid).toBe(true);
    });
  });

  describe('Create Form', () => {
    it('should open create form', () => {
      setupComponentWithData();
      component.openCreateForm();

      expect(component.showNewForm()).toBe(true);
    });

    it('should not open create form if already editing', () => {
      setupForEdit();
      component.openCreateForm();

      expect(component.showNewForm()).toBe(false);
    });

    it('should discard create form', () => {
      component.showNewForm.set(true);
      component.discardCreate();

      expect(component.showNewForm()).toBe(false);
    });
  });

  describe('Form Helpers', () => {
    it('should check if row is invalid', () => {
      setupForEdit();
      const modelControl = component.control(mockCars[0], 'model');
      modelControl.setValue('');

      expect(component.rowInvalid(mockCars[0])).toBe(true);
    });

    it('should get form control for row', () => {
      setupForEdit();
      const control = component.control(mockCars[0], 'model');

      expect(control).toBeTruthy();
      expect(control.value).toBe('Camry');
    });

    it('should return false for rowInvalid when form is valid', () => {
      setupForEdit();
      expect(component.rowInvalid(mockCars[0])).toBe(false);
    });
  });

  describe('Template Integration', () => {
    it('should render table headers', () => {
      setupComponentWithData();
      fixture.detectChanges();

      const headers = fixture.debugElement.queryAll(By.css('th'));
      expect(headers.length).toBeGreaterThan(0);
      expect(headers.some(h => h.nativeElement.textContent.includes('Model'))).toBe(true);
      expect(headers.some(h => h.nativeElement.textContent.includes('Brand'))).toBe(true);
    });

    it('should render car data in table rows', () => {
      setupComponentWithData();
      fixture.detectChanges();

      const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
      expect(rows.length).toBe(2);
    });

    it('should display loading bar when loading', () => {
      carService.list.and.returnValue(of(mockPageResponse));
      fixture.detectChanges();
      component.ngAfterViewInit();
      component.loading.set(true);
      fixture.detectChanges();

      const progressBar = fixture.debugElement.query(By.css('mat-progress-bar'));
      expect(progressBar).toBeTruthy();
    });

    it('should hide loading bar when not loading', () => {
      setupComponentWithData();
      fixture.detectChanges();

      const progressBar = fixture.debugElement.query(By.css('mat-progress-bar'));
      expect(progressBar).toBeFalsy();
    });

    it('should render create form when showNewForm is true', () => {
      setupComponentWithData();
      component.showNewForm.set(true);
      fixture.detectChanges();

      const form = fixture.debugElement.query(By.css('form'));
      expect(form).toBeTruthy();
    });

    it('should render paginator with correct total', () => {
      setupComponentWithData();
      fixture.detectChanges();

      const paginator = fixture.debugElement.query(By.css('mat-paginator'));
      expect(paginator).toBeTruthy();
      expect(component.total()).toBe(2);
    });

    it('should display edit inputs when row is being edited', () => {
      setupForEdit();
      fixture.detectChanges();

      // Verify edit mode is active - inputs are conditionally rendered via @if
      expect(component.isEditing('1')).toBe(true);
      // Check for any input elements in the table (they use [formControl] binding, not formControlName)
      const inputs = fixture.debugElement.queryAll(By.css('tbody input'));
      // At least one input should exist when editing (price input uses [formControl])
      expect(inputs.length).toBeGreaterThan(0);
    });

    it('should display action buttons for each row', () => {
      setupComponentWithData();
      fixture.detectChanges();

      const actionButtons = fixture.debugElement.queryAll(By.css('button[mat-icon-button]'));
      expect(actionButtons.length).toBeGreaterThan(0);
    });
  });
});

