# 🚀 Ajwa AI Commerce — AI-Powered Cloud-Native E-Commerce Platform

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.12%20%7C%203.14-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Orchestrated-326CE5.svg)](https://kubernetes.io/)
[![CI/CD](https://img.shields.io/badge/GitHub%20Actions-Automated-2088FF.svg)](https://github.com/features/actions)

> **Ajwa AI Commerce** is a future-ready, enterprise-grade, data-driven e-commerce platform for gourmet dry fruits and luxury confections. Evolved from standard e-commerce into a **Full-Stack AI + Data Science + Cloud-Native** ecosystem featuring real-time recommendation engines, predictive demand forecasting, zero-hallucination shopping concierges, Netflix-style auto-suggestions, instant Direct UPI/Google Pay checkout with live countdown timers, and multi-service Kubernetes orchestration.

---

## 🏛️ Platform Architecture

```
                               ┌─────────────────────────────────────────┐
                               │           AJWA AI COMMERCE              │
                               └────────────────────┬────────────────────┘
                                                    │
                      ┌─────────────────────────────┼─────────────────────────────┐
                      │                             │                             │
             Customer Storefront             Admin Analytics                AI Concierge
             (React 18 / Redux)            (Demand Forecasting)        (Catalog Grounded NLP)
                      │                             │                             │
                      └─────────────────────────────┼─────────────────────────────┘
                                                    │
                                      API Gateway (Node.js/Express)
                                 [Port 8000: Auth, Orders, Products]
                                                    │
                      ┌─────────────────────────────┼─────────────────────────────┐
                      │                             │                             │
             Database Layer                  Payment Engine               AI & ML Microservice
          (PostgreSQL / SQLite)       (Direct UPI + Razorpay Test)       (Python FastAPI : 5001)
                      │                             │                             │
                      │               - Dynamic UPI QR & GPay Intent     - Scikit-Learn Recommender
                      │               - 5-Min Expiry Countdown Timer     - Pandas/NumPy Forecasting
                      │               - Auto-Auth Verification Poller    - Inventory Alert Engine
                      │                                                  - Strict Budget/Goal NLP
                      └─────────────────────────────┬─────────────────────────────┘
                                                    │
                                      Redis High-Speed Caching
                                                    │
                                     Docker & Kubernetes (K8s)
                         [Compose: Frontend + Backend + AI-Service + DB]
                         [K8s: Ingress, Deployments, ClusterIPs, HPA]
                                                    │
                                           AWS / Azure Cloud
```

---

## 🧠 Core AI & Data Science Capabilities

### 1. Hybrid Product Recommendation Engine ⭐
- **Content-Based Filtering**: Utilizes `scikit-learn`'s `TfidfVectorizer` and `cosine_similarity` to analyze product profiles, dietary tags (antioxidant, high-protein, keto, fiber), and flavor categories.
- **Collaborative Co-Purchase Rules**: Discovers association rules from transaction history (e.g., Customers purchasing *Almonds + Dates* receive high-affinity pairings for *Cashews + Iranian Pistachios*).
- **Storefront Personalization**: Dynamic *“Recommended For You”* shelf driven by real-time cart contents and browsing preferences.

### 2. Time-Series Demand Forecasting & Inventory Velocity 📊
- Built with **Pandas**, **NumPy**, and **scikit-learn** (`Ridge` regression with cyclical day-of-week feature engineering).
- Computes **Daily Sales Velocity** ($\text{units/day}$) and projects **7-Day** and **30-Day** future stock requirements.
- Predicts exact **Stockout Horizons** ($\text{Current Stock} / \text{Daily Velocity}$) and dynamically recommends **Safety Stock** and **Reorder Points (ROP)**.

### 3. Intelligent Predictive Inventory Alerts ⚠️
- Real-time stock depletion alert system for store administrators:
  - 🚨 **CRITICAL**: Inventory expected to fall below safety threshold within $< 5$ days.
  - ⚠️ **WARNING**: Stock approaching reorder point within $5 - 10$ days.
  - ✅ **OPTIMAL**: Healthy inventory run-rate.

### 4. Zero-Hallucination AI Shopping Concierge 🤖
- Domain-specific shopping assistant integrated directly into the storefront.
- **Natural Language Intent & Budget Parsing**: Extracts queries such as:
  > *"I need dry fruits for muscle building under ₹1,000"*
  > *"Best dates for natural sustained energy and iron"*
- Applies strict catalog constraint filters—**never hallucinates non-existent products or arbitrary pricing**. Returns nutritional sommelier guidance with one-click *“Add to Cart”* product cards.

---

## ⚡ Next-Gen Shopping Experience

### 1. Netflix-Style Auto-Suggestion & Shelf Discovery
- **Predictive Search Dropdown (Netflix-Style)**:
  - Real-time instant search matches with product thumbnails, category badges, calories/health goals, and live prices.
  - **🔥 Trending Superfoods** one-touch chips (*Saudi Royal Ajwa*, *California Almonds*, *Iranian Pistachios*, *Belgian Truffles*).
  - **🎯 Shop by Health Goal** filters (*Muscle & Gym*, *Brain & Focus*, *Diabetes Friendly*, *Heart Vitality*, *Luxury Hampers*).
- **Horizontal Shelf Rails**:
  - Horizontal scrolling shelves (*“Recommended For You”*, *“Trending Now”*, *“High Protein Gym Fuel”*, *“Royal Saudi Dates”*) featuring card hover zoom and instant checkout additions.

### 2. Direct UPI / Google Pay Instant Checkout (Razorpay Pending Workaround)
- **Problem Solved**: Transparent payment flow during Razorpay merchant gateway production review.
- **Dynamic UPI QR & Deep Links**: Generates dynamic NPCI-compliant UPI URLs (`upi://pay?pa=ajwadryfruits@okaxis&...`) with one-click **Google Pay**, **PhonePe**, and **Paytm** mobile launchers.
- **Live 5:00-Minute Countdown Timer**: Visual countdown timer with progress ring and session expiry protection.
- **Automatic Authentication Engine**: Real-time polling (`/api/v1/payment/upi/status/:orderId`) automatically authenticates and marks orders as `PAID (Direct UPI / Google Pay)` upon settlement.
- **Multi-Gateway Ready**: Sandbox testing for **Razorpay**, **Stripe International Cards**, and **Cash on Delivery (COD)**.

---

## 🐳 Cloud-Native Infrastructure & DevOps

### Microservice Containerization (Docker)
```
ajwa-dry-fruits/
├── frontend/               # React 18 SPA (Nginx multi-stage build)
│   └── Dockerfile
├── backend/                # Node.js Express API Gateway
│   └── Dockerfile
├── ai-service/             # Python FastAPI + scikit-learn microservice
│   └── Dockerfile
├── docker-compose.yml      # Multi-service local & cloud orchestration
└── k8s/                    # Production Kubernetes manifests
    ├── 01-namespace.yaml
    ├── 02-configmap.yaml
    ├── 03-secrets.yaml
    ├── 04-ai-service.yaml  # 2 Replicas, Health checks, CPU/Mem Limits
    ├── 05-backend.yaml     # 3 Replicas, ClusterIP, Probes
    ├── 06-frontend.yaml    # 2 Replicas, Nginx SPA
    ├── 07-postgres.yaml    # StatefulSet + PersistentVolumeClaim
    ├── 08-redis.yaml       # In-memory Caching
    ├── 09-ingress.yaml     # Ingress Controller routing
    └── 10-hpa.yaml         # Horizontal Pod Autoscalers (2 to 10 pods)
```

### Local Multi-Container Run
```bash
# Spin up Frontend, Gateway, AI Microservice, Postgres & Redis with a single command:
docker compose up --build
```
Access the services:
- **Customer Storefront**: `http://localhost:3000`
- **Backend API Gateway**: `http://localhost:8000`
- **AI Microservice Docs**: `http://localhost:5001/docs`

---

## 🚀 Quick Start (Development Mode)

### 1. Start Python AI Microservice
```bash
cd ai-service
pip install -r requirements.txt
python main.py
# Runs on http://127.0.0.1:5001
```

### 2. Start Backend API Gateway
```bash
# From root directory
npm install
npm run dev
# Gateway runs on http://127.0.0.1:8000 (auto-connects SQLite/MySQL fallback)
```

### 3. Start Frontend UI
```bash
cd frontend
npm install --legacy-peer-deps
npm start
# Client launches on http://localhost:3000
```

---

## 🧪 Automated Testing & Verification

```bash
# Verify Python AI models (Recommender, Forecaster, Assistant)
cd ai-service
python test_service.py

# Verify Frontend Production Compilation
cd frontend
npm run build
```

---

## 📜 License
This project is licensed under the [MIT License](LICENSE).
