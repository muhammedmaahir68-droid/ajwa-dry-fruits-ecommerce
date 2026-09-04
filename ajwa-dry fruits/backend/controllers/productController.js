const { Op } = require('sequelize');
const crypto = require('crypto');
const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncError = require('../middlewares/catchAsyncError');
const { serializeProduct } = require('../utils/serialize');

const normalizeProductPayload = (body = {}) => {
    const payload = { ...body };
    const stock = Number(payload.stock ?? 0);
    const offerPercentage = Number(payload.offerPercentage ?? 0);
    payload.stock = Number.isNaN(stock) ? 0 : stock;
    payload.offerPercentage = Number.isNaN(offerPercentage) ? 0 : Math.min(100, Math.max(0, offerPercentage));

    if (!payload.salesStatus) {
        if (payload.stock <= 0) {
            payload.salesStatus = 'Out of Stock';
        } else if (payload.offerPercentage > 0) {
            payload.salesStatus = 'On Sale';
        } else {
            payload.salesStatus = 'Regular';
        }
    }

    return payload;
};

//Get Products - /api/v1/products
exports.getProducts = catchAsyncError(async (req, res) => {
    const resPerPage = Number(req.query.limit) || 8;
    const currentPage = Number(req.query.page) || 1;
    const where = {};

    if (req.query.keyword) {
        where.name = { [Op.like]: `%${req.query.keyword}%` };
    }

    const gte = req.query?.price?.gte ?? req.query['price[gte]'];
    const lte = req.query?.price?.lte ?? req.query['price[lte]'];
    if (gte || lte) {
        where.price = {};
        if (gte) where.price[Op.gte] = Number(gte);
        if (lte) where.price[Op.lte] = Number(lte);
    }

    if (req.query.category) {
        where.category = req.query.category;
    }

    if (req.query.ratings) {
        where.ratings = { [Op.gte]: Number(req.query.ratings) };
    }

    const totalProductsCount = await Product.count();
    const filteredProductsCount = await Product.count({ where });

    const products = await Product.findAll({
        where,
        limit: resPerPage,
        offset: resPerPage * (currentPage - 1),
        order: [['id', 'DESC']]
    });

    const productsCount =
        filteredProductsCount !== totalProductsCount ? filteredProductsCount : totalProductsCount;

    res.status(200).json({
        success: true,
        count: productsCount,
        resPerPage,
        products: products.map(serializeProduct)
    });
});

//Create Product - /api/v1/product/new
exports.newProduct = catchAsyncError(async (req, res) => {
    const images = [];
    let BASE_URL = process.env.BACKEND_URL;
    if (process.env.NODE_ENV === 'production') {
        BASE_URL = `${req.protocol}://${req.get('host')}`;
    }

    if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
            const url = `${BASE_URL}/uploads/product/${file.originalname}`;
            images.push({ _id: crypto.randomBytes(8).toString('hex'), image: url });
        });
    }

    const product = await Product.create({
        ...normalizeProductPayload(req.body),
        images,
        user: req.user.id,
        reviews: [],
        numOfReviews: 0
    });

    res.status(201).json({
        success: true,
        product: serializeProduct(product)
    });
});

//Get Single Product - api/v1/product/:id
exports.getSingleProduct = catchAsyncError(async (req, res, next) => {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
        return next(new ErrorHandler('Product not found', 400));
    }

    res.status(201).json({
        success: true,
        product: serializeProduct(product)
    });
});

//Update Product - api/v1/product/:id
exports.updateProduct = catchAsyncError(async (req, res, next) => {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }

    let images = [];
    if (req.body.imagesCleared === 'false') {
        images = Array.isArray(product.images) ? product.images : [];
    }

    let BASE_URL = process.env.BACKEND_URL;
    if (process.env.NODE_ENV === 'production') {
        BASE_URL = `${req.protocol}://${req.get('host')}`;
    }

    if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
            const url = `${BASE_URL}/uploads/product/${file.originalname}`;
            images.push({ _id: crypto.randomBytes(8).toString('hex'), image: url });
        });
    }

    const payload = { ...normalizeProductPayload(req.body), images };
    delete payload.imagesCleared;

    await product.update(payload);

    res.status(200).json({
        success: true,
        product: serializeProduct(product)
    });
});

//Delete Product - api/v1/product/:id
exports.deleteProduct = catchAsyncError(async (req, res) => {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }

    await product.destroy();

    res.status(200).json({
        success: true,
        message: 'Product Deleted!'
    });
});

//Create Review - api/v1/review
exports.createReview = catchAsyncError(async (req, res, next) => {
    const { productId, rating, comment } = req.body;
    const product = await Product.findByPk(productId);

    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    let BASE_URL = process.env.BACKEND_URL;
    if (process.env.NODE_ENV === 'production') {
        BASE_URL = `${req.protocol}://${req.get('host')}`;
    }
    const reviewImage = req.file ? `${BASE_URL}/uploads/product/${req.file.originalname}` : '';

    const reviews = Array.isArray(product.reviews) ? [...product.reviews] : [];
    const userId = Number(req.user.id);
    const existingReview = reviews.find((review) => Number(review.user?.id ?? review.user) === userId);

    if (existingReview) {
        existingReview.comment = comment;
        existingReview.rating = Number(rating);
        if (reviewImage) existingReview.image = reviewImage;
    } else {
        reviews.push({
            _id: crypto.randomBytes(10).toString('hex'),
            user: {
                id: userId,
                _id: userId,
                name: req.user.name,
                email: req.user.email
            },
            rating: Number(rating),
            comment,
            image: reviewImage
        });
    }

    const ratings =
        reviews.reduce((acc, review) => Number(review.rating || 0) + acc, 0) / (reviews.length || 1);

    await product.update({
        reviews,
        numOfReviews: reviews.length,
        ratings: Number.isNaN(ratings) ? 0 : ratings
    });

    res.status(200).json({
        success: true
    });
});

//Get Reviews - api/v1/reviews?id={productId}
exports.getReviews = catchAsyncError(async (req, res, next) => {
    const product = await Product.findByPk(req.query.id);
    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    const reviews = (product.reviews || []).map((review) => ({
        ...review,
        user:
            typeof review.user === 'object'
                ? review.user
                : { _id: review.user, id: review.user, name: 'User', email: '' }
    }));

    res.status(200).json({
        success: true,
        reviews
    });
});

//Delete Review - api/v1/review
exports.deleteReview = catchAsyncError(async (req, res, next) => {
    const product = await Product.findByPk(req.query.productId);
    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    const reviews = (product.reviews || []).filter((review) => review._id?.toString() !== req.query.id);
    const numOfReviews = reviews.length;
    let ratings = reviews.reduce((acc, review) => Number(review.rating || 0) + acc, 0) / (reviews.length || 1);
    ratings = Number.isNaN(ratings) ? 0 : ratings;

    await product.update({
        reviews,
        numOfReviews,
        ratings
    });

    res.status(200).json({
        success: true
    });
});

// get admin products  - api/v1/admin/products
exports.getAdminProducts = catchAsyncError(async (req, res) => {
    const products = await Product.findAll({ order: [['id', 'DESC']] });
    res.status(200).send({
        success: true,
        products: products.map(serializeProduct)
    });
});
