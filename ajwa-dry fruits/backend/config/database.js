const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

const PRODUCT_CATEGORIES = [
    'Dates',
    'Almonds',
    'Cashews',
    'Walnuts',
    'Pistachios',
    'Dried Figs',
    'Raisins',
    'Imported Chocolates',
    'Gift Hampers',
    'Gourmet Seeds & Berries'
];

let activeSequelize;

function getSequelizeInstance() {
    if (!activeSequelize) {
        activeSequelize = new Sequelize(
            process.env.DB_NAME || 'ajwa_dry_fruits',
            process.env.DB_USER || 'root',
            process.env.DB_PASSWORD || '',
            {
                host: process.env.DB_HOST || '127.0.0.1',
                port: Number(process.env.DB_PORT || 3306),
                dialect: 'mysql',
                logging: false,
                retry: { max: 1 },
                dialectOptions: {
                    connectTimeout: 3000
                }
            }
        );
    }
    return activeSequelize;
}

getSequelizeInstance();

const connectDatabase = async () => {
    try {
        await activeSequelize.authenticate();
        console.log(`MySQL is connected to host: ${process.env.DB_HOST || '127.0.0.1'}`);
    } catch (error) {
        console.log(`MySQL connection failed (${error.message}). Falling back to SQLite database...`);
        const dataDir = path.join(__dirname, '../data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        activeSequelize = new Sequelize({
            dialect: 'sqlite',
            storage: path.join(dataDir, 'database.sqlite'),
            logging: false
        });
        await activeSequelize.authenticate();
        console.log(`SQLite database successfully initialized at backend/data/database.sqlite`);
    }

    await activeSequelize.sync();
    
    try {
        const queryInterface = activeSequelize.getQueryInterface();
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

        const orderTable = await queryInterface.describeTable('orders');
        if (orderTable && !orderTable.cancelInfo) {
            await queryInterface.addColumn('orders', 'cancelInfo', {
                type: Sequelize.JSON,
                allowNull: true
            });
        }
        if (orderTable && !orderTable.returnInfo) {
            await queryInterface.addColumn('orders', 'returnInfo', {
                type: Sequelize.JSON,
                allowNull: true
            });
        }
        if (orderTable && !orderTable.trackingInfo) {
            await queryInterface.addColumn('orders', 'trackingInfo', {
                type: Sequelize.JSON,
                allowNull: true
            });
        }
    } catch (err) {
        // Table sync handled schema creation
    }
};

// Export a Proxy so that models requiring this module get redirected to the active Sequelize instance (MySQL or SQLite)
const sequelize = new Proxy({}, {
    get(target, prop) {
        if (typeof activeSequelize[prop] === 'function') {
            return activeSequelize[prop].bind(activeSequelize);
        }
        return activeSequelize[prop];
    },
    set(target, prop, value) {
        activeSequelize[prop] = value;
        return true;
    }
});

module.exports = { sequelize, connectDatabase, PRODUCT_CATEGORIES };
