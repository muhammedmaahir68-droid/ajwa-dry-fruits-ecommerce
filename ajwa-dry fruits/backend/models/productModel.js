const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Product extends Model {}

Product.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        },
        offerPercentage: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        },
        salesStatus: {
            type: DataTypes.STRING(100),
            allowNull: false,
            defaultValue: 'Regular'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        ratings: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        },
        images: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: []
        },
        category: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        seller: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        stock: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        numOfReviews: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        reviews: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: []
        },
        user: {
            type: DataTypes.INTEGER
        }
    },
    {
        sequelize,
        modelName: 'Product',
        tableName: 'products',
        timestamps: true
    }
);

module.exports = Product;
