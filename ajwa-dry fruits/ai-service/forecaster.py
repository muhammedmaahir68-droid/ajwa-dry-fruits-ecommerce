"""
Ajwa AI Commerce - Demand Forecasting & Inventory Alerts Engine
Powered by Pandas, NumPy, and scikit-learn time-series trend regression.
"""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.linear_model import Ridge
from typing import List, Dict, Any, Optional

class DemandForecaster:
    def __init__(self, catalog: Optional[List[Dict[str, Any]]] = None, sales_history: Optional[List[Dict[str, Any]]] = None):
        self.catalog = catalog or []
        self.sales_history = sales_history or []
        self._initialize_synthetic_history_if_empty()

    def _initialize_synthetic_history_if_empty(self):
        """If real sales history is empty, synthesize realistic 60-day historical time-series."""
        if len(self.sales_history) > 10:
            return

        np.random.seed(42)
        base_products = [
            {"id": 1, "name": "Royal Saudi Ajwa Dates (Al-Madinah)", "stock": 45, "base_demand": 4.5, "season_factor": 1.4},
            {"id": 2, "name": "Belgian 70% Dark Chocolate Truffles", "stock": 30, "base_demand": 2.8, "season_factor": 1.2},
            {"id": 3, "name": "Handpicked Royal Iranian Salted Pistachios", "stock": 50, "base_demand": 3.2, "season_factor": 1.1},
            {"id": 4, "name": "Californian King Raw Almonds (Badam)", "stock": 60, "base_demand": 5.0, "season_factor": 1.3},
            {"id": 5, "name": "Swiss Milk Chocolate Hazelnut Pralines", "stock": 25, "base_demand": 2.0, "season_factor": 1.0},
            {"id": 6, "name": "Royal Festive Gift Hamper", "stock": 15, "base_demand": 1.5, "season_factor": 1.6},
            {"id": 7, "name": "Organic Afghan Dried Figs (Anjeer)", "stock": 40, "base_demand": 3.0, "season_factor": 1.1},
            {"id": 8, "name": "Kashmiri Snow White Walnuts", "stock": 35, "base_demand": 2.5, "season_factor": 1.2}
        ]

        today = datetime.now()
        history = []
        for days_ago in range(60, 0, -1):
            date = today - timedelta(days=days_ago)
            day_of_week = date.weekday() # 0-6
            weekend_boost = 1.35 if day_of_week in [4, 5, 6] else 1.0 # Fri/Sat/Sun spike
            
            for prod in base_products:
                # Add seasonality & random market noise
                noise = np.random.normal(0, 0.4)
                trend_boost = 1.0 + ((60 - days_ago) * 0.005) # 0.5% growth trend
                units = max(0, int(round((prod['base_demand'] * weekend_boost * trend_boost * prod['season_factor']) + noise)))
                
                history.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "product_id": prod["id"],
                    "product_name": prod["name"],
                    "units_sold": units,
                    "day_of_week": day_of_week,
                    "day_index": 60 - days_ago
                })

        self.sales_history = history

    def forecast_product_demand(self, product_id: int, current_stock: Optional[int] = None) -> Dict[str, Any]:
        """
        Fits a scikit-learn Ridge regression model on historical daily sales
        to forecast 7-day and 30-day demand, reorder point, and stockout horizon.
        """
        df = pd.DataFrame(self.sales_history)
        prod_df = df[df['product_id'] == product_id].copy()

        if prod_df.empty:
            # Fallback estimation
            return {
                "product_id": product_id,
                "daily_velocity": 2.0,
                "forecast_7d": 14,
                "forecast_30d": 60,
                "days_until_stockout": 20.0,
                "stockout_risk": "HEALTHY",
                "reorder_point": 10,
                "status_message": "Sufficient stock for current run-rate"
            }

        # Feature Engineering: Day Index, Day of Week Sine/Cosine encoding for weekly cycles
        prod_df['dow_sin'] = np.sin(2 * np.pi * prod_df['day_of_week'] / 7.0)
        prod_df['dow_cos'] = np.cos(2 * np.pi * prod_df['day_of_week'] / 7.0)

        X = prod_df[['day_index', 'dow_sin', 'dow_cos']]
        y = prod_df['units_sold']

        model = Ridge(alpha=1.0)
        model.fit(X, y)

        # Future 7 days and 30 days predictions
        last_day = prod_df['day_index'].max()
        future_7 = []
        for i in range(1, 8):
            fut_idx = last_day + i
            fut_dow = (prod_df['day_of_week'].iloc[-1] + i) % 7
            sin_v = np.sin(2 * np.pi * fut_dow / 7.0)
            cos_v = np.cos(2 * np.pi * fut_dow / 7.0)
            fut_df = pd.DataFrame([[fut_idx, sin_v, cos_v]], columns=['day_index', 'dow_sin', 'dow_cos'])
            pred = max(0.2, float(model.predict(fut_df)[0]))
            future_7.append(pred)

        avg_daily_velocity = round(float(np.mean(future_7)), 2)
        total_7d_forecast = int(round(sum(future_7)))
        total_30d_forecast = int(round(avg_daily_velocity * 30))

        # Stockout calculations
        stock = current_stock if current_stock is not None else 35
        days_until_stockout = round(stock / max(0.1, avg_daily_velocity), 1)

        lead_time_days = 4 # Average supplier procurement lead time
        safety_stock = int(round(avg_daily_velocity * 3)) # 3 days safety buffer
        reorder_point = int(round((lead_time_days * avg_daily_velocity) + safety_stock))

        if days_until_stockout <= 4.0:
            risk = "CRITICAL"
            msg = f"🚨 URGENT: Inventory projected to deplete in {days_until_stockout} days! Reorder {reorder_point * 2} units immediately."
        elif days_until_stockout <= 8.0:
            risk = "WARNING"
            msg = f"⚠️ Alert: Stock will fall below safe threshold within {days_until_stockout} days. Prepare vendor order."
        else:
            risk = "HEALTHY"
            msg = f"✅ Optimal: Current inventory covers {days_until_stockout} days of forecasted demand."

        # Daily breakdown for charting
        chart_series = []
        start_date = datetime.now()
        for i, val in enumerate(future_7):
            f_date = (start_date + timedelta(days=i + 1)).strftime("%a, %b %d")
            chart_series.append({"date": f_date, "predicted_units": round(val, 1)})

        return {
            "product_id": product_id,
            "product_name": prod_df['product_name'].iloc[0] if 'product_name' in prod_df else f"Product {product_id}",
            "current_stock": stock,
            "daily_velocity": avg_daily_velocity,
            "forecast_7d": total_7d_forecast,
            "forecast_30d": total_30d_forecast,
            "days_until_stockout": days_until_stockout,
            "reorder_point": reorder_point,
            "stockout_risk": risk,
            "status_message": msg,
            "forecast_series": chart_series
        }

    def get_all_inventory_alerts(self, products: Optional[List[Dict[str, Any]]] = None) -> List[Dict[str, Any]]:
        """Scans catalog and outputs intelligent inventory warning cards for admin."""
        prod_list = products or [
            {"id": 1, "name": "Royal Saudi Ajwa Dates (Al-Madinah)", "stock": 14, "category": "Dates"},
            {"id": 2, "name": "Belgian 70% Dark Chocolate Truffles", "stock": 9, "category": "Imported Chocolates"},
            {"id": 3, "name": "Handpicked Royal Iranian Salted Pistachios", "stock": 42, "category": "Pistachios"},
            {"id": 4, "name": "Californian King Raw Almonds (Badam)", "stock": 12, "category": "Almonds"},
            {"id": 5, "name": "Swiss Milk Chocolate Hazelnut Pralines", "stock": 25, "category": "Imported Chocolates"},
            {"id": 6, "name": "Royal Festive Gift Hamper", "stock": 5, "category": "Gift Hampers"},
            {"id": 7, "name": "Organic Afghan Dried Figs (Anjeer)", "stock": 38, "category": "Dried Figs"},
            {"id": 8, "name": "Kashmiri Snow White Walnuts", "stock": 31, "category": "Walnuts"}
        ]

        alerts = []
        for p in prod_list:
            fc = self.forecast_product_demand(p['id'], p.get('stock', 20))
            if fc['stockout_risk'] in ['CRITICAL', 'WARNING']:
                alerts.append({
                    "product_id": p['id'],
                    "name": p['name'],
                    "category": p.get('category', 'Dry Fruits'),
                    "current_stock": p.get('stock', 20),
                    "days_remaining": fc['days_until_stockout'],
                    "daily_velocity": fc['daily_velocity'],
                    "risk_level": fc['stockout_risk'],
                    "action_required": f"Reorder {fc['reorder_point'] * 2} units (Vendor Lead Time: 4 days)",
                    "message": fc['status_message']
                })

        # Sort by urgency
        alerts.sort(key=lambda x: x['days_remaining'])
        return alerts
