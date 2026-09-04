"""
Ajwa AI Commerce - Recommendation Engine
Powered by scikit-learn (TF-IDF + Cosine Similarity) and Collaborative Co-Purchase Rules.
"""
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Any, Optional

# Knowledge graph tagging for nutritional & pairing benefits
CATEGORY_AFFINITIES = {
    "Dates": ["Almonds", "Pistachios", "Walnuts", "Imported Chocolates"],
    "Almonds": ["Dates", "Cashews", "Dried Figs", "Walnuts"],
    "Cashews": ["Pistachios", "Almonds", "Imported Chocolates"],
    "Walnuts": ["Dates", "Dried Figs", "Almonds"],
    "Pistachios": ["Cashews", "Dates", "Imported Chocolates"],
    "Dried Figs": ["Dates", "Walnuts", "Almonds"],
    "Imported Chocolates": ["Dates", "Pistachios", "Gift Hampers"],
    "Gift Hampers": ["Dates", "Almonds", "Imported Chocolates"]
}

DEFAULT_PRODUCTS = [
    {
        "id": 1,
        "name": "Royal Saudi Ajwa Dates (Al-Madinah)",
        "category": "Dates",
        "price": 1250,
        "ratings": 4.9,
        "stock": 45,
        "description": "Authentic soft nutrient-dense Premium Ajwa dates from Madinah Munawwarah. Rich in antioxidants, potassium, fiber, natural energy and heart health.",
        "tags": ["antioxidant", "heart-health", "energy", "sunnah", "fiber", "potassium", "iron"]
    },
    {
        "id": 2,
        "name": "Belgian 70% Dark Chocolate Truffles",
        "category": "Imported Chocolates",
        "price": 1450,
        "ratings": 4.8,
        "stock": 30,
        "description": "Luxurious imported Belgian dark chocolate truffles crafted with 70% cocoa solids, silky ganache center, and cocoa powder dusting. Rich in polyphenols and mood boosting.",
        "tags": ["antioxidants", "mood", "luxury", "gourmet", "cocoa", "gift"]
    },
    {
        "id": 3,
        "name": "Handpicked Royal Iranian Salted Pistachios",
        "category": "Pistachios",
        "price": 980,
        "ratings": 4.7,
        "stock": 50,
        "description": "Naturally opened jumbo-sized Iranian pistachios dry-roasted with sea salt for an irresistible crunch. High protein, healthy fats, eye health and gym recovery.",
        "tags": ["protein", "muscle", "workout", "keto", "lutein", "snack"]
    },
    {
        "id": 4,
        "name": "Californian King Raw Almonds (Badam)",
        "category": "Almonds",
        "price": 850,
        "ratings": 4.6,
        "stock": 60,
        "description": "Premium whole California almonds packed with plant protein, vitamin E, magnesium, healthy monounsaturated fats and dietary fiber for muscle building.",
        "tags": ["protein", "muscle", "gym", "vitamin-e", "brain", "skin", "weight-management"]
    },
    {
        "id": 5,
        "name": "Swiss Milk Chocolate Hazelnut Pralines",
        "category": "Imported Chocolates",
        "price": 1600,
        "ratings": 4.9,
        "stock": 25,
        "description": "Decadent Swiss milk chocolate pralines filled with smooth roasted hazelnut cream and crisp wafer crunch.",
        "tags": ["luxury", "gourmet", "sweet", "hazelnut", "festive"]
    },
    {
        "id": 6,
        "name": "Royal Festive Gift Hamper (Dates, Nuts & Chocolates)",
        "category": "Gift Hampers",
        "price": 2800,
        "ratings": 5.0,
        "stock": 15,
        "description": "An opulent luxury gift box containing Ajwa dates, Iranian pistachios, California almonds, and Belgian dark chocolate truffles in a gold-embossed box.",
        "tags": ["gift", "hamper", "luxury", "festive", "assorted", "corporate"]
    },
    {
        "id": 7,
        "name": "Organic Afghan Dried Figs (Anjeer)",
        "category": "Dried Figs",
        "price": 790,
        "ratings": 4.5,
        "stock": 40,
        "description": "Naturally sun-dried Afghan figs packed with dietary fiber, calcium, iron and natural sweetness without added sugar. Excellent for digestion and bone strength.",
        "tags": ["calcium", "digestion", "iron", "fiber", "bone-health", "sugar-free"]
    },
    {
        "id": 8,
        "name": "Kashmiri Snow White Walnuts (Akhrot Kernels)",
        "category": "Walnuts",
        "price": 1100,
        "ratings": 4.8,
        "stock": 35,
        "description": "Freshly shelled premium Kashmiri walnut halves rich in Plant Omega-3 ALA, neuro-protective compounds, brain health, memory boosting and heart vitality.",
        "tags": ["omega-3", "brain", "memory", "focus", "heart", "protein"]
    }
]

