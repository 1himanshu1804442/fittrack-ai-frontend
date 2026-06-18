# FitTrack AI — Frontend 🎨⚡

> **A modern, dark-themed React dashboard for the FitTrack AI fitness platform. Built with Vite, TailwindCSS, and Recharts.**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

---

## ✨ Features

### 📊 Dashboard
- Real-time metrics: Workout Streak, Weekly Volume, Recovery Score, Body Weight
- Quick-Log buttons for one-tap exercise logging (auto-fills last weight)
- AI Coach widget with Gemini-powered plan generation
- Recent lifts with inline edit/delete

### 🧠 AI Workout Generator
- Select muscle group, equipment, time, experience level, and training focus
- Generates personalized workout plans via Google Gemini AI
- Plans persist across tab switches (fetched from database)
- Beautiful Markdown rendering with syntax-highlighted sections

### 🍎 Nutrition Tracker
- Search 300,000+ foods via USDA FoodData Central API
- Auto-fills calories, protein, carbs, and fat
- Customizable daily macro goals (saved to user profile)
- Daily / Weekly / Monthly tracking views with progress bars

### 📈 Analytics
- Volume Load over time (line chart)
- Exercise distribution by muscle group (pie chart)
- PR tracking and training consistency metrics
- Powered by Recharts

### 📅 Activity Hub (History)
- Dual-tab interface: Lifting Logs + AI Plans Archive
- Lifting logs grouped by date in a timeline view
- Hover-to-reveal edit/delete actions
- Expandable AI plan cards with full Markdown rendering

### 🔐 Authentication
- JWT-based login/register flow
- Token persisted in localStorage
- Automatic session expiry handling

---

## 📁 Component Structure

```
src/
├── App.jsx              # Root — routing, auth state, view switching
├── main.jsx             # Vite entry point
├── Login.jsx            # Login form with JWT handling
├── Register.jsx         # Registration with validation
├── Sidebar.jsx          # Navigation sidebar (dynamic user profile)
├── Dashboard.jsx        # Main dashboard — stats, quick log, AI coach
├── MetricsRow.jsx       # Reusable metrics cards component
├── AIWorkout.jsx        # Custom AI workout generator
├── Nutrition.jsx        # Food logging + macro tracking
├── Analytics.jsx        # Charts and training analytics
├── History.jsx          # Activity Hub — lift timeline + AI archive
├── App.css              # Global styles
└── index.css            # Tailwind directives
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- Backend server running at `http://localhost:8080`

### 1. Clone the repository
```bash
git clone https://github.com/1himanshu1804442/fittrack-ai-frontend.git
cd fittrack-ai-frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure API base (optional)
Create a `.env` file in the root:
```env
VITE_API_BASE=http://localhost:8080
```
If omitted, defaults to `http://localhost:8080`.

### 4. Start development server
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

---

## 🧪 Tech Stack

| Layer | Technology |
|---|---|
| **UI Framework** | React 18 |
| **Build Tool** | Vite 5 |
| **Styling** | TailwindCSS 3 |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Markdown** | react-markdown |
| **Notifications** | react-hot-toast |

---

## 🔗 Related

- **Backend Repository**: [fittrack-ai-backend](https://github.com/1himanshu1804442/fittrack-ai-backend)

---

## 👤 Author

**Himanshu Yadav**  
- GitHub: [@1himanshu1804442](https://github.com/1himanshu1804442)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).