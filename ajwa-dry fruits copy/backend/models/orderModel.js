const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Order extends Model {}

Order.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        shippingInfo: {
            type: DataTypes.JSON,
            allowNull: false
        },
        user: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        orderItems: {
            type: DataTypes.JSON,
            allowNull: false
        },
        itemsPrice: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        },
        taxPrice: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        },
        shippingPrice: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        },
        totalPrice: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        },
        paymentInfo: {
            type: DataTypes.JSON,
            allowNull: false
        },
        paidAt: {
            type: DataTypes.DATE
        },
        deliveredAt: {
            type: DataTypes.DATE
        },
        orderStatus: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'Processing'
        }
    },
    {
        sequelize,
        modelName: 'Order',
        tableName: 'orders',
        timestamps: true
    }
);

module.exports = Order;
