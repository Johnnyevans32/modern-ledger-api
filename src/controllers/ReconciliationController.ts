import { Request, Response } from "express";
import { ReconciliationService } from "../services/ReconciliationService";
import { ApiResponse, BankReconciliation } from "../types";

export class ReconciliationController {
  private reconciliationService: ReconciliationService;

  constructor() {
    this.reconciliationService = new ReconciliationService();
  }

  getBankReconciliation = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { companyid, bankaccount, bankStatementBalance } = req.query;

      if (!companyid || !bankaccount) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Missing required parameters: companyid, bankaccount",
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }

      const companyId = parseInt(companyid as string);
      if (isNaN(companyId)) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Invalid company ID. Must be a number",
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }

      const bankBalance = bankStatementBalance
        ? parseFloat(bankStatementBalance as string)
        : 19000;

      const reconciliation =
        await this.reconciliationService.generateBankReconciliation(
          companyId,
          bankaccount as string,
          bankBalance
        );

      const response: ApiResponse<BankReconciliation> = {
        success: true,
        data: reconciliation,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error generating bank reconciliation:", error);

      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        timestamp: new Date().toISOString(),
      };

      res.status(500).json(response);
    }
  };

  markAsReconciled = async (req: Request, res: Response): Promise<void> => {
    try {
      const { entryIds } = req.body;

      if (!Array.isArray(entryIds) || entryIds.length === 0) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Invalid entry IDs. Must be a non-empty array of numbers",
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }

      await this.reconciliationService.markAsReconciled(entryIds);

      const response: ApiResponse<{ message: string }> = {
        success: true,
        data: { message: `${entryIds.length} entries marked as reconciled` },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error marking entries as reconciled:", error);

      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        timestamp: new Date().toISOString(),
      };

      res.status(500).json(response);
    }
  };
}
