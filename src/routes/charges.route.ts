
import { Request, Response } from 'express';
import { ChargeService } from '../services/charge.service';
import { validateChargeRequest, createValidationError } from '../validators/charge.validator';

export class ChargeController {
  private chargeService: ChargeService;

  constructor() {
    this.chargeService = new ChargeService();
  }

  async processCharge(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const validation = validateChargeRequest(req.body);
      if (!validation.success) {
        res.status(400).json(createValidationError(validation.error));
        return;
      }

      // Process charge using service
      const response = await this.chargeService.processCharge(validation.data);

      // Return response
      res.status(200).json(response);

    } catch (error) {
      console.error('Error processing charge:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to process payment'
      });
    }
  }

  // Get store instance for other routes
  getStore() {
    return this.chargeService.getStore();
  }
}
