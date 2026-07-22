const products = require('../data/products.json');
const dotenv = require('dotenv');
const path = require('path');
const { connectDatabase } = require('../config/database');

dotenv.config({ path: path.join(__dirname, '../config/config.env') });

const seedDatabase = async () => {
    try {
        await connectDatabase();

        const Product = require('../models/productModel');
        const User = require('../models/userModel');
        const Payroll = require('../models/payrollModel');

        // Sync models to ensure tables exist
        await Product.sync({ force: true });
        await User.sync();
        await Payroll.sync();
        
        if (Array.isArray(products) && products.length > 0) {
            await Product.bulkCreate(
                products.map((product) => ({
                    ...product,
                    offerPercentage: product.offerPercentage || 0,
                    salesStatus: product.salesStatus || 'Regular',
                    images: product.images || [],
                    reviews: product.reviews || []
                }))
            );
            console.log(`Seeded ${products.length} gourmet products & images successfully!`);
        }

        // Seed Admin User
        const adminEmail = 'admin@ajwadryfruits.com';
        let adminUser = await User.findOne({ where: { email: adminEmail } });
        if (!adminUser) {
            adminUser = await User.create({
                name: 'System Administrator',
                email: adminEmail,
                password: 'AdminPassword@123',
                role: 'admin',
                avatar: '/images/default_avatar.png'
            });
            console.log(`Created default admin account: ${adminEmail} / AdminPassword@123`);
        }

        // Seed Sample Payroll Records if empty
        const payrollCount = await Payroll.count();
        if (payrollCount === 0) {
            await Payroll.bulkCreate([
                {
                    employeeName: 'Rahul Sharma',
                    email: 'rahul@ajwadryfruits.com',
                    designation: 'Inventory Manager',
                    department: 'Warehouse & Stock',
                    baseSalary: 45000,
                    allowances: 5000,
                    deductions: 2000,
                    netSalary: 48000,
                    paymentStatus: 'Paid',
                    payDate: '2026-07-01',
                    monthYear: 'July 2026',
                    notes: 'Performance bonus included'
                },
                {
                    employeeName: 'Fatima Al-Sayed',
                    email: 'fatima@ajwadryfruits.com',
                    designation: 'Sales & Marketing Lead',
                    department: 'Marketing',
                    baseSalary: 52000,
                    allowances: 4000,
                    deductions: 1500,
                    netSalary: 54500,
                    paymentStatus: 'Paid',
                    payDate: '2026-07-01',
                    monthYear: 'July 2026',
                    notes: 'Quarterly review payout'
                },
                {
                    employeeName: 'Muhammed Tariq',
                    email: 'tariq@ajwadryfruits.com',
                    designation: 'Quality Control Specialist',
                    department: 'Quality Assurance',
                    baseSalary: 38000,
                    allowances: 2500,
                    deductions: 1000,
                    netSalary: 39500,
                    paymentStatus: 'Pending',
                    payDate: '2026-07-25',
                    monthYear: 'July 2026',
                    notes: 'Awaiting monthly verification'
                }
            ]);
            console.log(`Seeded sample payroll records!`);
        }

    } catch (error) {
        console.log('Seeder Error:', error.message);
    }
};

if (require.main === module) {
    seedDatabase().then(() => process.exit());
}

module.exports = seedDatabase;
