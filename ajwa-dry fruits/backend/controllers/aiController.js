const catchAsyncError = require('../middlewares/catchAsyncError');
const http = require('http');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');

const AI_SERVICE_HOST = process.env.AI_SERVICE_HOST || '127.0.0.1';
const AI_SERVICE_PORT = process.env.AI_SERVICE_PORT || 5001;

// Helper to make fast HTTP requests to Python microservice
function callPythonAiService(endpoint, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const payload = data ? JSON.stringify(data) : null;
        const options = {
            hostname: AI_SERVICE_HOST,
            port: AI_SERVICE_PORT,
            path: endpoint,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
            },
            timeout: 2500 // 2.5s fast timeout
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => { body += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    resolve(parsed);
                } catch (e) {
                    reject(new Error('Invalid JSON from AI Service'));
                }
            });
        });

        req.on('error', (err) => reject(err));
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('AI Service request timed out'));
        });

        if (payload) req.write(payload);
        req.end();
    });
}

// 1. Recommendation Engine Handler
exports.getAiRecommendations = catchAsyncError(async (req, res, next) => {
    const { productId, cartProductIds, viewedCategories, topN = 5 } = req.body;

    try {
        const aiResponse = await callPythonAiService('/api/v1/ai/recommend', 'POST', {
            product_id: productId ? Number(productId) : null,
            cart_product_ids: (cartProductIds || []).map(Number),
            viewed_categories: viewedCategories || [],
            top_n: topN
        });

        return res.status(200).json({
            success: true,
            source: 'Python AI Microservice (scikit-learn TF-IDF)',
            ...aiResponse
        });
    } catch (err) {
        // High-availability algorithmic fallback
        const products = await Product.findAll({ limit: topN });
        return res.status(200).json({
            success: true,
            source: 'Gateway Heuristic Fallback',
            count: products.length,
            recommendations: products.map(p => ({
                id: p.id,
                name: p.name,
                price: p.price,
                category: p.category,
                ratings: p.ratings,
                stock: p.stock,
                recommendation_reason: '⭐ Popular Gourmet Selection'
            }))
        });
    }
});

// 2. Demand Forecasting Handler
exports.getDemandForecast = catchAsyncError(async (req, res, next) => {
    const { productId, currentStock } = req.body;

    try {
        const aiResponse = await callPythonAiService('/api/v1/ai/forecast', 'POST', {
            product_id: Number(productId || 1),
            current_stock: currentStock !== undefined ? Number(currentStock) : null
        });

        return res.status(200).json({
            success: true,
            source: 'Python AI Microservice (Pandas/Ridge Regression)',
            ...aiResponse
        });
    } catch (err) {
        // Fallback calculations
        const stock = currentStock || 25;
        const velocity = 3.5;
        const daysRemaining = Number((stock / velocity).toFixed(1));
        return res.status(200).json({
            success: true,
            source: 'Gateway Fallback Estimator',
            forecast: {
                product_id: productId || 1,
                daily_velocity: velocity,
                forecast_7d: Math.round(velocity * 7),
                forecast_30d: Math.round(velocity * 30),
                days_until_stockout: daysRemaining,
                stockout_risk: daysRemaining < 5 ? 'CRITICAL' : (daysRemaining < 10 ? 'WARNING' : 'HEALTHY'),
                status_message: `Estimated ${daysRemaining} days of inventory remaining at ${velocity} units/day velocity.`
            }
        });
    }
});

// 3. Intelligent Inventory Alerts Handler
exports.getInventoryAlerts = catchAsyncError(async (req, res, next) => {
    try {
        const aiResponse = await callPythonAiService('/api/v1/ai/inventory-alerts', 'GET');
        return res.status(200).json({
            success: true,
            source: 'Python AI Microservice',
            ...aiResponse
        });
    } catch (err) {
        const products = await Product.findAll();
        const lowStock = products.filter(p => (p.stock || 0) <= 15).map(p => ({
            product_id: p.id,
            name: p.name,
            category: p.category,
            current_stock: p.stock,
            days_remaining: Number(((p.stock || 5) / 2.8).toFixed(1)),
            daily_velocity: 2.8,
            risk_level: (p.stock || 0) <= 8 ? 'CRITICAL' : 'WARNING',
            action_required: `Reorder 30 units (Lead Time: 4 days)`,
            message: `Stock level (${p.stock}) is low. Reorder to prevent stockout.`
        }));

        return res.status(200).json({
            success: true,
            source: 'Gateway Fallback Rules',
            count: lowStock.length,
            alerts: lowStock
        });
    }
});

// 4. AI Shopping Assistant Chat Handler
exports.chatAssistant = catchAsyncError(async (req, res, next) => {
    const { query } = req.body;
    if (!query) {
        return res.status(400).json({ success: false, message: 'Query is required' });
    }

    try {
        const aiResponse = await callPythonAiService('/api/v1/ai/assistant', 'POST', { query });
        return res.status(200).json({
            success: true,
            source: 'Python NLP Assistant (Controlled Catalog Grounding)',
            ...aiResponse
        });
    } catch (err) {
        // Intelligent keyword fallback
        const q = query.toLowerCase();
        let cat = 'Dates';
        if (q.includes('muscle') || q.includes('protein') || q.includes('gym')) cat = 'Almonds';
        else if (q.includes('choc') || q.includes('sweet')) cat = 'Imported Chocolates';
        else if (q.includes('brain') || q.includes('memory')) cat = 'Walnuts';

        const products = await Product.findAll({ where: { category: cat }, limit: 3 });
        return res.status(200).json({
            success: true,
            source: 'Gateway Rule Engine',
            reply: `Here are our recommended ${cat} selections matching your request:`,
            matched_goal: cat.toLowerCase(),
            budget_applied: null,
            products: products.map(p => ({
                id: p.id,
                name: p.name,
                price: p.price,
                category: p.category,
                ratings: p.ratings,
                stock: p.stock,
                description: p.description
            }))
        });
    }
});
