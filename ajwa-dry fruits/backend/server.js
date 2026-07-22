const app = require('./app');
const { connectDatabase } = require('./config/database');
const seedDatabase = require('./utils/seeder');

const startServer = async () => {
    await connectDatabase();
    await seedDatabase();

    const port = process.env.PORT || 8000;
    const server = app.listen(port, () => {
        console.log(`Server is running on http://127.0.0.1:${port} in ${process.env.NODE_ENV || 'development'} mode`);
    });

    process.on('unhandledRejection',(err)=>{
        console.log(`Error: ${err.message}`);
        console.log('Shutting down the server due to unhandled rejection error');
        server.close(()=>{
            process.exit(1);
        });
    });

    process.on('uncaughtException',(err)=>{
        console.log(`Error: ${err.message}`);
        console.log('Shutting down the server due to uncaught exception error');
        server.close(()=>{
            process.exit(1);
        });
    });
};

startServer().catch((err) => {
    console.log(`Error: ${err.message}`);
    console.log('Shutting down the server due to startup error');
    process.exit(1);
});


