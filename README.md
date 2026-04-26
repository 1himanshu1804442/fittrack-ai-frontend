🚀 FitTrack AI - Full-Stack Fitness Coach
FitTrack AI is a personalized fitness application that leverages AI to generate workout recommendations based on real-time user stats. Built with a robust Spring Boot backend and a reactive Vite + React frontend.

🛠 Tech Stack
Frontend: React.js, Tailwind CSS, Vite.

Backend: Java 17, Spring Boot, Spring Data JPA.

Database: PostgreSQL.

AI Integration: Google Gemini AI (via Google AI Studio).

✨ Key Features
AI Recommendations: Dynamically generates fitness plans based on user weight and goals.

Profile Management: RESTful API to update body weight and fitness objectives (Strength, Weight Loss, Maintenance).

Three-Tier Architecture: Implements Controller-Service-Repository pattern for scalable code.

Type-Safe Enums: Uses Java Enums and BigDecimals to ensure data integrity for health metrics.

🏗 Architecture Overview
The project follows a modern decoupled architecture:

Frontend (React): Captures user data and triggers AI generation via asynchronous fetch calls.

Service Layer (Spring Boot): Handles the business logic, including DTO-to-Entity mapping and AI prompt engineering.

Data Layer (PostgreSQL): Persists user progress and history.

🚦 Getting Started
Backend Setup
Navigate to the demo folder.

Update application.properties with your PostgreSQL credentials and Gemini API Key.

Run the application using Maven:

Bash
mvn spring-boot:run
Frontend Setup
Navigate to the fittrack-frontend folder.

Install dependencies:

Bash
npm install
Start the development server:

Bash
npm run dev
📈 Future Roadmap
[ ] Implement JWT Authentication for multiple users.

[ ] Add progress tracking charts using Chart.js.

[ ] Integrate a workout history log.

👨‍💻 Author
Himanshu Yadav

LeetCode: hy180444 (Knight ⚔️)

GitHub: dusty1804