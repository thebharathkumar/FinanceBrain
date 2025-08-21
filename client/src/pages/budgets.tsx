import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MOCK_USER_ID = "testuser";

const categories = [
  "Food & Dining",
  "Transportation", 
  "Shopping",
  "Bills & Utilities",
  "Entertainment",
  "Healthcare",
  "Travel",
  "Education"
];

export default function Budgets() {
  const [newBudgetDialogOpen, setNewBudgetDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [newBudget, setNewBudget] = useState({
    category: "",
    amount: "",
    period: "monthly"
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: budgetAnalysis = [], isLoading } = useQuery({
    queryKey: ["/api/budgets", MOCK_USER_ID, "analysis"],
    queryFn: () => api.getBudgetAnalysis(MOCK_USER_ID),
  });

  const { data: spendingTrends } = useQuery({
    queryKey: ["/api/spending/trends", MOCK_USER_ID],
    queryFn: () => api.getSpendingTrends(MOCK_USER_ID, 30),
  });

  const createBudgetMutation = useMutation({
    mutationFn: (budget: any) => {
      // Mock budget creation - in real app would call API
      return Promise.resolve({
        id: Date.now().toString(),
        userId: MOCK_USER_ID,
        ...budget,
        isActive: true,
        createdAt: new Date()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets", MOCK_USER_ID] });
      toast({
        title: "Budget Created",
        description: "Your new budget has been created successfully.",
      });
      setNewBudgetDialogOpen(false);
      setNewBudget({ category: "", amount: "", period: "monthly" });
    },
  });

  const handleCreateBudget = () => {
    if (!newBudget.category || !newBudget.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createBudgetMutation.mutate(newBudget);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'over':
        return <AlertTriangle className="w-4 h-4 text-alert-orange" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-success" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'over':
        return 'text-alert-orange bg-alert-orange/10';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-success bg-success/10';
    }
  };

  const totalBudgeted = budgetAnalysis.reduce((sum: number, budget: any) => 
    sum + parseFloat(budget.amount), 0
  );
  
  const totalSpent = budgetAnalysis.reduce((sum: number, budget: any) => 
    sum + (budget.spent || 0), 0
  );
  
  const overBudgetCategories = budgetAnalysis.filter((budget: any) => budget.status === 'over').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading budgets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-text mb-2">Budget Management</h2>
          <p className="text-gray-600">Track your spending against your budget goals</p>
        </div>
        <Dialog open={newBudgetDialogOpen} onOpenChange={setNewBudgetDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-trust-blue text-white hover:bg-blue-700 flex items-center space-x-2"
              data-testid="button-create-budget"
            >
              <Plus className="w-4 h-4" />
              <span>Create Budget</span>
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="dialog-create-budget">
            <DialogHeader>
              <DialogTitle>Create New Budget</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={newBudget.category} 
                  onValueChange={(value) => setNewBudget(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger data-testid="select-budget-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="amount">Budget Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={newBudget.amount}
                  onChange={(e) => setNewBudget(prev => ({ ...prev, amount: e.target.value }))}
                  data-testid="input-budget-amount"
                />
              </div>
              
              <div>
                <Label htmlFor="period">Period</Label>
                <Select 
                  value={newBudget.period} 
                  onValueChange={(value) => setNewBudget(prev => ({ ...prev, period: value }))}
                >
                  <SelectTrigger data-testid="select-budget-period">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button 
                  onClick={handleCreateBudget}
                  disabled={createBudgetMutation.isPending}
                  className="flex-1 bg-trust-blue hover:bg-blue-700"
                  data-testid="button-save-budget"
                >
                  {createBudgetMutation.isPending ? "Creating..." : "Create Budget"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setNewBudgetDialogOpen(false)}
                  data-testid="button-cancel-budget"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm" data-testid="card-total-budgeted">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">Total Budgeted</h3>
              <div className="w-10 h-10 bg-trust-blue/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-trust-blue w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-text" data-testid="text-total-budgeted">
              ${totalBudgeted.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-2">This month</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm" data-testid="card-total-spent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">Total Spent</h3>
              <div className="w-10 h-10 bg-alert-orange/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="text-alert-orange w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-text" data-testid="text-total-spent">
              ${totalSpent.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {((totalSpent / totalBudgeted) * 100).toFixed(1)}% of budget
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm" data-testid="card-remaining-budget">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">Remaining</h3>
              <div className="w-10 h-10 bg-money-green/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-money-green w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-text" data-testid="text-remaining-budget">
              ${Math.max(0, totalBudgeted - totalSpent).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-2">Available to spend</p>
          </CardContent>
        </Card>
      </div>

      {/* Budget List */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Budget Categories ({budgetAnalysis.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {budgetAnalysis.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No budgets created yet</h3>
              <p className="mb-6">Create your first budget to start tracking your spending</p>
              <Button 
                onClick={() => setNewBudgetDialogOpen(true)}
                className="bg-trust-blue hover:bg-blue-700"
                data-testid="button-create-first-budget"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Budget
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {budgetAnalysis.map((budget: any) => (
                <div 
                  key={budget.id} 
                  className="border border-gray-200 rounded-lg p-6"
                  data-testid={`budget-${budget.category.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(budget.status)}
                      <div>
                        <h3 className="font-semibold text-lg" data-testid={`text-budget-category-${budget.category.toLowerCase().replace(/\s+/g, '-')}`}>
                          {budget.category}
                        </h3>
                        <p className="text-sm text-gray-500">
                          ${budget.spent?.toFixed(2) || '0.00'} of ${parseFloat(budget.amount).toFixed(2)} spent
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        className={getStatusColor(budget.status)}
                        data-testid={`badge-budget-status-${budget.category.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {budget.status === 'over' ? 'Over Budget' : 
                         budget.status === 'warning' ? 'Warning' : 'On Track'}
                      </Badge>
                      <Button variant="ghost" size="sm" data-testid={`button-edit-budget-${budget.category.toLowerCase().replace(/\s+/g, '-')}`}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Progress 
                      value={Math.min(budget.percentage || 0, 100)} 
                      className="h-2"
                      data-testid={`progress-budget-${budget.category.toLowerCase().replace(/\s+/g, '-')}`}
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span data-testid={`text-budget-percentage-${budget.category.toLowerCase().replace(/\s+/g, '-')}`}>
                        {budget.percentage?.toFixed(1) || 0}% used
                      </span>
                      <span data-testid={`text-budget-remaining-${budget.category.toLowerCase().replace(/\s+/g, '-')}`}>
                        ${budget.remaining?.toFixed(2) || '0.00'} remaining
                      </span>
                    </div>
                  </div>
                  
                  {budget.status === 'over' && (
                    <div className="mt-3 p-3 bg-alert-orange/10 rounded-lg border border-alert-orange/20">
                      <p className="text-sm text-alert-orange font-medium">
                        You're ${Math.abs(budget.remaining || 0).toFixed(2)} over budget this month
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Spending Insights */}
      {overBudgetCategories > 0 && (
        <Card className="shadow-sm border-alert-orange/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-alert-orange">
              <AlertTriangle className="w-5 h-5" />
              <span>Budget Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              You have {overBudgetCategories} {overBudgetCategories === 1 ? 'category' : 'categories'} over budget this month.
            </p>
            <div className="space-y-2">
              {budgetAnalysis
                .filter((budget: any) => budget.status === 'over')
                .map((budget: any) => (
                  <div key={budget.id} className="flex items-center justify-between p-3 bg-alert-orange/5 rounded-lg">
                    <span className="font-medium">{budget.category}</span>
                    <span className="text-alert-orange font-semibold">
                      ${Math.abs(budget.remaining || 0).toFixed(2)} over
                    </span>
                  </div>
                ))
              }
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
