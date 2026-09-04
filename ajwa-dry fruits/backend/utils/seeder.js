const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../config/config.env') });

const seedDatabase = async () => {
    try {
        const User = require('../models/userModel');
        const Product = require('../models/productModel');
        const Order = require('../models/orderModel');
        const Payroll = require('../models/payrollModel');

        // Sync all models to update columns
        await Product.sync();
        await Order.sync();
        await Payroll.sync();
        await User.sync({ alter: true }); // Automatically adds missing columns (isEmailVerified, googleId, otpCode, otpExpires)

        console.log('[SYNC SUCCESS] All database schemas, user authentication & OTP columns updated.');

        // Ensure admin user exists
        const adminEmail = 'admin@ajwadryfruits.com';
        let adminUser = await User.findOne({ where: { email: adminEmail } });
        if (!adminUser) {
            adminUser = await User.create({
                name: 'System Administrator',
                email: adminEmail,
                password: 'AdminPassword@123',
                role: 'admin',
                avatar: '/images/default_avatar.png',
                isEmailVerified: true
            });
            console.log(`[FRESH START] Created default admin account: ${adminEmail} / AdminPassword@123`);
        } else {
            adminUser.isEmailVerified = true;
            await adminUser.save();
            console.log(`[FRESH START] Admin account verified: ${adminEmail}`);
        }

        // Ensure catalog products exist
        const productCount = await Product.count();
        if (productCount === 0) {
            const productsData = require('../data/products.json');
            await Product.bulkCreate(productsData);
            console.log(`[FRESH START] Seeded ${productsData.length} catalog products to database.`);
        }

    } catch (error) {
        console.log('Seeder Error:', error.message);
    }
};

if (require.main === module) {
    const { connectDatabase } = require('../config/database');
    connectDatabase().then(() => seedDatabase()).then(() => process.exit());
}

module.exports = seedDatabase;
