import { describe, it, expect, beforeEach } from 'vitest';
import { FraudDetectionService } from '../src/services/fraud.service';

describe('FraudDetectionService', () => {
    let fraudService: FraudDetectionService;

    beforeEach(() => {
        fraudService = new FraudDetectionService();
    });

    describe('calculateRiskScore', () => {
        it('should return low risk score for normal transaction', () => {
            const result = fraudService.calculateRiskScore(100, 'user@example.com');

            expect(result.score).toBeLessThan(0.5);
            expect(result.factors.largeAmount). toBe(false);
            expect(result.factors.suspiciousDomain).toBe(false);
            expect(result.factors.testEmail).toBe(false);
        });

        it('should detect large amount transactions', () => {
            const result = fraudService.calculateRiskScore(15000, 'user@example.com');

            expect(result.factors.largeAmount).toBe(true);
            expect(result.score).toBeGreaterThan(0.4);
        });

        it('should detect suspicious domains', () => {
            const result = fraudService.calculateRiskScore(100, 'user@test.ru');

            expect(result.factors.suspiciousDomain).toBe(true);
            expect(result.score).toBeGreaterThan(0.3);
        });

        it('should detect test emails', () => {
            const result = fraudService.calculateRiskScore(100, 'test@example.com');

            expect(result.factors.testEmail).toBe(true);
            expect(result.score).toBeGreaterThan(0.2);
        });

        it('should combine multiple risk factors', () => {
            const result = fraudService.calculateRiskScore(15000, 'test@test.ru');

            expect(result.factors.largeAmount).toBe(true);
            expect(result.factors.suspiciousDomain).toBe(true);
            expect(result.factors.testEmail).toBe(true);
            expect(result.score).toBeGreaterThan(0.8);
        });

        it('should cap risk score at 1.0', () => {
            const result = fraudService.calculateRiskScore(100000, 'test@test.ru');

            expect(result.score).toBeLessThanOrEqual(1.0);
        });
    });

    describe('shouldBlockTransaction', () => {
        it('should block transactions with high risk score', () => {
            expect(fraudService.shouldBlockTransaction(0.6)).toBe(true);
            expect(fraudService.shouldBlockTransaction(0.5)).toBe(true);
        });

        it('should allow transactions with low risk score', () => {
            expect(fraudService.shouldBlockTransaction(0.4)).toBe(false);
            expect(fraudService.shouldBlockTransaction(0.1)).toBe(false);
        });
    });
});
