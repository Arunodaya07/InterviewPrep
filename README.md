# InterviewPrep Tracker

An AI-powered interview preparation platform designed to help students organize their preparation, practice technical and aptitude questions, analyze resumes, schedule interviews, and track their overall readiness.

## 🚀 Features

* 📊 **Personalized Dashboard** — View preparation progress and important interview activities in one place.
* 📚 **Study Notes** — Create and manage notes for interview preparation.
* 💻 **Technical Quiz** — Practice technical questions and evaluate performance.
* 🧠 **Aptitude Practice** — Practice aptitude questions to improve problem-solving skills.
* 📄 **AI Resume Analyzer** — Analyze resumes and receive AI-based feedback and improvement suggestions.
* 📅 **Interview Scheduler** — Schedule interviews and manage upcoming interview activities.
* 🤖 **AI Chatbot** — Get technical, interview, and preparation-related guidance.
* 📈 **Progress Tracker** — Track quiz performance, completed activities, and preparation progress.
* 🔖 **Bookmarks** — Save important questions and resources for later revision.
* 🎯 **Interview Readiness Score** — Generate a readiness score based on preparation and performance.
* 💡 **Personalized Recommendations** — Receive recommendations based on the user's preparation data and performance.

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* HTML
* CSS
* Vite
* Tailwind CSS

### Backend

* Node.js
* Express.js

### Database & Authentication

* MongoDB
* Firebase Authentication

### AI

* Generative AI APIs
* Natural Language Processing (NLP)
* AI-based recommendation and resume analysis

## 🏗️ System Architecture

```text
                    User
                     │
                     ▼
              React Frontend
                     │
       ┌─────────────┼─────────────┐
       ▼             ▼             ▼
   Dashboard       Quizzes      Resume Analyzer
       │             │             │
       └─────────────┼─────────────┘
                     ▼
              Node.js + Express
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
      MongoDB    Firebase     AI Services
                     │          │
                     └────┬─────┘
                          ▼
              Personalized Analysis
                          │
                          ▼
             Readiness Score &
              Recommendations
```

## 🔑 Main Algorithms & Techniques

### 1. NLP-based Resume Analysis

Extracts and analyzes relevant skills, keywords, and information from resumes.

### 2. Recommendation System

Uses preparation and performance information to provide personalized recommendations.

### 3. Weighted Scoring

Combines different performance factors to calculate an overall interview readiness score.

### 4. Keyword Search

Helps users find relevant questions, notes, and bookmarked resources.

### 5. Sorting & Filtering

Organizes questions, notes, and preparation data based on relevant criteria.

## 📂 Project Structure

```text
InterviewPrep-Tracker/
│
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── ...
│
├── server.ts
├── package.json
├── vite.config.ts
├── README.md
└── ...
```

> The exact folder structure may vary depending on the current project implementation.

## ⚙️ Installation & Setup

### Prerequisites

Make sure you have installed:

* Node.js
* npm
* Git

### Clone the Repository

```bash
git clone <your-repository-url>
cd InterviewPrep-Tracker
```

### Install Dependencies

```bash
npm install
```

### Run the Development Server

```bash
npm run dev
```

Then open the local URL displayed in the terminal, typically:

```text
http://localhost:3000
```

## 🔐 Environment Variables

If the project uses API keys or other secrets, create a `.env` file and add the required environment variables.

**Do not upload API keys, passwords, Firebase private credentials, or other secrets to GitHub.**

## 👥 Team Collaboration

This project can be developed collaboratively using GitHub. Team members can work on separate features using branches and submit pull requests for review.

## 🎯 Project Goal

The goal of InterviewPrep Tracker is to provide a centralized and personalized platform that helps students prepare for technical interviews through structured learning, practice, AI-powered feedback, scheduling, and progress tracking.

## 📌 Project Status

**Status:** Active Development

## 📄 License

This project is intended for academic and educational purposes.
