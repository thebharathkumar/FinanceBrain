import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Home, Plane, Plus, ExternalLink, TrendingUp } from "lucide-react";

interface Goal {
  id: string;
  name: string;
  targetAmount: string;
  currentAmount: string;
  category: string;
}

interface Investment {
  id: string;
  name: string;
  symbol: string;
  currentPrice: string;
  purchasePrice: string;
  type: string;
}

interface GoalsInvestmentsProps {
  goals?: Goal[];
  investments?: Investment[];
}

export default function GoalsInvestments({ goals = [], investments = [] }: GoalsInvestmentsProps) {
  const calculateProgress = (current: string, target: string) => {
    const currentAmount = parseFloat(current);
    const targetAmount = parseFloat(target);
    return Math.min((currentAmount / targetAmount) * 100, 100);
  };

  const calculateGains = (current: string, purchase: string) => {
    const currentPrice = parseFloat(current);
    const purchasePrice = parseFloat(purchase);
    const gain = currentPrice - purchasePrice;
    const percentage = ((gain / purchasePrice) * 100);
    return { gain, percentage };
  };

  const getGoalIcon = (category: string) => {
    switch (category) {
      case 'savings':
        return Home;
      case 'travel':
        return Plane;
      default:
        return Plus;
    }
  };

  const totalGains = investments.reduce((total, inv) => {
    const { gain } = calculateGains(inv.currentPrice, inv.purchasePrice);
    return total + gain;
  }, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Financial Goals */}
      <Card className="shadow-sm" data-testid="card-financial-goals">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-text">Financial Goals</CardTitle>
            <Button variant="ghost" className="text-trust-blue hover:text-blue-700" data-testid="button-add-goal">
              <Plus className="w-4 h-4 mr-1" />
              Add Goal
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {goals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No financial goals set yet.
            </div>
          ) : (
            <div className="space-y-6">
              {goals.map((goal) => {
                const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
                const remaining = parseFloat(goal.targetAmount) - parseFloat(goal.currentAmount);
                const Icon = getGoalIcon(goal.category);
                
                return (
                  <div key={goal.id} className="border border-gray-200 rounded-lg p-4" data-testid={`goal-${goal.id}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-trust-blue/10 rounded-lg flex items-center justify-center">
                          <Icon className="text-trust-blue w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium" data-testid={`text-goal-name-${goal.id}`}>{goal.name}</p>
                          <p className="text-sm text-gray-500" data-testid={`text-goal-target-${goal.id}`}>
                            Target: ${parseFloat(goal.targetAmount).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600" data-testid={`text-goal-progress-${goal.id}`}>
                        {progress.toFixed(0)}% Complete
                      </p>
                    </div>
                    
                    <Progress value={progress} className="mb-2" data-testid={`progress-goal-${goal.id}`} />
                    
                    <p className="text-xs text-gray-600" data-testid={`text-goal-details-${goal.id}`}>
                      ${parseFloat(goal.currentAmount).toLocaleString()} saved • ${remaining.toLocaleString()} remaining
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Investment Portfolio */}
      <Card className="shadow-sm" data-testid="card-investment-portfolio">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-text">Investment Portfolio</CardTitle>
            <Button variant="ghost" className="text-trust-blue hover:text-blue-700" data-testid="button-view-portfolio-details">
              <ExternalLink className="w-4 h-4 mr-1" />
              View Details
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {investments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No investments found.
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {investments.map((investment) => {
                  const { gain, percentage } = calculateGains(investment.currentPrice, investment.purchasePrice);
                  const isPositive = gain > 0;
                  const totalValue = parseFloat(investment.currentPrice);
                  const portfolioPercentage = investments.length > 0 
                    ? (totalValue / investments.reduce((sum, inv) => sum + parseFloat(inv.currentPrice), 0)) * 100 
                    : 0;
                  
                  return (
                    <div key={investment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg" data-testid={`investment-${investment.id}`}>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-xs">{investment.symbol}</span>
                        </div>
                        <div>
                          <p className="font-medium" data-testid={`text-investment-name-${investment.id}`}>{investment.name}</p>
                          <p className={`text-sm ${isPositive ? 'text-success' : 'text-alert-orange'}`} data-testid={`text-investment-performance-${investment.id}`}>
                            {isPositive ? '+' : ''}{percentage.toFixed(1)}% YTD
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold" data-testid={`text-investment-value-${investment.id}`}>
                          ${totalValue.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500" data-testid={`text-investment-percentage-${investment.id}`}>
                          {portfolioPercentage.toFixed(0)}% of portfolio
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="p-4 bg-gradient-to-r from-success/10 to-money-green/10 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <p className="text-sm text-success font-medium">Portfolio Performance</p>
                </div>
                <p className="text-2xl font-bold text-text" data-testid="text-total-gains">
                  +${totalGains.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Total gains this year</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
