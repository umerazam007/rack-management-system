# Rack Management System

A storage inventory system built with Python OOP and Flask. Manage shelves, track items, search inventory, and monitor capacity — all through a modern web dashboard or the command-line interface.

![Python](https://img.shields.io/badge/Python-3.x-blue?logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-REST%20API-lightgrey?logo=flask)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Features

- **Shelf grid dashboard** — visual cards for each shelf with real-time progress bars and status badges (OK / Almost Full / Full)
- **Add & remove items** — assign to a specific shelf or let the system auto-assign to the first available slot
- **Search** — slide-out panel with instant search across item names and categories
- **Capacity report** — per-shelf and overall usage breakdown with animated progress bars
- **CLI mode** — a full menu-driven terminal interface (no browser required)
- **Animations** — GSAP-powered transitions, modal shake on errors, staggered card entrances, floating background orbs

## Tech Stack

| Layer | Tech |
|-------|------|
| Backend | Python 3, Flask, REST API |
| Frontend | HTML, CSS (glassmorphism + CSS variables), vanilla JS |
| Animation | GSAP 3 |
| Architecture | OOP — `Item`, `Shelf`, and `Rack` classes with encapsulation |

## Getting Started

### Prerequisites

- Python 3.8+
- pip

### Installation

```bash
git clone https://github.com/umerazam007/rack-management-system.git
cd rack-management-system
pip install -r requirements.txt
```

### Run the web app

```bash
python app.py
```

Open **http://localhost:5000** in your browser. You'll be greeted with a setup screen to configure your rack.

### Run the CLI version

```bash
python RackSystem.py
```

This launches a terminal menu where you can view the rack, add/remove items, search, and generate capacity reports — no browser needed.

## Project Structure

```
rack-management-system/
├── RackSystem.py        # Core classes: Item, Shelf, Rack (+ CLI interface)
├── app.py               # Flask server with REST API endpoints
├── requirements.txt     # Python dependencies
├── templates/
│   └── index.html       # Web dashboard (single-page app)
└── static/
    ├── style.css        # Dark-theme glassmorphism UI
    └── script.js        # Frontend logic + GSAP animations
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/setup` | Create a new rack (name, shelves, capacity) |
| `GET` | `/api/rack` | Get current rack state |
| `POST` | `/api/item/add` | Add an item to a shelf |
| `POST` | `/api/item/remove` | Remove an item by name |
| `GET` | `/api/search?q=` | Search items by name or category |

## Design Decisions

- **OOP with encapsulation** — all attributes are private (name-mangled) with getter methods, enforcing controlled access. This was a deliberate choice to practice proper object-oriented design rather than using plain dictionaries.
- **Dual interface** — the same `RackSystem.py` backend powers both the CLI and the web app. The Flask layer is a thin adapter that serializes objects to JSON — zero business logic duplication.
- **No database** — data lives in memory. This keeps the project focused on OOP and data structures rather than persistence plumbing. A natural next step would be adding SQLite or file-based storage.
- **Vanilla frontend** — no React, no build step. One HTML file, one CSS file, one JS file. The glassmorphism UI and GSAP animations show that you don't need a framework to build something that looks and feels polished.
