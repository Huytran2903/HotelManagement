# FUMiniHotelSystem - Assignment 03 (SBA302)
## Securing REST Services with Spring Boot 3, Spring Security, JWT & ReactJS

### Student Information
- **Student Name:** HuyTran
- **Class Code:** SE1910
- **Database Name:** `A3HuyTran_SE1910`

---

## 1. Project Overview
FUMiniHotelSystem is an enterprise full-stack hotel management and reservation web application developed with Spring Boot 3 (RESTful API, Spring Security, JWT, JPA Hibernate, MS SQL Server) and ReactJS (Axios, React Router v6, CSS).

---

## 2. Technology Stack

### Backend
- **Framework:** Spring Boot 3.3.5
- **Language:** Java 21 (LTS)
- **Security:** Spring Security & JWT (io.jsonwebtoken / JJWT 0.12.6)
- **Data Access:** Spring Data JPA / Hibernate ORM
- **Database:** Microsoft SQL Server 2022
- **Validation:** Jakarta Bean Validation
- **Architecture:** Strict 3-Layer Architecture (`Controller` -> `Service` -> `Repository`)

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite 6
- **Routing:** React Router DOM v6
- **HTTP Client:** Centralized Axios instance with JWT interceptors
- **Styling:** Custom CSS (Zero icon libraries, zero emojis, university SE project layout)

---

## 3. Database Design & Entities

The database persists in SQL Server under database `A3HuyTran_SE1910` with 5 main tables:

1. **Customer** (`CustomerID`, `CustomerFullName`, `Telephone`, `EmailAddress`, `CustomerBirthday`, `CustomerStatus`, `Password`)
2. **RoomType** (`RoomTypeID`, `RoomTypeName`, `TypeDescription`, `TypeNote`)
3. **RoomInformation** (`RoomID`, `RoomNumber`, `RoomDetailDescription`, `RoomMaxCapacity`, `RoomPricePerDay`, `RoomStatus`, `RoomTypeID`)
4. **BookingReservation** (`BookingReservationID`, `BookingDate`, `TotalPrice`, `CustomerID`, `BookingStatus`)
5. **BookingDetail** (Composite PK: `BookingReservationID`, `RoomID`, `StartDate`, `EndDate`, `ActualPrice`)

### Relationships:
- `Room` *--- 1 `RoomType`
- `Customer` 1 ---* `BookingReservation`
- `BookingReservation` 1 ---* `BookingDetail` *--- 1 `Room`

---

## 4. API Endpoints Specification

### Authentication & Public (`/api/auth`, `/api/public`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Authenticates Staff or Customer, returns JWT & user details |
| POST | `/api/auth/register` | Public | Registers a new Customer account with BCrypt encrypted password |
| GET | `/api/public/rooms` | Public | Retrieves active rooms for public browsing |
| GET | `/api/public/rooms/{id}` | Public | Retrieves room details |
| GET | `/api/public/room-types` | Public | Retrieves all room types |

### Customer Profile & Booking (`/api/profile`, `/api/bookings`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/profile` | Authenticated | Views current user's profile |
| PUT | `/api/profile` | Authenticated | Updates customer profile (name, phone, birthday, password) |
| GET | `/api/bookings/my-history` | CUSTOMER | Retrieves customer's personal booking history |
| GET | `/api/bookings/{id}` | Authenticated | Retrieves booking details (enforcing customer isolation) |
| POST | `/api/bookings` | Authenticated | Places a new booking reservation (multi-room, date overlap validation) |

### Staff Management APIs (`/api/customers`, `/api/rooms`, `/api/bookings`, `/api/dashboard`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/dashboard/stats` | STAFF | Aggregated metrics (total customers, rooms, bookings, revenue) |
| GET | `/api/customers` | STAFF | Lists & searches customers (keyword: name, email, phone) |
| GET | `/api/customers/{id}` | STAFF | Customer details |
| POST | `/api/customers` | STAFF | Creates new customer |
| PUT | `/api/customers/{id}` | STAFF | Updates customer |
| DELETE | `/api/customers/{id}` | STAFF | Deletes or deactivates customer (if has booking history) |
| GET | `/api/rooms` | Public / STAFF | Searches & filters rooms (keyword, roomTypeId, status) |
| POST | `/api/rooms` | STAFF | Creates new room |
| PUT | `/api/rooms/{id}` | STAFF | Updates room |
| DELETE | `/api/rooms/{id}` | STAFF | Deletes room if never booked, else deactivates status to 0 |
| GET | `/api/bookings` | STAFF | Lists & searches all bookings |
| PUT | `/api/bookings/{id}/status` | STAFF | Updates booking status (Confirmed / Cancelled) |
| DELETE | `/api/bookings/{id}` | STAFF | Deletes booking reservation |

---

## 5. Configuration & Credentials

### Staff Account (Configured in `application.properties`)
- **Email:** `admin@fuhotel.com`
- **Password:** `Staff@123`
- **Role:** `STAFF`

### Initial Sample Customers (Seeded on first run)
1. **Email:** `customer1@fuhotel.com` / **Password:** `Customer@123`
2. **Email:** `customer2@fuhotel.com` / **Password:** `Customer@123`

---

## 6. How to Run

### Backend (`A3HuyTran_SE1910_BE`)
```powershell
cd d:\SBA302\assignment3\A3HuyTran_SE1910_BE
mvn spring-boot:run
```
Runs at: `http://localhost:8080`

### Frontend (`A3HuyTran_SE1910_FE`)
```powershell
cd d:\SBA302\assignment3\A3HuyTran_SE1910_FE
npm run dev
```
Runs at: `http://localhost:5173`

