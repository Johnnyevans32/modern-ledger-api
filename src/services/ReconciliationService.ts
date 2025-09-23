import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { AccountingLedgerEntry } from "../entities/AccountingLedgerEntry";
import { BankReconciliation, ReconciliationItem } from "../types";

export class ReconciliationService {
  private ledgerRepository: Repository<AccountingLedgerEntry>;

  constructor() {
    this.ledgerRepository = AppDataSource.getRepository(AccountingLedgerEntry);
  }

  async generateBankReconciliation(
    companyId: number,
    bankAccount: string,
    bankStatementBalance: number = 19000
  ): Promise<BankReconciliation> {
    const ledgerBalance = await this.getLedgerBalance(companyId, bankAccount);

    const unreconciledEntries = await this.ledgerRepository
      .createQueryBuilder("entry")
      .where("entry.companyid = :companyId", { companyId })
      .andWhere("entry.bankaccount = :bankAccount", { bankAccount })
      .andWhere("entry.reconciled = false")
      .getMany();

    const reconcilingItems: ReconciliationItem[] = unreconciledEntries.map(
      (entry) => ({
        id: entry.id,
        date: entry.date,
        account: entry.account,
        debit: Number(entry.debit),
        credit: Number(entry.credit),
        netAmount: entry.netAmount,
        party: entry.party,
        note: entry.note,
        reference: entry.reference,
      })
    );

    let outstandingDeposits = 0;
    let outstandingWithdrawals = 0;

    unreconciledEntries.forEach((entry) => {
      const netAmount = entry.netAmount;
      if (netAmount > 0) {
        outstandingDeposits += netAmount;
      } else {
        outstandingWithdrawals += Math.abs(netAmount);
      }
    });

    const adjustedBankBalance =
      bankStatementBalance + outstandingDeposits - outstandingWithdrawals;
    const reconciliationDifference = ledgerBalance - adjustedBankBalance;
    const isReconciled = Math.abs(reconciliationDifference) < 0.01;

    return {
      companyId,
      bankAccount,
      reconciliationDate: new Date().toISOString().split("T")[0],
      balances: {
        ledgerBalance,
        bankStatementBalance,
        adjustedBankBalance,
      },
      reconcilingItems: {
        totalUnreconciledItems: unreconciledEntries.length,
        outstandingDeposits,
        outstandingWithdrawals,
        items: reconcilingItems,
      },
      reconciliationDifference,
      isReconciled,
    };
  }

  private async getLedgerBalance(
    companyId: number,
    bankAccount: string
  ): Promise<number> {
    const result = await this.ledgerRepository
      .createQueryBuilder("entry")
      .select("SUM(entry.debit - entry.credit)", "balance")
      .where("entry.account = :account", { account: "Cash" })
      .andWhere("entry.companyid = :companyId", { companyId })
      .andWhere("entry.bankaccount = :bankAccount", { bankAccount })
      .getRawOne();

    return parseFloat(result?.balance || "0");
  }

  async markAsReconciled(entryIds: number[]): Promise<void> {
    await this.ledgerRepository
      .createQueryBuilder()
      .update(AccountingLedgerEntry)
      .set({ reconciled: true })
      .where("id IN (:...ids)", { ids: entryIds })
      .execute();
  }
}
