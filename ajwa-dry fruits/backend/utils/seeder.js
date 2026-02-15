const products = require('../data/products.json');
const Product = require('../models/productModel');
const dotenv = require('dotenv');
const { connectDatabase } = require('../config/database');

dotenv.config({ path: 'backend/config/config.env' });

const seedProducts = async () => {
    try {
        await connectDatabase();
        await Product.destroy({ where: {}, truncate: true });
        console.log('Products deleted!');
        await Product.bulkCreate(
            products.map((product) => ({
                ...product,
                images: product.images || [],
                reviews: product.reviews || []
            }))
        );
        console.log('All products added!');
    } catch (error) {
        console.log(error.message);
    }
    process.exit();
};

seedProducts();
