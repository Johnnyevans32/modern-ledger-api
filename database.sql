-- Database schema and sample data for Accounting Ledger Entry

-- Schema
CREATE TABLE AccountingLedgerEntry (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    account VARCHAR(255) NOT NULL,
    debit NUMERIC DEFAULT 0,
    credit NUMERIC DEFAULT 0,
    party VARCHAR(255),
    note TEXT,
    bankaccount VARCHAR(255),
    reference VARCHAR(255),
    reconciled BOOLEAN DEFAULT FALSE,
    companyid INT NOT NULL DEFAULT 1
);

-- Sample Data
INSERT INTO AccountingLedgerEntry 
(date, account, debit, credit, party, note, bankaccount, reference, reconciled, companyid) VALUES 
('2025-01-02', 'Cash', 10000, 0, 'Investor', 'Capital Contribution', 'MainBank', 'DEP001', TRUE, 1),
('2025-01-05', 'Office Rent', 0, 2000, 'Landlord Ltd.', 'January rent', 'MainBank', 'CHQ101', TRUE, 1),
('2025-01-10', 'Inventory', 0, 3000, 'Supplier A', 'Purchase inventory', 'MainBank', 'CHQ102', FALSE, 1),
('2025-01-15', 'Sales', 0, 8000, 'Customer B', 'Sales Invoice', NULL, NULL, FALSE, 1),
('2025-01-16', 'Cash', 8000, 0, 'Customer B', 'Payment received', 'MainBank', 'DEP002', TRUE, 1),
('2025-01-20', 'Utilities Expense', 0, 500, 'Power Co', 'Electricity bill', 'MainBank', 'CHQ103', TRUE, 1),
('2025-01-25', 'Bank Loan', 0, 7000, 'BigBank', 'Loan received', 'MainBank', 'DEP003', TRUE, 1),
('2025-01-26', 'Cash', 7000, 0, 'BigBank', 'Loan deposit', 'MainBank', 'DEP003', TRUE, 1),
('2025-01-28', 'Bank Charges', 0, 500, 'BigBank', 'Monthly service charge', 'MainBank', 'CHQ104', FALSE, 1);
