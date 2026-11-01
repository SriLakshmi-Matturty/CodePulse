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
