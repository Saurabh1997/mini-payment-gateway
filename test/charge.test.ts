import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

describe('Charge Endpoint', () => {
    let app: any;

    beforeAll(() => {
        app = createApp();
    });

    describe('POST /charge', () => {
        it('should process a valid payment request successfully', async () => {
            const payload = {
                amount: 1000,
                currency: 'USD',
                source: 'tok_test',
                email: 'donor@example.com'
            };

            const response = await request(app)
                .post('/charge')
                .send(payload)
                .expect(200);

            expect(response.body).toHaveProperty('transactionId');
            expect(response.body).toHaveProperty('provider');
            expect(response.body).toHaveProperty('status');
            expect(response.body).toHaveProperty('riskScore');
            expect(response.body).toHaveProperty('explanation');

            expect(['stripe', 'paypal']).toContain(response.body.provider);
            expect(['success', 'failed', 'blocked']).toContain(response.body.status);
            expect(response.body.riskScore).toBeGreaterThanOrEqual(0);
            expect(response.body.riskScore).toBeLessThanOrEqual(1);
            expect(typeof response.body.explanation).toBe('string');
        });

        it('should block high-risk transactions', async () => {
            const payload = {
                amount: 15000,
                currency: 'USD',
                source: 'tok_test',
                email: 'test@test.ru'
            };

            const response = await request(app)
                .post('/charge')
                .send(payload)
                .expect(200);

            expect(response.body.status).toBe('blocked');
            expect(response.body.riskScore).toBeGreaterThanOrEqual(0.5);
        });

        it('should validate required fields', async () => {
            const payload = {
                amount: 1000,
                // Missing currency, source, email
            };

            const response = await request(app)
                .post('/charge')
                .send(payload)
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe('Validation failed');
            expect(response.body).toHaveProperty('details');
        });

        it('should validate amount is positive', async () => {
            const payload = {
                amount: -100,
                currency: 'USD',
                source: 'tok_test',
                email: 'user@example.com'
            };

            const response = await request(app)
                .post('/charge')
                .send(payload)
                .expect(400);

            expect(response.body.error).toBe('Validation failed');
        });

        it('should validate email format', async () => {
            const payload = {
                amount: 1000,
                currency: 'USD',
                source: 'tok_test',
                email: 'invalid-email'
            };

            const response = await request(app)
                .post('/charge')
                .send(payload)
                .expect(400);

            expect(response.body.error).toBe('Validation failed');
        });

        it('should validate currency format', async () => {
            const payload = {
                amount: 1000,
                currency: 'USDD', // Invalid 4-character currency
                source: 'tok_test',
                email: 'user@example.com'
            };

            const response = await request(app)
                .post('/charge')
                .send(payload)
                .expect(400);

            expect(response.body.error).toBe('Validation failed');
        });
    });

    describe('GET /transactions', () => {
        it('should return transaction list', async () => {
            const response = await request(app)
                .get('/transactions')
                .expect(200);

            expect(response.body).toHaveProperty('transactions');
            expect(response.body).toHaveProperty('pagination');
            expect(Array.isArray(response.body.transactions)).toBe(true);
        });

        it('should support pagination', async () => {
            const response = await request(app)
                .get('/transactions?limit=5&offset=0')
                .expect(200);

            expect(response.body.pagination.limit).toBe(5);
            expect(response.body.pagination.offset).toBe(0);
        });

        it('should filter by status', async () => {
            const response = await request(app)
                .get('/transactions?status=success')
                .expect(200);

            expect(response.body.transactions.every((t: any) => t.status === 'success')).toBe(true);
        });
    });

    describe('GET /health', () => {
        it('should return health status', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.body).toHaveProperty('status');
            expect(response.body.status).toBe('healthy');
            expect(response.body).toHaveProperty('service');
            expect(response.body.service).toBe('mini-payment-gateway');
        });
    });
});
