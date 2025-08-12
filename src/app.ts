import express from 'express';
import { ChargeController } from './routes/charges.route';
import { TransactionsController } from './routes/transaction.route';

export function createApp(): express.Application {
    const app = express();

    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // CORS headers
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

        if (req.method === 'OPTIONS') {
            res.sendStatus(200);
        } else {
            next();
        }
    });

    // Request logging
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });

    // Initialize controllers
    const chargeController = new ChargeController();
    const transactionsController = new TransactionsController(chargeController.getStore());

    // Routes
    app.post('/charge', (req, res) => chargeController.processCharge(req, res));

    // Stretch goal routes
    app.get('/transactions', (req, res) => transactionsController.getTransactions(req, res));
    app.get('/transactions/:id', (req, res) => transactionsController.getTransactionById(req, res));
    app.get('/transactions/stats/summary', (req, res) => transactionsController.getTransactionStats(req, res));

    // Health check endpoint
    app.get('/health', (req, res) => {
        res.status(200).json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: 'mini-payment-gateway'
        });
    });

    // 404 handler (Express 5: avoid wildcard path patterns)
    app.use((req, res) => {
        res.status(404).json({
            error: 'Not found',
            message: `Route ${req.method} ${req.originalUrl} not found`
        });
    });

    // Global error handler
    app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
        console.error('Unhandled error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'An unexpected error occurred'
        });
    });

    return app;
}
