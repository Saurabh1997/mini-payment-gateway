import { Transaction } from '../types';

export class InMemoryStore {
    private transactions: Transaction[] = [];

    addTransaction(transaction: Transaction): void {
        this.transactions.push(transaction);
    }

    getAllTransactions(): Transaction[] {
        return [...this.transactions].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    getTransactionById(id: string): Transaction | undefined {
        return this.transactions.find(t => t.id === id);
    }

    getTransactionsByEmail(email: string): Transaction[] {
        return this.transactions.filter(t => t.email === email);
    }

    getTransactionsByStatus(status: 'success' | 'failed' | 'blocked'): Transaction[] {
        return this.transactions.filter(t => t.status === status);
    }

    getTransactionCount(): number {
        return this.transactions.length;
    }

    // Get transactions within a date range
    getTransactionsInRange(startDate: Date, endDate: Date): Transaction[] {
        return this.transactions.filter(t =>
            t.timestamp >= startDate && t.timestamp <= endDate
        );
    }

    // Clear all transactions (useful for testing)
    clearTransactions(): void {
        this.transactions = [];
    }
}
