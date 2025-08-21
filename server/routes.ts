import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema } from "@shared/schema";
import { categorizeExpense, analyzeReceipt, generateSpendingInsights } from "./services/gemini";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get user dashboard data
  app.get("/api/dashboard/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      const [accounts, transactions, budgets, goals, investments, insights] = await Promise.all([
        storage.getAccountsByUserId(userId),
        storage.getRecentTransactions(userId, 10),
        storage.getBudgetsByUserId(userId),
        storage.getGoalsByUserId(userId),
        storage.getInvestmentsByUserId(userId),
        storage.getAiInsightsByUserId(userId)
      ]);

      // Calculate totals
      const totalBalance = accounts.reduce((sum, account) => 
        sum + parseFloat(account.balance), 0
      );

      const monthlySpending = transactions
        .filter(t => !t.isIncome && new Date(t.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);

      const totalInvestments = investments.reduce((sum, inv) => 
        sum + parseFloat(inv.currentPrice), 0
      );

      res.json({
        accounts,
        transactions,
        budgets,
        goals,
        investments,
        insights: insights.filter(i => !i.isRead).slice(0, 3),
        summary: {
          totalBalance,
          monthlySpending,
          totalInvestments,
          creditScore: 742 // Mock credit score
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Get transactions with filters
  app.get("/api/transactions/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { category, accountId, startDate, endDate } = req.query;
      
      let transactions = await storage.getTransactionsByUserId(userId);
      
      if (category) {
        transactions = transactions.filter(t => t.category === category);
      }
      
      if (accountId) {
        transactions = transactions.filter(t => t.accountId === accountId);
      }
      
      if (startDate) {
        transactions = transactions.filter(t => 
          new Date(t.date) >= new Date(startDate as string)
        );
      }
      
      if (endDate) {
        transactions = transactions.filter(t => 
          new Date(t.date) <= new Date(endDate as string)
        );
      }

      res.json(transactions.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Create transaction with AI categorization
  app.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      
      // Use AI to categorize if not provided
      if (!validatedData.category) {
        const categorization = await categorizeExpense(
          validatedData.description,
          validatedData.merchant || undefined,
          parseFloat(validatedData.amount)
        );
        
        validatedData.category = categorization.category;
        validatedData.subcategory = categorization.subcategory;
        validatedData.aiCategorized = true;
      }
      
      const transaction = await storage.createTransaction(validatedData);
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Failed to create transaction" });
    }
  });

  // Upload and analyze receipt
  app.post("/api/receipts/analyze", async (req, res) => {
    try {
      const { image, userId } = req.body;
      
      if (!image || !userId) {
        return res.status(400).json({ message: "Image and userId are required" });
      }
      
      const analysis = await analyzeReceipt(image);
      
      // Create transaction from receipt analysis
      const userAccounts = await storage.getAccountsByUserId(userId);
      const defaultAccount = userAccounts.find(a => a.type === 'checking') || userAccounts[0];
      
      if (defaultAccount) {
        const transaction = await storage.createTransaction({
          accountId: defaultAccount.id,
          amount: `-${analysis.amount}`,
          description: `${analysis.merchant} - Receipt Upload`,
          merchant: analysis.merchant,
          category: analysis.category,
          subcategory: analysis.subcategory,
          date: new Date(analysis.date),
          isIncome: false,
          aiCategorized: true,
          metadata: { receiptAnalysis: analysis }
        });
        
        res.json({ analysis, transaction });
      } else {
        res.json({ analysis });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to analyze receipt" });
    }
  });

  // Get budget vs spending analysis
  app.get("/api/budgets/:userId/analysis", async (req, res) => {
    try {
      const { userId } = req.params;
      
      const [budgets, transactions] = await Promise.all([
        storage.getBudgetsByUserId(userId),
        storage.getTransactionsByUserId(userId)
      ]);
      
      const currentMonth = new Date();
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      
      const monthlyTransactions = transactions.filter(t => 
        new Date(t.date) >= monthStart && !t.isIncome
      );
      
      const budgetAnalysis = budgets.map(budget => {
        const spent = monthlyTransactions
          .filter(t => t.category === budget.category)
          .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);
        
        const budgetAmount = parseFloat(budget.amount);
        const percentage = (spent / budgetAmount) * 100;
        
        return {
          ...budget,
          spent,
          remaining: Math.max(0, budgetAmount - spent),
          percentage: Math.min(100, percentage),
          status: percentage > 100 ? 'over' : percentage > 80 ? 'warning' : 'good'
        };
      });
      
      res.json(budgetAnalysis);
    } catch (error) {
      res.status(500).json({ message: "Failed to analyze budgets" });
    }
  });

  // Generate AI insights
  app.post("/api/insights/generate/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      const [transactions, budgets, user] = await Promise.all([
        storage.getTransactionsByUserId(userId),
        storage.getBudgetsByUserId(userId),
        storage.getUser(userId)
      ]);
      
      const insights = await generateSpendingInsights(transactions, budgets, user);
      
      // Save insights to storage
      for (const insight of insights) {
        await storage.createAiInsight({
          userId,
          type: insight.type,
          title: insight.title,
          content: insight.content,
          priority: insight.priority,
          isRead: false,
          metadata: insight.metadata
        });
      }
      
      res.json(insights);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate insights" });
    }
  });

  // Get spending trends data for charts
  app.get("/api/spending/trends/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { days = "30" } = req.query;
      
      const transactions = await storage.getTransactionsByUserId(userId);
      const daysCount = parseInt(days as string);
      const cutoffDate = new Date(Date.now() - daysCount * 24 * 60 * 60 * 1000);
      
      const recentTransactions = transactions.filter(t => 
        new Date(t.date) >= cutoffDate && !t.isIncome
      );
      
      // Group by day
      const dailySpending = recentTransactions.reduce((acc, t) => {
        const date = new Date(t.date).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + Math.abs(parseFloat(t.amount));
        return acc;
      }, {} as Record<string, number>);
      
      // Group by category
      const categorySpending = recentTransactions.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(parseFloat(t.amount));
        return acc;
      }, {} as Record<string, number>);
      
      res.json({
        dailySpending,
        categorySpending,
        totalSpending: Object.values(dailySpending).reduce((sum, amount) => sum + amount, 0)
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch spending trends" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
