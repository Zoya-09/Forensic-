# Forensic 
# Forensico

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.0-blue.svg?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg?logo=vite)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4.svg?logo=tailwindcss)](https://tailwindcss.com)

**Forensico** is a secure, public-safety cybercrime reporting and spatial intelligence platform. Built for instant, encrypted reporting accompanied by geospatial analysis, it provides community members with tools to report cyber incidents, visualize regional threat trends on an interactive map, and trigger proximity alerts.

---

## 🚀 Key Features

* **Anonymity & Verification**: High-grade report submission with local processing and flexible user control over contact identity.
* **Geospatial Mapping**: Full integration of high-resolution interactive mapping showing local incident classifications, hot spots, and precise coordinates.
* **Structured Declarations**: Dynamic category selectors, description validators, and priority tags to ensure actionable reporting fields.
* **Proactive Security Alerts**: Immediate telemetry assessment for critical cyber issues and network incident patterns.
* **Fluid UI & Responsive Design**: Immersive UI with tailored state transitions and modern dark slate aesthetic overlays.

---

## 🛠️ Technology Stack

* **Frontend**: React 19, TypeScript, Tailwind CSS, Motion (for animations)
* **Mapping**: Google Maps APIs via `@vis.gl/react-google-maps`
* **Backend**: Node.js, Express, tsx, esbuild (for production compilation)
* **Data Layer**: Firebase Firestore for low-latency spatial document storage

---

## 💻 Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* A Google Maps API key (for map visuals)
* A Firebase Project (for persistent firestore document sync)

### Installation

1. **Clone and open the workspace**:
   ```bash
   git clone https://github.com/Zoya-09/Forensico.git
   cd Forensico
