 🚖 QuickRide - Uber Clone

QuickRide is a full-stack ride-hailing platform inspired by Uber.  
It allows users to request rides, drivers to accept them, and tracks rides in real time.

---

## 🚀 Tech Stack

### Backend
- Java
- Spring Boot
- Spring Security
- JWT Authentication
- WebSocket (Real-time communication)
- MySQL
- Haversine Distance Formula (Driver matching)

### Frontend
- React.js
- Google Maps API
- Axios

---

## ⚙️ Features

- User ride request
- Driver availability system
- Real-time driver location tracking
- Race condition safe driver assignment
- Fare estimation using Haversine distance
- OAuth login (Google)
- WebSocket ride updates

---

## 🏗 Architecture

Backend follows layered architecture:

Controller → Service → Repository → Database


## Screenshots

### User Dashboard
![HomePage](<img width="1927" height="1032" alt="Screenshot (12)" src="https://github.com/user-attachments/assets/cd213c15-1175-4c82-ba6b-9c2ef5db2c49" />#)

### Ride Tracking
![Ride Tracking](screenshots/map.png)
