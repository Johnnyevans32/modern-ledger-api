import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDateString,
} from "class-validator";

export enum ActivityType {
  OPERATING = "Operating",
  INVESTING = "Investing",
  FINANCING = "Financing",
}

@Entity("AccountingLedgerEntry")
export class AccountingLedgerEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "date" })
  @IsNotEmpty()
  @IsDateString()
  date: Date;

  @Column({ type: "varchar", length: 255 })
  @IsNotEmpty()
  account: string;

  @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
  @IsNumber()
  debit: number;

  @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
  @IsNumber()
  credit: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  @IsOptional()
  party?: string;

  @Column({ type: "text", nullable: true })
  @IsOptional()
  note?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  @IsOptional()
  bankaccount?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  @IsOptional()
  reference?: string;

  @Column({ type: "boolean", default: false })
  @IsBoolean()
  reconciled: boolean;

  @Column({ type: "int", default: 1 })
  @IsNumber()
  companyid: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get netAmount(): number {
    return Number(this.debit) - Number(this.credit);
  }

  get activityType(): ActivityType {
    if (
      this.account.toLowerCase().includes("rent") ||
      this.account.toLowerCase().includes("utilities") ||
      this.account.toLowerCase().includes("expense") ||
      this.account.toLowerCase().includes("sales") ||
      this.account.toLowerCase().includes("revenue") ||
      this.account.toLowerCase().includes("inventory") ||
      this.account.toLowerCase().includes("bank charges")
    ) {
      return ActivityType.OPERATING;
    }

    if (
      this.account.toLowerCase().includes("loan") ||
      this.account.toLowerCase().includes("capital") ||
      this.account.toLowerCase().includes("investment") ||
      this.note?.toLowerCase().includes("capital contribution") ||
      this.note?.toLowerCase().includes("loan")
    ) {
      return ActivityType.FINANCING;
    }

    if (
      this.account.toLowerCase().includes("equipment") ||
      this.account.toLowerCase().includes("property") ||
      this.account.toLowerCase().includes("asset")
    ) {
      return ActivityType.INVESTING;
    }

    if (this.account === "Cash") {
      if (
        this.note?.toLowerCase().includes("capital contribution") ||
        this.note?.toLowerCase().includes("loan")
      ) {
        return ActivityType.FINANCING;
      }
      if (
        this.note?.toLowerCase().includes("equipment") ||
        this.note?.toLowerCase().includes("property")
      ) {
        return ActivityType.INVESTING;
      }
      return ActivityType.OPERATING;
    }

    return ActivityType.OPERATING;
  }
}
