const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

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

let sequelize;

function getSequelizeInstance() {
    if (!sequelize) {
        sequelize = new Sequelize(
            process.env.DB_NAME || 'ajwa_dry_fruits',
            process.env.DB_USER || 'root',
            process.env.DB_PASSWORD || '',
            {
                host: process.env.DB_HOST || '127.0.0.1',
                port: Number(process.env.DB_PORT || 3306),
                dialect: 'mysql',
                logging: false,
                retry: { max: 1 }
            }
        );
    }
    return sequelize;
}

sequelize = getSequelizeInstance();

const connectDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log(`MySQL is connected to host: ${process.env.DB_HOST || '127.0.0.1'}`);
    } catch (error) {
        console.log(`MySQL connection failed (${error.message}). Falling back to SQLite database...`);
        const dataDir = path.join(__dirname, '../data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: path.join(dataDir, 'database.sqlite'),
            logging: false
        });
        await sequelize.authenticate();
        console.log(`SQLite database successfully initialized at backend/data/database.sqlite`);
    }

    await sequelize.sync();
    
    try {
        const queryInterface = sequelize.getQueryInterface();
        const productTable = await queryInterface.describeTable('products');

        if (productTable && !productTable.offerPercentage) {
            await queryInterface.addColumn('products', 'offerPercentage', {
                type: Sequelize.FLOAT,
                allowNull: false,
                defaultValue: 0
            });
        }

        if (productTable && !productTable.salesStatus) {
            await queryInterface.addColumn('products', 'salesStatus', {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'Regular'
            });
        }
    } catch (err) {
        // Table sync handled schema creation
    }
};

module.exports = { sequelize, connectDatabase, PRODUCT_CATEGORIES };

