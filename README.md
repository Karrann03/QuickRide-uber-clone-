# 🚖 QuickRide – Uber Clone (Full Stack Ride Booking Platform)

QuickRide is a **full-stack ride-hailing platform inspired by Uber**, built using **Spring Boot and React.js**.
The system allows users to request rides, drivers to accept them in real time, and tracks ride progress with live updates.

This project demonstrates **backend system design, real-time communication, geolocation-based driver matching, and full-stack integration**.

---

# 🚀 Key Features

### 👤 User Features

* User Registration and Login
* Google OAuth Authentication
* Request a ride with pickup and destination
* Fare estimation before booking
* Real-time ride status updates
* Track driver location on map
* OTP verification to start ride

### 🚗 Driver Features

* Driver registration and availability toggle
* Drivers visible within **5 km radius**
* Accept ride requests
* Receive real-time ride notifications
* Navigate to pickup location

### ⚡ System Features

* Real-time ride updates using **WebSockets**
* **Race condition safe driver assignment**
* Distance calculation using **Haversine Formula**
* Surge price based fare estimation
* Secure authentication using **JWT**
* Scalable layered backend architecture

---

# 🧠 Engineering Concepts Implemented

This project focuses on solving **real backend problems**.

### Real-Time Communication

Implemented **WebSockets** so ride updates are instantly sent between driver and user.

### Race Condition Handling

Ensured **only one driver can accept a ride** using conditional database update:

```sql
UPDATE ride
SET driver_id = ?
WHERE ride_id = ?
AND status = 'REQUESTED'
```

This prevents multiple drivers from accepting the same ride.

### Geolocation Driver Matching

Drivers are filtered within a **5 km radius** of the user using **Haversine Distance Formula**.

### Fare Estimation

Fare is calculated based on:

* distance
* vehicle type
* surge pricing
* base fare

### Secure Authentication

Implemented:

* JWT authentication
* OAuth login using Google

---

# 🏗 System Architecture

```
                 +----------------------+
                 |      React Frontend  |
                 |  (User & Driver UI)  |
                 +----------+-----------+
                            |
                            |
                       REST APIs
                            |
                            ▼
                 +----------------------+
                 |   Spring Boot Backend |
                 |-----------------------|
                 | Controllers           |
                 | Services              |
                 | Repositories          |
                 | WebSocket Handlers    |
                 +----------+------------+
                            |
                            ▼
                      MySQL Database
```

---

# 🛠 Tech Stack

## Backend

* Java
* Spring Boot
* Spring Security
* JWT Authentication
* WebSockets
* OAuth2 (Google Login)
* Spring Data JPA
* MySQL

## Frontend

* React.js
* Axios
* Google Maps API
* CSS

## Tools

* Maven
* Git
* GitHub
* Eclipse
* Postman

---

# 📂 Project Structure

```
QuickRide
│
├── backend (Spring Boot)
│   ├── controller
│   ├── service
│   ├── repository
│   ├── entity
│   ├── dto
│   └── config
│
└── frontend (React)
    ├── components
    ├── pages
    ├── services
    └── styles
```

---

# ⚙️ Running the Project

## 1️⃣ Clone Repository

```
git clone https://github.com/Karrann03/QuickRide-uber-clone-.git
```

---

## 2️⃣ Run Backend

```
cd backend
mvn spring-boot:run
```

Backend runs on:

```
http://localhost:7973
```

---

## 3️⃣ Run Frontend

```
cd frontend
npm install
npm start
```

Frontend runs on:

```
http://localhost:5173
```

---

# 🗺 Future Improvements

Planned enhancements:

* Live driver movement on map
* Payment gateway integration
* Ride history analytics
* Driver rating system
* Microservices architecture
* Kubernetes deployment

---

# 👨‍💻 Author

**Karan Verma**

Java Full Stack Developer

* LinkedIn: https://linkedin.com/in/karan-verma-0040a127b
* GitHub: https://github.com/Karrann03
* Email: [verma8638@gmail.com](mailto:verma8638@gmail.com)

---

# ⭐ If you like this project

Give it a **star ⭐ on GitHub**.
