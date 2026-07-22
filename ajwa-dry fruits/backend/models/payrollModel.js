const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Payroll extends Model {}

Payroll.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        employeeName: {
            type: DataTypes.STRING(120),
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Employee name is required' }
            }
        },
        email: {
            type: DataTypes.STRING(120),
            allowNull: true
        },
        designation: {
            type: DataTypes.STRING(100),
            allowNull: false,
            defaultValue: 'Staff'
        },
        department: {
            type: DataTypes.STRING(100),
            allowNull: false,
            defaultValue: 'General'
        },
        baseSalary: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        },
        allowances: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        },
        deductions: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        },
        netSalary: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        },
        paymentStatus: {
            type: DataTypes.STRING(30),
            allowNull: false,
            defaultValue: 'Pending'
        },
        payDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        monthYear: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'July 2026'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },
    {
        sequelize,
        modelName: 'Payroll',
        tableName: 'payrolls',
        timestamps: true
    }
);

module.exports = Payroll;
