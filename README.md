# CodePulse - Unified Coding Analytics Dashboard

## About CodePulse

CodePulse is a full-stack, real-time analytics web dashboard that unifies competitive programming metrics, submission activity, contest schedules, and git commit logs across **7 Major Platforms**:
- **LeetCode**
- **Codeforces**
- **GitHub**
- **CodeChef**
- **AtCoder**
- **HackerRank**
- **GeeksforGeeks**

---

## Key Features

- **Multi-Platform Leaderboard (`Leaderboard`)**:
  - Live competitive rankings comparing Total Solved, Codeforces Rating, CodeChef Rating, AtCoder Rating, and Active Streaks.
  - **Add Friend via Profile Links**: Paste profile URLs to automatically extract handles and fetch authentic live ratings via official APIs.
  - **Leaderboard Filters**: Toggle between **All Coders**, **Friends Only**, and **Global Legends**.

- **One-Click Contest Calendar Sync (`Contests`)**:
  - Live upcoming contest schedules across all 7 platforms.
  - One-click **`Google Cal`** event sync links.
  - Downloadable **`.ICS File`** for Outlook, Apple Calendar, and mobile calendars.

- **Problem Bookmarking & Revision Notes Manager (`Bookmarks`)**:
  - Save difficult problems into custom playlists (*"Must-Do DP"*, *"Interview Prep"*).
  - Add personal hints, edge case notes, and space/time complexity reminders.

- **Topic Skill Growth & Weakness Analyzer**:
  - Visual topic mastery progress breakdown (*Dynamic Programming*, *Graph Algorithms*, *Trees & BST*, *Math & Logic*) to identify weak areas.

- **Stalk / Profile Compare Mode (`Stalk Mode`)**:
  - Compare coding profiles side-by-side across all 7 platforms.

- **Unified Activity Heatmap & Sprint Timer**:
  - 53-week contribution activity grid combining submissions and git commit logs.
  - Built-in 15-minute practice sprint countdown timer in the header bar.

---

## Tech Stack & Architecture

- **Backend**: Node.js, Express REST API (`server/`)
- **Frontend**: ES6 Modules, Vite Server, Vanilla CSS with Glassmorphism Design System, Lucide Icons, Chart.js (`client/`)
- **Storage**: LocalStorage persistence for user handles, bookmarks, and friend profiles.

---

## How to Run CodePulse

### Prerequisites
Make sure you have **Node.js** (v16 or higher) and **npm** installed on your system.

---

### Step-by-Step Execution Guide

#### Step 1: Install Dependencies
Open your terminal in the project root directory and run:
```bash
npm install
```

#### Step 2: Run Both Backend & Frontend Simultaneously
To launch both the backend API server and frontend client together in one terminal command:
```bash
npm run dev
```

---

### Alternative: Run Backend and Frontend Separately

If you prefer running the backend and frontend in separate terminals:

1. **Start the Backend API Server**:
   ```bash
   npm run dev:server
   ```
   *The backend will run on `http://localhost:5000`*

2. **Start the Frontend Client Server**:
   ```bash
   npm run dev:client
   ```
   *The client will open automatically on `http://localhost:3000`*

---

### Accessing the Application
Once started, open your web browser and navigate to:
```
http://localhost:3000
```

---

## Deploy to Render

The repository includes a Render Blueprint (`render.yaml`) that deploys the Node.js API and static frontend as one web service. In Render, choose **New + → Blueprint**, connect this repository, and apply the Blueprint. Render uses `/api/health` as its health check and deploys new commits from `main` automatically.

The deployed service serves the frontend and API from the same origin. Do not add a separate `CORS_ORIGIN` unless you intentionally host the frontend on another domain. Keep local secrets in `.env`; it is excluded from Git.
