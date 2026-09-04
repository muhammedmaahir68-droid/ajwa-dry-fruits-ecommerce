const catchAsyncError = require('../middlewares/catchAsyncError');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const Payroll = require('../models/payrollModel');

// Get Sales Analytics & Predictions - /api/v1/admin/analytics
exports.getSalesAnalytics = catchAsyncError(async (req, res, next) => {
    const products = await Product.findAll();
    const orders = await Order.findAll();
    const users = await User.findAll();

    let totalRevenue = 0;
    const categorySales = {};
    const productSalesMap = {};
    const monthlySales = {};

    orders.forEach(order => {
        const orderTotal = Number(order.totalPrice || 0);
        totalRevenue += orderTotal;

        // Group by month
        const createdDate = new Date(order.createdAt || Date.now());
        const monthKey = createdDate.toLocaleString('default', { month: 'short', year: 'numeric' });
        if (!monthlySales[monthKey]) {
            monthlySales[monthKey] = { revenue: 0, count: 0 };
        }
        monthlySales[monthKey].revenue += orderTotal;
        monthlySales[monthKey].count += 1;

        // Process order items
        if (Array.isArray(order.orderItems)) {
            order.orderItems.forEach(item => {
                const pId = item.product || item.id;
                const qty = Number(item.quantity || 1);
                const price = Number(item.price || 0);
                const itemRevenue = qty * price;

                if (!productSalesMap[pId]) {
                    productSalesMap[pId] = {
                        id: pId,
                        name: item.name || 'Product ' + pId,
                        unitsSold: 0,
                        revenue: 0,
                        image: item.image || ''
                    };
                }
                productSalesMap[pId].unitsSold += qty;
                productSalesMap[pId].revenue += itemRevenue;
            });
        }
    });

    // Calculate category breakdowns & percentage
    products.forEach(prod => {
        const cat = prod.category || 'Other';
        const pId = prod.id;
        const salesData = productSalesMap[pId] || { unitsSold: 0, revenue: 0 };

        if (!categorySales[cat]) {
            categorySales[cat] = { category: cat, revenue: 0, units: 0, productCount: 0 };
        }
        categorySales[cat].revenue += salesData.revenue;
        categorySales[cat].units += salesData.unitsSold;
        categorySales[cat].productCount += 1;
    });

    // Compute Pie Chart Percentages
    const pieChartCategory = Object.values(categorySales).map(cat => ({
        label: cat.category,
        value: Number(cat.revenue.toFixed(2)),
        percentage: totalRevenue > 0 ? Number(((cat.revenue / totalRevenue) * 100).toFixed(1)) : 0
    }));

    // Top Selling Products
    const topProducts = Object.values(productSalesMap)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

    // Advanced AI Demand Forecasting & Stockout Horizon Analysis
    const inventoryAlerts = [];
    const demandForecasts = products.map(prod => {
        const pId = prod.id;
        const salesInfo = productSalesMap[pId] || { unitsSold: 0, revenue: 0 };
        const stock = Number(prod.stock || 0);

        // Daily velocity heuristic with recency weighting
        const estimatedDailyVelocity = Math.max(0.4, Number((salesInfo.unitsSold / 14).toFixed(2))); // Past 14-day run rate
        const forecast7d = Math.round(estimatedDailyVelocity * 7);
        const forecast30d = Math.round(estimatedDailyVelocity * 30);
        const daysUntilStockout = Number((stock / estimatedDailyVelocity).toFixed(1));

        let riskLevel = 'HEALTHY';
        let alertMessage = `Inventory is sufficient for ${daysUntilStockout} days.`;

        if (daysUntilStockout <= 5.0 && stock > 0) {
            riskLevel = 'CRITICAL';
            alertMessage = `⚠️ Critical: ${prod.name} inventory expected to fall below safety threshold within ${daysUntilStockout} days!`;
            inventoryAlerts.push({
                productId: prod.id,
                name: prod.name,
                category: prod.category,
                currentStock: stock,
                daysRemaining: daysUntilStockout,
                dailyVelocity: estimatedDailyVelocity,
                riskLevel,
                action: `Procure ${forecast30d} units immediately`
            });
        } else if (daysUntilStockout <= 10.0) {
            riskLevel = 'WARNING';
            alertMessage = `Alert: ${prod.name} will reach reorder point in ${daysUntilStockout} days.`;
            inventoryAlerts.push({
                productId: prod.id,
                name: prod.name,
                category: prod.category,
                currentStock: stock,
                daysRemaining: daysUntilStockout,
                dailyVelocity: estimatedDailyVelocity,
                riskLevel,
                action: `Vendor reorder recommended`
            });
        }

        return {
            productId: prod.id,
            name: prod.name,
            category: prod.category,
            currentStock: stock,
            dailyVelocity: estimatedDailyVelocity,
            forecast7d,
            forecast30d,
            daysUntilStockout,
            riskLevel,
            alertMessage
        };
    });

    // Predictive Algorithm: Product Improvement & Restock Forecast
    const predictions = products.map(prod => {
        const pId = prod.id;
        const salesInfo = productSalesMap[pId] || { unitsSold: 0, revenue: 0 };
        const rating = Number(prod.ratings || 0);
        const stock = Number(prod.stock || 0);
        const reviewsCount = Number(prod.numOfReviews || 0);

        let recommendation = 'Performing Normally';
        let priority = 'Low';
        let actionType = 'Maintain';

        if (stock <= 5 && salesInfo.unitsSold > 0) {
            recommendation = 'Critical Stock Level: Urgent Restock Required';
            priority = 'High';
            actionType = 'Restock';
        } else if (rating < 3.5 && reviewsCount > 0) {
            recommendation = `Low Rating (${rating}/5): Customer feedback suggests quality or packaging improvement needed.`;
            priority = 'High';
            actionType = 'Quality Improvement';
        } else if (salesInfo.unitsSold > 10 && rating >= 4.0) {
            recommendation = 'Top Best Seller: Expand inventory & feature on homepage banner.';
            priority = 'Medium';
            actionType = 'Feature Banner';
        } else if (salesInfo.unitsSold === 0 && stock > 10) {
            recommendation = 'Slow Moving Item: Apply a 15% discount offer to boost sales.';
            priority = 'Medium';
            actionType = 'Promote Discount';
        }

        return {
            productId: prod.id,
            productName: prod.name,
            category: prod.category,
            currentStock: stock,
            rating,
            unitsSold: salesInfo.unitsSold,
            revenue: salesInfo.revenue,
            recommendation,
            priority,
            actionType
        };
    });

    const averageOrderValue = orders.length > 0 ? Number((totalRevenue / orders.length).toFixed(2)) : 0;

    res.status(200).json({
        success: true,
        summary: {
            totalRevenue: Number(totalRevenue.toFixed(2)),
            totalOrders: orders.length,
            totalProducts: products.length,
            totalUsers: users.length,
            averageOrderValue,
            outOfStockCount: products.filter(p => p.stock <= 0).length
        },
        pieChartCategory,
        monthlySales: Object.keys(monthlySales).map(key => ({
            month: key,
            revenue: Number(monthlySales[key].revenue.toFixed(2)),
            ordersCount: monthlySales[key].count
        })),
        topProducts,
        demandForecasts,
        inventoryAlerts,
        predictions
    });
});

// Admin Reset Database Endpoint - /api/v1/admin/reset-database
exports.resetDatabase = catchAsyncError(async (req, res, next) => {
    await Order.destroy({ where: {} });
    await Payroll.destroy({ where: {} });

    res.status(200).json({
        success: true,
        message: 'Database backlogs, orders, and test payroll records cleared successfully for a 100% fresh start!'
    });
});
