import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import SummaryCards from "@/components/dashboard/summary-cards";
import SpendingChart from "@/components/dashboard/spending-chart";
import CategoryBreakdown from "@/components/dashboard/category-breakdown";
import AiInsights from "@/components/dashboard/ai-insights";
import BudgetProgress from "@/components/dashboard/budget-progress";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import GoalsInvestments from "@/components/dashboard/goals-investments";
import { Button } from "@/components/ui/button";
import { Plus, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock user ID - in a real app this would come from auth context
const MOCK_USER_ID = "testuser";

export default function Dashboard() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard", MOCK_USER_ID],
    queryFn: () => api.getDashboard(MOCK_USER_ID),
  });

  const { data: spendingTrends } = useQuery({
    queryKey: ["/api/spending/trends", MOCK_USER_ID],
    queryFn: () => api.getSpendingTrends(MOCK_USER_ID, 7),
  });

  const { data: budgetAnalysis } = useQuery({
    queryKey: ["/api/budgets", MOCK_USER_ID, "analysis"],
    queryFn: () => api.getBudgetAnalysis(MOCK_USER_ID),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-text mb-2">Financial Overview</h2>
            <p className="text-gray-600">Welcome back! Here's your financial summary for today.</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              className="bg-trust-blue text-white hover:bg-blue-700 flex items-center space-x-2"
              data-testid="button-connect-account"
            >
              <Plus className="w-4 h-4" />
              <span>Connect Account</span>
            </Button>
            
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon"
                className="text-gray-500 hover:text-text"
                data-testid="button-notifications"
              >
                <Bell className="w-5 h-5" />
              </Button>
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 w-3 h-3 p-0 flex items-center justify-center text-xs"
              >
                3
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Summary Cards */}
      <SummaryCards summary={dashboardData?.summary} />
      
      {/* Charts and Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SpendingChart data={spendingTrends} />
        </div>
        <CategoryBreakdown data={spendingTrends} />
      </div>
      
      {/* AI Insights and Budget Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AiInsights insights={dashboardData?.insights} userId={MOCK_USER_ID} />
        <BudgetProgress budgets={budgetAnalysis} />
      </div>
      
      {/* Recent Transactions */}
      <RecentTransactions 
        transactions={dashboardData?.transactions} 
        accounts={dashboardData?.accounts}
        userId={MOCK_USER_ID}
      />
      
      {/* Goals and Investments */}
      <GoalsInvestments 
        goals={dashboardData?.goals}
        investments={dashboardData?.investments}
      />
    </div>
  );
}
