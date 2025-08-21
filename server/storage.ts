import { 
  type User, type InsertUser,
  type Account, type InsertAccount,
  type Transaction, type InsertTransaction,
  type Budget, type InsertBudget,
  type Goal, type InsertGoal,
  type Investment, type InsertInvestment,
  type AiInsight, type InsertAiInsight
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Account methods
  getAccountsByUserId(userId: string): Promise<Account[]>;
  getAccount(id: string): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccountBalance(id: string, balance: string): Promise<Account | undefined>;

  // Transaction methods
  getTransactionsByAccountId(accountId: string): Promise<Transaction[]>;
  getTransactionsByUserId(userId: string): Promise<Transaction[]>;
  getRecentTransactions(userId: string, limit?: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | undefined>;

  // Budget methods
  getBudgetsByUserId(userId: string): Promise<Budget[]>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: string, updates: Partial<Budget>): Promise<Budget | undefined>;

  // Goal methods
  getGoalsByUserId(userId: string): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: string, updates: Partial<Goal>): Promise<Goal | undefined>;

  // Investment methods
  getInvestmentsByUserId(userId: string): Promise<Investment[]>;
  createInvestment(investment: InsertInvestment): Promise<Investment>;
  updateInvestment(id: string, updates: Partial<Investment>): Promise<Investment | undefined>;

  // AI Insights methods
  getAiInsightsByUserId(userId: string): Promise<AiInsight[]>;
  createAiInsight(insight: InsertAiInsight): Promise<AiInsight>;
  markInsightAsRead(id: string): Promise<AiInsight | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private accounts: Map<string, Account>;
  private transactions: Map<string, Transaction>;
  private budgets: Map<string, Budget>;
  private goals: Map<string, Goal>;
  private investments: Map<string, Investment>;
  private aiInsights: Map<string, AiInsight>;

  constructor() {
    this.users = new Map();
    this.accounts = new Map();
    this.transactions = new Map();
    this.budgets = new Map();
    this.goals = new Map();
    this.investments = new Map();
    this.aiInsights = new Map();
    
    this.initializeMockData();
  }

  private initializeMockData() {
    // Create a test user with consistent ID
    const userId = "testuser";
    const user: User = {
      id: userId,
      username: "testuser",
      password: "password",
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe",
      createdAt: new Date(),
    };
    this.users.set(userId, user);

    // Create mock accounts
    const checkingAccount: Account = {
      id: randomUUID(),
      userId,
      name: "Chase Checking",
      type: "checking",
      balance: "8247.52",
      institution: "Chase Bank",
      accountNumber: "****1234",
      isActive: true,
      createdAt: new Date(),
    };

    const creditAccount: Account = {
      id: randomUUID(),
      userId,
      name: "Credit Card",
      type: "credit",
      balance: "-1247.30",
      institution: "Chase Bank",
      accountNumber: "****5678",
      isActive: true,
      createdAt: new Date(),
    };

    const savingsAccount: Account = {
      id: randomUUID(),
      userId,
      name: "Savings Account",
      type: "savings",
      balance: "5847.30",
      institution: "Chase Bank",
      accountNumber: "****9012",
      isActive: true,
      createdAt: new Date(),
    };

    this.accounts.set(checkingAccount.id, checkingAccount);
    this.accounts.set(creditAccount.id, creditAccount);
    this.accounts.set(savingsAccount.id, savingsAccount);

    // Create mock transactions
    const mockTransactions = [
      {
        accountId: checkingAccount.id,
        amount: "-4.85",
        description: "Starbucks Coffee",
        merchant: "Starbucks",
        category: "Food & Dining",
        subcategory: "Coffee",
        date: new Date("2023-12-15"),
        isIncome: false,
        aiCategorized: true,
      },
      {
        accountId: creditAccount.id,
        amount: "-42.30",
        description: "Shell Gas Station",
        merchant: "Shell",
        category: "Transportation",
        subcategory: "Gas",
        date: new Date("2023-12-14"),
        isIncome: false,
        aiCategorized: true,
      },
      {
        accountId: checkingAccount.id,
        amount: "3250.00",
        description: "Paycheck Deposit",
        merchant: "Acme Corp",
        category: "Income",
        subcategory: "Salary",
        date: new Date("2023-12-13"),
        isIncome: true,
        aiCategorized: false,
      },
      {
        accountId: creditAccount.id,
        amount: "-89.99",
        description: "Amazon Purchase",
        merchant: "Amazon",
        category: "Shopping",
        subcategory: "Online",
        date: new Date("2023-12-12"),
        isIncome: false,
        aiCategorized: true,
      },
    ];

    mockTransactions.forEach(txn => {
      const transaction: Transaction = {
        id: randomUUID(),
        ...txn,
        metadata: null,
        createdAt: new Date(),
      };
      this.transactions.set(transaction.id, transaction);
    });

    // Create mock budgets
    const mockBudgets = [
      { category: "Food & Dining", amount: "600.00" },
      { category: "Transportation", amount: "700.00" },
      { category: "Shopping", amount: "500.00" },
      { category: "Entertainment", amount: "300.00" },
    ];

    mockBudgets.forEach(budget => {
      const budgetItem: Budget = {
        id: randomUUID(),
        userId,
        ...budget,
        period: "monthly",
        isActive: true,
        createdAt: new Date(),
      };
      this.budgets.set(budgetItem.id, budgetItem);
    });

    // Create mock goals
    const mockGoals = [
      {
        name: "House Down Payment",
        targetAmount: "50000.00",
        currentAmount: "34000.00",
        category: "savings",
        targetDate: new Date("2024-12-31"),
      },
      {
        name: "Vacation Fund",
        targetAmount: "5000.00",
        currentAmount: "2100.00",
        category: "travel",
        targetDate: new Date("2024-06-30"),
      },
    ];

    mockGoals.forEach(goal => {
      const goalItem: Goal = {
        id: randomUUID(),
        userId,
        ...goal,
        isActive: true,
        createdAt: new Date(),
      };
      this.goals.set(goalItem.id, goalItem);
    });

    // Create mock investments
    const mockInvestments = [
      {
        symbol: "401K",
        name: "401(k) Plan",
        quantity: "1.0000",
        currentPrice: "18492.31",
        purchasePrice: "17000.00",
        type: "retirement",
        purchaseDate: new Date("2023-01-01"),
      },
      {
        symbol: "IRA",
        name: "Roth IRA",
        quantity: "1.0000",
        currentPrice: "7250.00",
        purchasePrice: "6500.00",
        type: "retirement",
        purchaseDate: new Date("2023-01-01"),
      },
    ];

    mockInvestments.forEach(investment => {
      const investmentItem: Investment = {
        id: randomUUID(),
        userId,
        accountId: null,
        ...investment,
        createdAt: new Date(),
      };
      this.investments.set(investmentItem.id, investmentItem);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async getAccountsByUserId(userId: string): Promise<Account[]> {
    return Array.from(this.accounts.values()).filter(
      (account) => account.userId === userId
    );
  }

  async getAccount(id: string): Promise<Account | undefined> {
    return this.accounts.get(id);
  }

  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const id = randomUUID();
    const account: Account = { 
      ...insertAccount, 
      id, 
      createdAt: new Date(),
      accountNumber: insertAccount.accountNumber || null,
      isActive: insertAccount.isActive || null
    };
    this.accounts.set(id, account);
    return account;
  }

  async updateAccountBalance(id: string, balance: string): Promise<Account | undefined> {
    const account = this.accounts.get(id);
    if (account) {
      account.balance = balance;
      this.accounts.set(id, account);
    }
    return account;
  }

  async getTransactionsByAccountId(accountId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.accountId === accountId
    );
  }

  async getTransactionsByUserId(userId: string): Promise<Transaction[]> {
    const userAccounts = await this.getAccountsByUserId(userId);
    const accountIds = userAccounts.map(account => account.id);
    
    return Array.from(this.transactions.values()).filter(
      (transaction) => accountIds.includes(transaction.accountId)
    );
  }

  async getRecentTransactions(userId: string, limit: number = 10): Promise<Transaction[]> {
    const transactions = await this.getTransactionsByUserId(userId);
    return transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = { 
      ...insertTransaction, 
      id, 
      createdAt: new Date(),
      metadata: insertTransaction.metadata || {},
      merchant: insertTransaction.merchant || null,
      subcategory: insertTransaction.subcategory || null,
      isIncome: insertTransaction.isIncome || null,
      aiCategorized: insertTransaction.aiCategorized || null
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (transaction) {
      const updated = { ...transaction, ...updates };
      this.transactions.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async getBudgetsByUserId(userId: string): Promise<Budget[]> {
    return Array.from(this.budgets.values()).filter(
      (budget) => budget.userId === userId && budget.isActive
    );
  }

  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const id = randomUUID();
    const budget: Budget = { 
      ...insertBudget, 
      id, 
      createdAt: new Date(),
      isActive: insertBudget.isActive || null
    };
    this.budgets.set(id, budget);
    return budget;
  }

  async updateBudget(id: string, updates: Partial<Budget>): Promise<Budget | undefined> {
    const budget = this.budgets.get(id);
    if (budget) {
      const updated = { ...budget, ...updates };
      this.budgets.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async getGoalsByUserId(userId: string): Promise<Goal[]> {
    return Array.from(this.goals.values()).filter(
      (goal) => goal.userId === userId && goal.isActive
    );
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = randomUUID();
    const goal: Goal = { 
      ...insertGoal, 
      id, 
      createdAt: new Date(),
      isActive: insertGoal.isActive || null,
      currentAmount: insertGoal.currentAmount || null,
      targetDate: insertGoal.targetDate || null
    };
    this.goals.set(id, goal);
    return goal;
  }

  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal | undefined> {
    const goal = this.goals.get(id);
    if (goal) {
      const updated = { ...goal, ...updates };
      this.goals.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async getInvestmentsByUserId(userId: string): Promise<Investment[]> {
    return Array.from(this.investments.values()).filter(
      (investment) => investment.userId === userId
    );
  }

  async createInvestment(insertInvestment: InsertInvestment): Promise<Investment> {
    const id = randomUUID();
    const investment: Investment = { 
      ...insertInvestment, 
      id, 
      createdAt: new Date(),
      accountId: insertInvestment.accountId || null
    };
    this.investments.set(id, investment);
    return investment;
  }

  async updateInvestment(id: string, updates: Partial<Investment>): Promise<Investment | undefined> {
    const investment = this.investments.get(id);
    if (investment) {
      const updated = { ...investment, ...updates };
      this.investments.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async getAiInsightsByUserId(userId: string): Promise<AiInsight[]> {
    return Array.from(this.aiInsights.values()).filter(
      (insight) => insight.userId === userId
    );
  }

  async createAiInsight(insertAiInsight: InsertAiInsight): Promise<AiInsight> {
    const id = randomUUID();
    const insight: AiInsight = { 
      ...insertAiInsight, 
      id, 
      createdAt: new Date(),
      metadata: insertAiInsight.metadata || {},
      isRead: insertAiInsight.isRead || null
    };
    this.aiInsights.set(id, insight);
    return insight;
  }

  async markInsightAsRead(id: string): Promise<AiInsight | undefined> {
    const insight = this.aiInsights.get(id);
    if (insight) {
      insight.isRead = true;
      this.aiInsights.set(id, insight);
    }
    return insight;
  }
}

export const storage = new MemStorage();
