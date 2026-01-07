ENGELSK:
1) How to set up and run the application

Prerequisites:
Java 21 (project uses Spring Boot 3.5.6)
Node.js (project uses 22.18), npm (10.9.3)
Angular (20.1.6)

git clone https://github.com/mykolarudyk/car-registry.git
cd car-registry

# install concurrently
npm install

cd frontend
npm install
cd ..

npm run dev

Backend: http://localhost:8080
Frontend: http://localhost:4200
H2 console: http://localhost:8080/h2

2) How the code is structured and the rationale
Backend structure - Maven standart layout

backend/
└─ src/
   ├─ main/java/com/example/backend/
   │  ├─ BackendApplication.java
   │  ├─ BootstrapData.java                   # Seeds mock car records on first run
   │  ├─ common/CorsConfig.java               # CORS (allow requests from FE)
   │  └─ car/
   │     ├─ api/
   │     │  ├─ CarController.java            # REST endpoints under /api/car
   │     │  └─ CarDtos.java                  # DTOs + validation
   │     ├─ app/
   │     │  └─ CarService.java               # Application/service layer + 404 mapping
   │     ├─ domain/
   │     │  └─ Car.java                      # JPA entity with constraints
   │     └─ infra/
   │        └─ CarRepository.java            # Spring Data JPA repository
   └─ test/java/com/example/backend/
      ├─ BackendApplicationTests.java
      └─ car/
         ├─ api/CarControllerTest.java
         ├─ app/CarServiceTest.java
         └─ infra/CarRepositoryTest.java

-api  - contains controllers and DTOs
-app - orchestration/business logic
-domain - JPA entities
-infra - data access via Spring Data JPA

Frontend structure

frontend/
└─ src/
   ├─ app/
   │  ├─ app.ts / app.html / app.routes.ts
   │  ├─ components/
   │  │  └─ car/
   │  │     └─ car-list/
   │  │        ├─ car-list.component.ts
   │  │        ├─ car-list.component.html
   │  │        └─ car-list.component.scss
   │  ├─ models/
   │  │  ├─ car.model.ts                # interface
   │  │  └─ page.model.ts             # Page interface for backend pagination
   │  ├─ services/
   │  │  └─ car.service.ts               # HTTP client
   └─ environments/
      └─ environment.ts                   # apiBase

- Standart Angular structure
- 3 folders - components, models and services for separation of concerns.
When app grows - for example car, motorcycle, truck - then it will be better to create features folder and store corresponding files inside respective subfolders.
 - components - UI only
 - services - data access
 - models - types only
 - I use Angular Material (forms, paginator, sorting out of the box) and Reactive forms

3) What tools are used for testing

BE testing

JUnit 5 (Jupiter) — test framework
Spring Boot Test — test slices (@DataJpaTest, @WebMvcTest), MockMvc.
Mockito — mocking service/repository

# Run tests BE
cd backend
./mvnw test

FE testing

Jasmine — test framework.
Karma — test runner (Angular CLI).
Angular testing utilities — TestBed, HttpClientTestingModule, NoopAnimationsModule, fakeAsync/tick.

# Run tests FE
cd frontend
ng test

NORSK:
1) Slik setter du opp og kjører applikasjonen

Forutsetninger:
Java 21 (prosjektet bruker Spring Boot 3.5.6)
Node.js (prosjektet bruker 22.18), npm (10.9.3)
Angular (20.1.6)

git clone https://github.com/mykolarudyk/car-registry.git
cd car-registry

# installer 'concurrently'
npm install

cd frontend
npm install
cd ..

npm run dev

Backend: http://localhost:8080
Frontend: http://localhost:4200
H2-konsoll: http://localhost:8080/h2

2) Hvordan koden er strukturert og begrunnelsen bak strukturen.

Backend-struktur – standard Maven-oppsett

backend/
└─ src/
   ├─ main/java/com/example/backend/
   │  ├─ BackendApplication.java
   │  ├─ BootstrapData.java                   # Fyller med eksempeldata for biler ved første kjøring
   │  ├─ common/CorsConfig.java               # CORS (tillater forespørsler fra frontend)
   │  └─ car/
   │     ├─ api/
   │     │  ├─ CarController.java            # REST-endepunkter under /api/car
   │     │  └─ CarDtos.java                  # DTO-er + validering
   │     ├─ app/
   │     │  └─ CarService.java               # Applikasjons-/tjenestelag + 404-håndtering
   │     ├─ domain/
   │     │  └─ Car.java                      # JPA-entitet med begrensninger
   │     └─ infra/
   │        └─ CarRepository.java            # Spring Data JPA-repositorium
   └─ test/java/com/example/backend/
      ├─ BackendApplicationTests.java
      └─ car/
         ├─ api/CarControllerTest.java
         ├─ app/CarServiceTest.java
         └─ infra/CarRepositoryTest.java


api – inneholder controllere og DTO-er
app – orkestrering/forretningslogikk
domain – JPA-entiteter
infra – datatilgang via Spring Data JPA

Frontend-struktur

frontend/
└─ src/
   ├─ app/
   │  ├─ app.ts / app.html / app.routes.ts
   │  ├─ components/
   │  │  └─ car/
   │  │     └─ car-list/
   │  │        ├─ car-list.component.ts
   │  │        ├─ car-list.component.html
   │  │        └─ car-list.component.scss
   │  ├─ models/
   │  │  ├─ car.model.ts                # interface
   │  │  └─ page.model.ts                # Page-interface for backend-paginering
   │  ├─ services/
   │  │  └─ car.service.ts              # HTTP-klient
   └─ environments/
      └─ environment.ts                  # apiBase


Standard Angular-struktur

3 mapper – components, models og services for «separation of concerns».
Når appen vokser – f.eks. car, motorcycle, truck – er det bedre å opprette en features-mappe og legge tilhørende filer i respektive undermapper.
components – kun UI
services – datatilgang
models – kun typer
Jeg bruker Angular Material (skjemaer, paginator, sortering «out of the box») og Reactive Forms.

3) Hvilke verktøy brukes til testing
Backend-testing (BE)

JUnit 5 (Jupiter) — test-rammeverk
Spring Boot Test — test-slices (@DataJpaTest, @WebMvcTest), MockMvc
Mockito — mocking av service/repository

Kjør tester – backend

cd backend
./mvnw test

Frontend-testing (FE)

Jasmine — test-rammeverk
Karma — test-runner (Angular CLI)
Angular testing utilities — TestBed, HttpClientTestingModule, NoopAnimationsModule, fakeAsync/tick

Kjør tester – frontend

cd frontend
ng test



