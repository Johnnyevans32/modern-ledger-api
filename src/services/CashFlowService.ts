import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import {
  AccountingLedgerEntry,
  ActivityType,
} from "../entities/AccountingLedgerEntry";
import { CashFlowStatement } from "../types";

export class CashFlowService {
  private ledgerRepository: Repository<AccountingLedgerEntry>;

  constructor() {
    this.ledgerRepository = AppDataSource.getRepository(AccountingLedgerEntry);
  }

  async generateCashFlowStatement(
    companyId: number,
    fromDate: string,
    toDate: string
  ): Promise<CashFlowStatement> {
    const entries = await this.ledgerRepository
      .createQueryBuilder("entry")
      .where("entry.companyid = :companyId", { companyId })
      .andWhere("entry.date >= :fromDate", { fromDate })
      .andWhere("entry.date <= :toDate", { toDate })
      .andWhere("(entry.debit != 0 OR entry.credit != 0)")
      .getMany();

    const activitySummary: {
      [key: string]: { inflows: number; outflows: number; net: number };
    } = {
      [ActivityType.OPERATING]: { inflows: 0, outflows: 0, net: 0 },
      [ActivityType.INVESTING]: { inflows: 0, outflows: 0, net: 0 },
      [ActivityType.FINANCING]: { inflows: 0, outflows: 0, net: 0 },
    };

    let totalInflows = 0;
    let totalOutflows = 0;
    let netChange = 0;

    entries.forEach((entry) => {
      const activityType = entry.activityType;
      const netAmount = entry.netAmount;

      if (netAmount > 0) {
        activitySummary[activityType].inflows += netAmount;
        totalInflows += netAmount;
      } else {
        activitySummary[activityType].outflows += Math.abs(netAmount);
        totalOutflows += Math.abs(netAmount);
      }

      activitySummary[activityType].net += netAmount;
      netChange += netAmount;
    });

    const closingBalance = await this.getClosingCashBalance(companyId, toDate);

    const activities: {
      [key: string]: {
        cashInflows: number;
        cashOutflows: number;
        netChange: number;
      };
    } = {};

    Object.entries(activitySummary).forEach(([activityType, summary]) => {
      activities[activityType] = {
        cashInflows: summary.inflows,
        cashOutflows: summary.outflows,
        netChange: summary.net,
      };
    });

    return {
      period: {
        from: fromDate,
        to: toDate,
        companyId,
      },
      activities,
      summary: {
        totalCashInflows: totalInflows,
        totalCashOutflows: totalOutflows,
        netChangeInCash: netChange,
        closingCashBalance: closingBalance,
      },
    };
  }

  private async getClosingCashBalance(
    companyId: number,
    toDate: string
  ): Promise<number> {
    const result = await this.ledgerRepository
      .createQueryBuilder("entry")
      .select("SUM(entry.debit - entry.credit)", "balance")
      .where("entry.account = :account", { account: "Cash" })
      .andWhere("entry.companyid = :companyId", { companyId })
      .andWhere("entry.date <= :toDate", { toDate })
      .getRawOne();

    return parseFloat(result?.balance || "0");
  }
}
