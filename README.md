# DD-video-browser

React + Express demo app for browsing a small catalog of movies.

**Frontend: React** (Vite, React Router).

**Backend: Node with Express**, serving a static **JSON dataset** parsed from TMDB API.

## Features

### 1) Category Listing Page

- [x] Display a horizontal, scrollable list of video **categories** (e.g., Action, Comedy, Drama).
- [x] Each category renders a **carousel** of video thumbnails.
- [x] Clicking a thumbnail **navigates to the Video Detail page**.

### 2) Video Detail Page

- [x] Shows **title, description, duration, and category**.
- [x] Includes a **“Play”** button (simulated, no real playback).

### 3) Search Functionality

- [x] Users can **search by title** or **filter by category**.
- [x] Results display as **thumbnails** linking to the Video Detail page.

### 4) Backend API — REST endpoints

- [x] `GET /categories` — fetch all categories
- [x] `GET /videos?category=Comedy` — fetch videos by category
- [x] `GET /videos/:id` — fetch video details

### 5) General

- [x] **Responsive** design
- [x] **Unit Tests (Jest and React Testing Library**

## Setup

### 1) Install

From the repo root:

```
npm install                   # installs server deps
npm --prefix client install   # installs client deps
```

---

### 2) Run (development)

- **Run API + Client together** (with live reload):

  ```
  npm run dev
  ```

  - Server: http://localhost:4000
  - Client: http://localhost:5173

- **Run only server**:

  ```
  npm run server:dev
  ```

- **Run only client**:
  ```
  npm run client:dev
  ```

---

### 3) Testing

- **Run tests for the React client** (Jest + React Testing Library).

  From the repo root:

  ```
  npm --prefix client test                # run tests once
  npm --prefix client test -- --coverage  # with coverage
  ```

  Or from the client folder:

  ```
  cd client
  npm test
  npm test -- --coverage
  ```

---
