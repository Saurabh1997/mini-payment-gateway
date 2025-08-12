import { Request, Response } from 'express';
import { InMemoryStore } from '../store/in-memory.store';

export class TransactionsController {
    private store: InMemoryStore;

    constructor(store: InMemoryStore) {
        this.store = store;
    }

    async getTransactions(req: Request, res: Response): Promise<void> {
        try {
            const {
                limit = '50',
                offset = '0',
                status,
                email,
                startDate,
                endDate
            } = req.query;

            let transactions = this.store.getAllTransactions();

            // Filter by status if provided
            if (status && ['success', 'failed', 'blocked'].includes(status as string)) {
                transactions = transactions.filter(t => t.status === status);
            }

            // Filter by email if provided
            if (email && typeof email === 'string') {
                transactions = transactions.filter(t =>
                    t.email.toLowerCase().includes(email.toLowerCase())
                );
            }

            // Filter by date range if provided
            if (startDate && endDate) {
                const start = new Date(startDate as string);
                const end = new Date(endDate as string);
                if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                    transactions = transactions.filter(t =>
                        t.timestamp >= start && t.timestamp <= end
                    );
                }
            }

            // Apply pagination
            const limitNum = Math.min(parseInt(limit as string) || 50, 100); // Max 100
            const offsetNum = parseInt(offset as string) || 0;

            const paginatedTransactions = transactions.slice(offsetNum, offsetNum + limitNum);

            // Calculate metadata
            const totalCount = transactions.length;
            const hasMore = offsetNum + limitNum < totalCount;

            res.status(200).json({
                transactions: paginatedTransactions,
                pagination: {
                    total: totalCount,
                    limit: limitNum,
                    offset: offsetNum,
                    hasMore
                }
            });

        } catch (error) {
            console.error('Error fetching transactions:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'Failed to fetch transactions'
            });
        }
    }

    async getTransactionById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const transaction = this.store.getTransactionById(id);

            if (!transaction) {
                res.status(404).json({
                    error: 'Transaction not found',
                    message: `No transaction found with ID: ${id}`
                });
                return;
            }

            res.status(200).json(transaction);

        } catch (error) {
            console.error('Error fetching transaction:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'Failed to fetch transaction'
            });
        }
    }

    async getTransactionStats(req: Request, res: Response): Promise<void> {
        try {
            const allTransactions = this.store.getAllTransactions();

            const stats = {
                total: allTransactions.length,
                byStatus: {
                    success: allTransactions.filter(t => t.status === 'success').length,
                    failed: allTransactions.filter(t => t.status === 'failed').length,
                    blocked: allTransactions.filter(t => t.status === 'blocked').length
                },
                byProvider: {
                    stripe: allTransactions.filter(t => t.provider === 'stripe').length,
                    paypal: allTransactions.filter(t => t.provider === 'paypal').length
                },
                averageRiskScore: allTransactions.length > 0
                    ? allTransactions.reduce((sum, t) => sum + t.riskScore, 0) / allTransactions.length
                    : 0,
                totalAmount: allTransactions
                    .filter(t => t.status === 'success')
                    .reduce((sum, t) => sum + t.amount, 0)
            };

            res.status(200).json(stats);

        } catch (error) {
            console.error('Error fetching transaction stats:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'Failed to fetch transaction statistics'
            });
        }
    }
}
