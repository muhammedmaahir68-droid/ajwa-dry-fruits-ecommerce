const { DataTypes, Model } = require('sequelize');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sequelize } = require('../config/database');

class User extends Model {
    getJwtToken() {
        return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_TIME
        });
    }

    async isValidPassword(enteredPassword) {
        return bcrypt.compare(enteredPassword, this.password);
    }

    getResetToken() {
        const token = crypto.randomBytes(20).toString('hex');
        this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
        this.resetPasswordTokenExpire = new Date(Date.now() + 30 * 60 * 1000);
        return token;
    }
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Please enter name' }
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: { msg: 'Please enter email' },
                isEmail: { msg: 'Please enter valid email address' },
                isValidEmail(value) {
                    if (!validator.isEmail(value || '')) {
                        throw new Error('Please enter valid email address');
                    }
                }
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Please enter password' },
                len: {
                    args: [6, 255],
                    msg: 'Password must be at least 6 characters'
                }
            }
        },
        avatar: {
            type: DataTypes.STRING
        },
        role: {
            type: DataTypes.STRING,
            defaultValue: 'user'
        },
        resetPasswordToken: {
            type: DataTypes.STRING
        },
        resetPasswordTokenExpire: {
            type: DataTypes.DATE
        }
    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true
    }
);

User.beforeCreate(async (user) => {
    user.password = await bcrypt.hash(user.password, 10);
});

User.beforeUpdate(async (user) => {
    if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
    }
});

module.exports = User;
