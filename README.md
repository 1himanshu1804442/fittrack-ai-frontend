# 🚀 FitTrack AI - Full-Stack Fitness Coach
FitTrack AI is a personalized fitness application that leverages AI to generate workout recommendations based on real-time user stats. Built with a robust Spring Boot backend and a reactive Vite + React frontend.

## 🛠 Tech Stack
* **Frontend:** React.js, Tailwind CSS, Vite, Recharts.
* **Backend:** Java 17, Spring Boot, Spring Data JPA, JWT Authentication.
* **Database:** PostgreSQL.
* **AI Integration:** Google Gemini AI (via Google AI Studio).

## ✨ Key Features
* **AI Recommendations:** Dynamically generates fitness plans based on user weight and goals.
* **Profile Management:** RESTful API to update body weight and fitness objectives (Strength, Weight Loss, Maintenance).
* **Comprehensive Analytics:** Visualizes Volume Progression and 1-Rep Max (1RM) using Recharts.
* **Workout History:** Log, edit, delete, and paginate through past lifts.
* **Secure Authentication:** Full JWT-based login and registration flow.

## 🏗 Architecture Overview
The project follows a modern decoupled architecture:
* **Frontend (React):** Captures user data and triggers AI generation via asynchronous fetch calls.
* **Service Layer (Spring Boot):** Handles the business logic, including DTO-to-Entity mapping, 1RM calculation, and AI prompt engineering.
* **Data Layer (PostgreSQL):** Persists user progress and history.

## 🚦 Getting Started

### Backend Setup
1. Navigate to the `demo` folder.
2. Update `application.properties` with your PostgreSQL credentials and Gemini API Key.
3. Run the application using Maven:
   ```bash
   mvn spring-boot:run
   ```

### Frontend Setup
1. Navigate to the `fittrack-frontend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Environment configuration
The frontend reads an optional Vite environment variable `VITE_API_BASE` to point the app at a backend other than the default `http://localhost:8080`.
Create a `.env` in the project root if you need to override the backend base URL:
```
VITE_API_BASE=http://localhost:8080
```

## 📈 Completed Roadmap
- [x] Implement JWT Authentication for multiple users.
- [x] Add progress tracking charts (Volume & 1RM) using Recharts.
- [x] Integrate a paginated workout history log with Edit/Delete capabilities.

## 🐳 Docker Deployment
To run the full stack using Docker:
1. Ensure Docker is installed and running.
2. Navigate to the parent folder `fittrack-fullstack`.
3. Set your API Key in your terminal: `export GEMINI_API_KEY="your-key-here"` (Linux/Mac) or `$env:GEMINI_API_KEY="your-key-here"` (Windows PowerShell).
4. Run `docker-compose up --build`.
5. Access the app at `http://localhost`.

## 👨‍💻 Author
Himanshu Yadav  
LeetCode: hy180444 (Knight ⚔️)  
GitHub: dusty1804