class ProductRecommender:
    def __init__(self, catalog: Optional[List[Dict[str, Any]]] = None):
        self.catalog = catalog if catalog and len(catalog) > 0 else DEFAULT_PRODUCTS
        self.df = pd.DataFrame(self.catalog)
        self.vectorizer = TfidfVectorizer(stop_words='english', token_pattern=r'(?u)\b\w+\b')
        self._fit_model()

    def _fit_model(self):
        # Create rich content representation combining text, category, and tags
        def create_corpus(row):
            tags_str = " ".join(row.get('tags', [])) if isinstance(row.get('tags'), list) else ""
            desc = str(row.get('description', ''))
            cat = str(row.get('category', ''))
            name = str(row.get('name', ''))
            return f"{name} {cat} {desc} {tags_str}".lower()

        corpus = self.df.apply(create_corpus, axis=1)
        self.tfidf_matrix = self.vectorizer.fit_transform(corpus)
        self.similarity_matrix = cosine_similarity(self.tfidf_matrix, self.tfidf_matrix)

    def get_content_recommendations(self, product_id: int, top_n: int = 4) -> List[Dict[str, Any]]:
        """Finds top N similar products based on TF-IDF cosine similarity."""
        idx_matches = self.df.index[self.df['id'] == product_id].tolist()
        if not idx_matches:
            # Fallback to highest rated products
            return self.df.sort_values(by='ratings', ascending=False).head(top_n).to_dict(orient='records')
        
        target_idx = idx_matches[0]
        sim_scores = list(enumerate(self.similarity_matrix[target_idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        
        results = []
        for idx, score in sim_scores:
            if idx == target_idx:
                continue
            item = self.df.iloc[idx].to_dict()
            item['similarity_score'] = round(float(score), 3)
            item['recommendation_reason'] = "Similar Nutritional Profile & Superfood Category"
            results.append(item)
            if len(results) >= top_n:
                break
        return results

    def get_personalized_recommendations(
        self,
        cart_product_ids: List[int] = None,
        viewed_categories: List[str] = None,
        top_n: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Hybrid Recommender:
        Combines Content Similarity with Collaborative Co-Purchase Rule Affinities.
        Example: Almonds + Dates in cart -> Cashews + Pistachios recommended.
        """
        cart_product_ids = cart_product_ids or []
        viewed_categories = viewed_categories or []

        if not cart_product_ids and not viewed_categories:
            # Default "Trending & Top-Rated" Picks
            top_picks = self.df.sort_values(by=['ratings', 'stock'], ascending=[False, False]).head(top_n)
            records = top_picks.to_dict(orient='records')
            for r in records:
                r['recommendation_reason'] = "⭐ Ajwa Curated Top Flagship Pick"
                r['similarity_score'] = 0.95
            return records

        # Identify target categories and affinities
        target_categories = set(viewed_categories)
        cart_cats = []
        for pid in cart_product_ids:
            matches = self.df[self.df['id'] == pid]
            if not matches.empty:
                c = matches.iloc[0]['category']
                cart_cats.append(c)
                target_categories.add(c)
                # Add co-purchase pairing affinities
                for aff in CATEGORY_AFFINITIES.get(c, []):
                    target_categories.add(aff)

        # Score all products in catalog
        scored_items = []
        for idx, row in self.df.iterrows():
            if row['id'] in cart_product_ids:
                continue # Do not recommend what is already in cart

            score = float(row.get('ratings', 4.0)) / 5.0 * 0.4
            reason = "Recommended for your gourmet palette"

            # Affinity bonus
            if row['category'] in target_categories:
                score += 0.4
                reason = f"Perfect Pairing with your {', '.join(cart_cats) if cart_cats else 'interests'}"

            # Stock availability check
            if row.get('stock', 0) > 0:
                score += 0.2

            item = row.to_dict()
            item['similarity_score'] = round(score, 3)
            item['recommendation_reason'] = reason
            scored_items.append(item)

        scored_items = sorted(scored_items, key=lambda x: x['similarity_score'], reverse=True)
        return scored_items[:top_n]
