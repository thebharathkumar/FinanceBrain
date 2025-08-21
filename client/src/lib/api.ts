import { apiRequest } from "./queryClient";

export const api = {
  // Dashboard
  getDashboard: (userId: string) => 
    fetch(`/api/dashboard/${userId}`).then(res => res.json()),
  
  // Transactions
  getTransactions: (userId: string, filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters);
    return fetch(`/api/transactions/${userId}?${params}`).then(res => res.json());
  },
  
  createTransaction: (transaction: any) =>
    apiRequest("POST", "/api/transactions", transaction).then(res => res.json()),
  
  // Receipts
  analyzeReceipt: (image: string, userId: string) =>
    apiRequest("POST", "/api/receipts/analyze", { image, userId }).then(res => res.json()),
  
  // Budgets
  getBudgetAnalysis: (userId: string) =>
    fetch(`/api/budgets/${userId}/analysis`).then(res => res.json()),
  
  // Insights
  generateInsights: (userId: string) =>
    apiRequest("POST", `/api/insights/generate/${userId}`, {}).then(res => res.json()),
  
  // Spending trends
  getSpendingTrends: (userId: string, days?: number) => {
    const params = days ? `?days=${days}` : '';
    return fetch(`/api/spending/trends/${userId}${params}`).then(res => res.json());
  }
};
