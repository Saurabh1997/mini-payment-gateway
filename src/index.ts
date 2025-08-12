import 'dotenv/config';
import { createApp } from './app';

const PORT = process.env.PORT || 4000;

async function startServer() {
    try {
        const app = createApp();

        app.listen(PORT, () => {
            console.log(`🚀 Mini Payment Gateway server running on port ${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
            console.log(`💳 Charge endpoint: http://localhost:${PORT}/charge`);
            console.log(`📋 Transactions endpoint: http://localhost:${PORT}/transactions`);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

startServer();
