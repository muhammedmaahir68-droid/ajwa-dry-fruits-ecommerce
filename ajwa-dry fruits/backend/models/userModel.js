const { DataTypes, Model } = require('sequelize');
const validator = require('validator');
const bcrypt = require('bcryptjs');
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
        if (!this.password) return false;
        return bcrypt.compare(enteredPassword, this.password);
    }

    getResetToken() {
        const token = crypto.randomBytes(20).toString('hex');
        this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
        this.resetPasswordTokenExpire = new Date(Date.now() + 30 * 60 * 1000);
        return token;
    }

    generateOTP() {
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit numeric OTP
        this.otpCode = crypto.createHash('sha256').update(otp).digest('hex');
        this.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // Valid 10 mins
        return otp;
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
                isEmail: { msg: 'Please enter valid email address' }
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true // Optional for Google OAuth users
        },
        avatar: {
            type: DataTypes.STRING
        },
        role: {
            type: DataTypes.STRING,
            defaultValue: 'user'
        },
        isEmailVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        googleId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        otpCode: {
            type: DataTypes.STRING,
            allowNull: true
        },
        otpExpires: {
            type: DataTypes.DATE,
            allowNull: true
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
    if (user.password && !user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
        user.password = await bcrypt.hash(user.password, 10);
    }
});

User.beforeUpdate(async (user) => {
    if (user.changed('password') && user.password && !user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
        user.password = await bcrypt.hash(user.password, 10);
    }
});

module.exports = User;
