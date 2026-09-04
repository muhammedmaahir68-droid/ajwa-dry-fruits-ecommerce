"""
Ajwa AI Commerce - AI Shopping Concierge & Nutritional Advisor
Strict catalog-grounded NLP engine (Zero Hallucinations).
"""
import re
from typing import List, Dict, Any, Optional

GOAL_MAPPINGS = {
    "muscle": {
        "categories": ["Almonds", "Pistachios", "Cashews"],
        "keywords": ["muscle", "protein", "gym", "workout", "bodybuilding", "bicep", "strength"],
        "benefit": "Rich in plant-based branched-chain amino acids, healthy fats, and high protein for muscle hypertrophy and workout recovery."
    },
    "diabetes": {
        "categories": ["Walnuts", "Almonds", "Dried Figs"],
        "keywords": ["diabet", "sugar", "insulin", "glycemic", "low sugar"],
        "benefit": "Low glycemic index, rich in dietary fiber and healthy alpha-linolenic fats that assist in healthy glycemic regulation."
    },
    "brain": {
        "categories": ["Walnuts", "Almonds"],
        "keywords": ["brain", "memory", "focus", "study", "exam", "mental", "cognitive", "dementia"],
        "benefit": "Packed with Plant Omega-3 (ALA), Vitamin E, and neuro-protective polyphenols that enhance memory retention and synaptic speed."
    },
    "bone": {
        "categories": ["Dried Figs", "Almonds"],
        "keywords": ["bone", "calcium", "joint", "teeth", "osteoporosis"],
        "benefit": "Concentrated in plant bio-available calcium, magnesium, and phosphorus for skeletal density and joint vitality."
    },
    "digestion": {
        "categories": ["Dried Figs", "Dates"],
        "keywords": ["digest", "constipation", "stomach", "gut", "fiber", "bowel"],
        "benefit": "High soluble and insoluble prebiotic fiber that promotes smooth digestion, gut biome flora, and natural cleansing."
    },
    "energy": {
        "categories": ["Dates", "Almonds", "Pistachios"],
        "keywords": ["energy", "tired", "fatigue", "fasting", "stamina", "iron", "hemoglobin", "blood"],
        "benefit": "Natural fructose, potassium, and bio-available iron delivering rapid, sustained energy without glucose crashes."
    },
    "gift": {
        "categories": ["Gift Hampers", "Imported Chocolates", "Dates"],
        "keywords": ["gift", "hamper", "present", "festive", "box", "ramadan", "eid", "diwali", "wedding", "corporate"],
        "benefit": "Opulent luxury curation presented in gold-embossed packaging for an unforgettable gourmet impression."
    },
    "chocolate": {
        "categories": ["Imported Chocolates"],
        "keywords": ["choc", "sweet", "truffle", "praline", "cacao", "cocoa", "dessert"],
        "benefit": "Crafted from single-origin Belgian and Swiss cocoa beans rich in theobromine and mood-elevating flavonoids."
    }
}

class ShoppingAssistant:
    def __init__(self, catalog: Optional[List[Dict[str, Any]]] = None):
        self.catalog = catalog or []

    def extract_budget(self, query: str) -> Optional[float]:
        """Extracts maximum budget specified in Indian Rupees from prompt."""
        # Matches patterns like: under 1000, below ₹1,500, under rs 800, max 2000
        pattern = r'(?:under|below|less\s+than|within|max|budget(?:\s+of)?)\s*(?:rs\.?|₹|inr)?\s*([0-9]+(?:,[0-9]+)*)'
        match = re.search(pattern, query.lower())
        if match:
            raw_val = match.group(1).replace(',', '')
            try:
                return float(raw_val)
            except ValueError:
                pass
        return None

    def query(self, user_query: str) -> Dict[str, Any]:
        """
        Processes natural language query, extracts intent, applies strict constraints,
        and returns controlled catalog items.
        """
        query_clean = user_query.strip().lower()
        budget = self.extract_budget(query_clean)

        matched_goals = []
        for goal_key, data in GOAL_MAPPINGS.items():
            if any(k in query_clean for k in data['keywords']):
                matched_goals.append((goal_key, data))

        matched_categories = set()
        expert_advice = ""

        if matched_goals:
            # Combine categories from matched goals
            for goal_key, data in matched_goals:
                matched_categories.update(data['categories'])
                if not expert_advice:
                    expert_advice = data['benefit']
        else:
            # General wellness recommendation
            matched_categories.update(["Dates", "Almonds", "Pistachios", "Walnuts"])
            expert_advice = "Ajwa gourmet dry fruits are cold-stored and nitrogen-sealed for peak cellular freshness and antioxidant bio-potency."

        # Filter live catalog
        matched_products = []
        for p in self.catalog:
            cat = p.get('category', '')
            price = float(p.get('price', 0))

            # Category filter
            if cat in matched_categories or any(cat.lower() in mc.lower() for mc in matched_categories):
                # Budget filter check
                if budget is not None and price > budget:
                    continue
                matched_products.append(p)

        # If budget was too strict, get closest affordable products
        if not matched_products and budget is not None:
            under_budget = [p for p in self.catalog if float(p.get('price', 0)) <= budget]
            if under_budget:
                matched_products = sorted(under_budget, key=lambda x: x.get('ratings', 4.0), reverse=True)
                expert_advice = f"Here are the highest rated superfoods fitting comfortably within your budget of ₹{int(budget)}."

        # Sort by ratings descending
        matched_products = sorted(matched_products, key=lambda x: x.get('ratings', 4.5), reverse=True)[:4]

        # Formulate assistant reply text
        budget_str = f" within your ₹{int(budget)} budget" if budget else ""
        if matched_products:
            intro = f"✨ **Ajwa Sommelier Recommendation**{budget_str}:"
            reply_text = f"{intro}\n\n{expert_advice}\n\nI have selected {len(matched_products)} verified products from our direct farm inventory below:"
        else:
            reply_text = f"I couldn't find products strictly under ₹{int(budget) if budget else 0}. Let me know if you would like to explore our standard selections or adjust your budget range!"

        return {
            "reply": reply_text,
            "matched_goal": matched_goals[0][0] if matched_goals else "wellness",
            "budget_applied": budget,
            "products": matched_products
        }
