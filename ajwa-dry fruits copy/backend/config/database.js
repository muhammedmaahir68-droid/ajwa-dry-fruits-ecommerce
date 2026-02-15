const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 3306),
        dialect: 'mysql',
        logging: false
    }
);

const PRODUCT_CATEGORIES = [
    'Electronics',
    'Mobile Phones',
    'Laptops',
    'Accessories',
    'Headphones',
    'Food',
    'Books',
    'Clothes/Shoes',
    'Beauty/Health',
    'Sports',
    'Outdoor',
    'Home',
    'Dates',
    'Almonds',
    'Cashews',
    'Walnuts',
    'Pistachios',
    'Dried Figs',
    'Raisins'
];

const connectDatabase = async () => {
    await sequelize.authenticate();
    await sequelize.sync();
    const queryInterface = sequelize.getQueryInterface();
    const productTable = await queryInterface.describeTable('products');

    if (!productTable.offerPercentage) {
        await queryInterface.addColumn('products', 'offerPercentage', {
            type: Sequelize.FLOAT,
            allowNull: false,
            defaultValue: 0
        });
    }

    if (!productTable.salesStatus) {
        await queryInterface.addColumn('products', 'salesStatus', {
            type: Sequelize.ENUM('Regular', 'On Sale', 'Out of Stock'),
            allowNull: false,
            defaultValue: 'Regular'
        });
    }

    await queryInterface.changeColumn('products', 'category', {
        type: Sequelize.ENUM(...PRODUCT_CATEGORIES),
        allowNull: false
    });

    console.log(`MySQL is connected to the host: ${process.env.DB_HOST}`);
};

module.exports = { sequelize, connectDatabase };
