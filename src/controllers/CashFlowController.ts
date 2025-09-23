import { Request, Response } from "express";
import { CashFlowService } from "../services/CashFlowService";
import { ApiResponse, CashFlowStatement } from "../types";

export class CashFlowController {
  private cashFlowService: CashFlowService;

  constructor() {
    this.cashFlowService = new CashFlowService();
  }

  getCashFlowStatement = async (req: Request, res: Response): Promise<void> => {
    try {
      const { companyid, fromDate, toDate } = req.query;

      if (!companyid || !fromDate || !toDate) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Missing required parameters: companyid, fromDate, toDate",
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }

      if (
        !this.isValidDate(fromDate as string) ||
        !this.isValidDate(toDate as string)
      ) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Invalid date format. Use YYYY-MM-DD",
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

      const cashFlowStatement =
        await this.cashFlowService.generateCashFlowStatement(
          companyId,
          fromDate as string,
          toDate as string
        );

      const response: ApiResponse<CashFlowStatement> = {
        success: true,
        data: cashFlowStatement,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error generating cash flow statement:", error);

      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        timestamp: new Date().toISOString(),
      };

      res.status(500).json(response);
    }
  };

  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return (
      date instanceof Date &&
      !isNaN(date.getTime()) &&
      /^\d{4}-\d{2}-\d{2}$/.test(dateString)
    );
  }
}
