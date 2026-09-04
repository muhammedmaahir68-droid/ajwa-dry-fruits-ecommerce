"""
Ajwa AI Commerce - AI Microservice Entrypoint
FastAPI server providing Product Recommendations, Demand Forecasting,
Intelligent Inventory Alerts, and AI Shopping Assistant.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import json
import os
from pathlib import Path

from recommender import ProductRecommender, DEFAULT_PRODUCTS
from forecaster import DemandForecaster
from assistant import ShoppingAssistant

app = FastAPI(
    title="Ajwa AI Commerce Intelligence Service",
    description="Microservice for AI Recommendations, Demand Forecasting & Catalog Assistant",
    version="2.0.0"
)

# Enable permissive CORS for frontend and backend gateway
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load catalog from backend if available, else use DEFAULT_PRODUCTS
def load_catalog() -> List[Dict[str, Any]]:
    backend_products_file = Path(__file__).resolve().parent.parent / "backend" / "data" / "products.json"
    if backend_products_file.exists():
        try:
            with open(backend_products_file, "r", encoding="utf-8") as f:
                raw = json.load(f)
                catalog = []
                for idx, p in enumerate(raw):
                    catalog.append({
                        "id": idx + 1,
                        "name": p.get("name"),
                        "category": p.get("category"),
                        "price": p.get("price"),
                        "ratings": p.get("ratings", 4.5),
                        "stock": p.get("stock", 30),
                        "description": p.get("description", ""),
                        "images": p.get("images", []),
                        "offerPercentage": p.get("offerPercentage", 0),
                        "salesStatus": p.get("salesStatus", "Regular"),
                        "tags": [p.get("category", "").lower(), "gourmet", "fresh"]
                    })
                return catalog
        except Exception as e:
            print(f"[WARN] Error loading backend products: {e}. Using default products.")
    return DEFAULT_PRODUCTS

catalog = load_catalog()
recommender = ProductRecommender(catalog)
forecaster = DemandForecaster(catalog)
assistant = ShoppingAssistant(catalog)

# Request Models
class RecommendRequest(BaseModel):
    product_id: Optional[int] = None
    cart_product_ids: Optional[List[int]] = Field(default_factory=list)
    viewed_categories: Optional[List[str]] = Field(default_factory=list)
    top_n: Optional[int] = 5

class ForecastRequest(BaseModel):
    product_id: int
    current_stock: Optional[int] = None

class AssistantRequest(BaseModel):
    query: str

@app.get("/")
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Ajwa AI Commerce Intelligence Service",
        "version": "2.0.0",
        "loaded_products": len(catalog),
        "engine": "FastAPI + scikit-learn + Pandas + NumPy"
    }

@app.post("/api/v1/ai/recommend")
def get_recommendations(payload: RecommendRequest):
    try:
        if payload.product_id:
            # Content-based item-to-item similarity
            items = recommender.get_content_recommendations(payload.product_id, top_n=payload.top_n)
        else:
            # Personalized / Cart-pairing recommendations
            items = recommender.get_personalized_recommendations(
                cart_product_ids=payload.cart_product_ids,
                viewed_categories=payload.viewed_categories,
                top_n=payload.top_n
            )
        return {
            "success": True,
            "count": len(items),
            "recommendations": items
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/ai/forecast")
def get_forecast(payload: ForecastRequest):
    try:
        result = forecaster.forecast_product_demand(payload.product_id, payload.current_stock)
        return {
            "success": True,
            "forecast": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/ai/inventory-alerts")
def get_inventory_alerts():
    try:
        alerts = forecaster.get_all_inventory_alerts(catalog)
        return {
            "success": True,
            "count": len(alerts),
            "alerts": alerts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/ai/assistant")
def chat_assistant(payload: AssistantRequest):
    try:
        result = assistant.query(payload.query)
        return {
            "success": True,
            **result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5001, reload=True)
