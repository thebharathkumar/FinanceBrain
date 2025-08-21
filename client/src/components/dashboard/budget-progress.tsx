import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface BudgetProgressProps {
  budgets?: Array<{
    id: string;
    category: string;
    amount: string;
    spent?: number;
    remaining?: number;
    percentage?: number;
    status?: 'good' | 'warning' | 'over';
  }>;
}

export default function BudgetProgress({ budgets = [] }: BudgetProgressProps) {
  // Mock data when no budgets are provided
  const mockBudgets = [
    {
      id: "1",
      category: "Food & Dining",
      amount: "600.00",
      spent: 847,
      remaining: -247,
      percentage: 141,
      status: "over" as const
    },
    {
      id: "2", 
      category: "Transportation",
      amount: "700.00",
      spent: 523,
      remaining: 177,
      percentage: 75,
      status: "good" as const
    },
    {
      id: "3",
      category: "Shopping", 
      amount: "500.00",
      spent: 422,
      remaining: 78,
      percentage: 84,
      status: "warning" as const
    },
    {
      id: "4",
      category: "Entertainment",
      amount: "300.00", 
      spent: 127,
      remaining: 173,
      percentage: 42,
      status: "good" as const
    }
  ];

  const displayBudgets = budgets.length > 0 ? budgets : mockBudgets;

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'over':
        return 'bg-alert-orange';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-money-green';
    }
  };

  const getStatusText = (budget: typeof mockBudgets[0]) => {
    if (budget.status === 'over') {
      return `$${Math.abs(budget.remaining)} over budget`;
    }
    return `$${budget.remaining} remaining`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'over':
        return 'text-alert-orange';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-success';
    }
  };

  return (
    <Card className="shadow-sm" data-testid="card-budget-progress">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-text">Budget Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {displayBudgets.map((budget) => (
            <div key={budget.id} data-testid={`budget-${budget.category.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium" data-testid={`text-budget-category-${budget.category.toLowerCase().replace(/\s+/g, '-')}`}>
                  {budget.category}
                </span>
                <span className="text-sm text-gray-500" data-testid={`text-budget-amounts-${budget.category.toLowerCase().replace(/\s+/g, '-')}`}>
                  ${budget.spent} / ${budget.amount}
                </span>
              </div>
              
              <Progress 
                value={Math.min(budget.percentage || 0, 100)} 
                className="mb-2"
                data-testid={`progress-${budget.category.toLowerCase().replace(/\s+/g, '-')}`}
              />
              
              <p className={`text-xs ${getStatusColor(budget.status || 'good')}`} data-testid={`text-budget-status-${budget.category.toLowerCase().replace(/\s+/g, '-')}`}>
                {getStatusText(budget)}
              </p>
            </div>
          ))}
        </div>
        
        <Button 
          variant="outline"
          className="w-full mt-6 hover:bg-gray-50"
          data-testid="button-adjust-budgets"
        >
          Adjust Budgets
        </Button>
      </CardContent>
    </Card>
  );
}
