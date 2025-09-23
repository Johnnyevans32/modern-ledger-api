import { Router } from "express";
import { CashFlowController } from "../controllers/CashFlowController";
import { ReconciliationController } from "../controllers/ReconciliationController";

const router = Router();

const cashFlowController = new CashFlowController();
const reconciliationController = new ReconciliationController();

router.get("/cashflow", cashFlowController.getCashFlowStatement);

router.get("/reconciliation", reconciliationController.getBankReconciliation);
router.patch(
  "/reconciliation/mark-reconciled",
  reconciliationController.markAsReconciled
);

router.get("/health", (req, res) => {
  res.json({
    success: true,
    data: {
      status: "healthy",
      service: "Ledger API",
      version: "1.0.0",
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
