import sys
from recommender import ProductRecommender, DEFAULT_PRODUCTS
from forecaster import DemandForecaster
from assistant import ShoppingAssistant

print("Testing Recommender...")
rec = ProductRecommender(DEFAULT_PRODUCTS)
res = rec.get_personalized_recommendations(cart_product_ids=[1], viewed_categories=["Dates"])
print(f"Recommendations count: {len(res)}, Top pick: {res[0]['name']}")

print("Testing Forecaster...")
fc = DemandForecaster(DEFAULT_PRODUCTS)
forecast = fc.forecast_product_demand(1, current_stock=10)
print(f"Product 1 Forecast: Daily Velocity={forecast['daily_velocity']}, Days Left={forecast['days_until_stockout']}, Risk={forecast['stockout_risk']}")

print("Testing Assistant...")
asst = ShoppingAssistant(DEFAULT_PRODUCTS)
query_res = asst.query("I need dry fruits for muscle building under ₹1,000")
print(f"Assistant Goal: {query_res['matched_goal']}, Products: {len(query_res['products'])}, Applied Budget: {query_res['budget_applied']}")
for p in query_res['products']:
    print(f"  - {p['name']} (INR {p['price']})")

print("ALL TESTS PASSED!")
