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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Target, Home, Plane, GraduationCap, Car, Heart, Gift, Edit, Trash2, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MOCK_USER_ID = "testuser";

const goalCategories = [
  { value: "savings", label: "Savings", icon: Target },
  { value: "house", label: "House", icon: Home },
  { value: "travel", label: "Travel", icon: Plane },
  { value: "education", label: "Education", icon: GraduationCap },
  { value: "car", label: "Car", icon: Car },
  { value: "emergency", label: "Emergency Fund", icon: Heart },
  { value: "gift", label: "Gift/Other", icon: Gift },
];

const goalIcons: Record<string, any> = {
  savings: Target,
  house: Home,
  travel: Plane,
  education: GraduationCap,
  car: Car,
  emergency: Heart,
  gift: Gift,
};

export default function Goals() {
  const [newGoalDialogOpen, setNewGoalDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "0",
    targetDate: "",
    category: "",
    description: ""
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard", MOCK_USER_ID],
    queryFn: () => api.getDashboard(MOCK_USER_ID),
  });

  const goals = dashboardData?.goals || [];

  const createGoalMutation = useMutation({
    mutationFn: (goal: any) => {
      // Mock goal creation - in real app would call API
      return Promise.resolve({
        id: Date.now().toString(),
        userId: MOCK_USER_ID,
        ...goal,
        isActive: true,
        createdAt: new Date()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard", MOCK_USER_ID] });
      toast({
        title: "Goal Created",
        description: "Your new financial goal has been created successfully.",
      });
      setNewGoalDialogOpen(false);
      resetNewGoal();
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: (goal: any) => {
      // Mock goal update - in real app would call API
      return Promise.resolve(goal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard", MOCK_USER_ID] });
      toast({
        title: "Goal Updated",
        description: "Your goal has been updated successfully.",
      });
      setEditingGoal(null);
    },
  });

  const resetNewGoal = () => {
    setNewGoal({
      name: "",
      targetAmount: "",
      currentAmount: "0", 
      targetDate: "",
      category: "",
      description: ""
    });
  };

  const handleCreateGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createGoalMutation.mutate(newGoal);
  };

  const handleUpdateProgress = (goalId: string, amount: string) => {
    const goal = goals.find((g: any) => g.id === goalId);
    if (goal) {
      updateGoalMutation.mutate({
        ...goal,
        currentAmount: amount
      });
    }
  };

  const calculateProgress = (current: string, target: string) => {
    const currentAmount = parseFloat(current || '0');
    const targetAmount = parseFloat(target || '1');
    return Math.min((currentAmount / targetAmount) * 100, 100);
  };

  const getTimeRemaining = (targetDate?: string) => {
    if (!targetDate) return "No deadline";
    
    const target = new Date(targetDate);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day left";
    if (diffDays < 30) return `${diffDays} days left`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months left`;
    return `${Math.ceil(diffDays / 365)} years left`;
  };

  const getGoalIcon = (category: string) => {
    return goalIcons[category] || Target;
  };

  const totalGoalAmount = goals.reduce((sum: number, goal: any) => sum + parseFloat(goal.targetAmount || '0'), 0);
  const totalSaved = goals.reduce((sum: number, goal: any) => sum + parseFloat(goal.currentAmount || '0'), 0);
  const completedGoals = goals.filter((goal: any) => 
    calculateProgress(goal.currentAmount, goal.targetAmount) >= 100
  ).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading financial goals...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-text mb-2">Financial Goals</h2>
          <p className="text-gray-600">Track your progress toward important financial milestones</p>
        </div>
        <Dialog open={newGoalDialogOpen} onOpenChange={setNewGoalDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-trust-blue text-white hover:bg-blue-700 flex items-center space-x-2"
              data-testid="button-create-goal"
            >
              <Plus className="w-4 h-4" />
              <span>Create Goal</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" data-testid="dialog-create-goal">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <Label htmlFor="goal-name">Goal Name</Label>
                <Input
                  id="goal-name"
                  placeholder="e.g., House Down Payment"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, name: e.target.value }))}
                  data-testid="input-goal-name"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={newGoal.category} 
                  onValueChange={(value) => setNewGoal(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger data-testid="select-goal-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {goalCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="target-amount">Target Amount</Label>
                <Input
                  id="target-amount"
                  type="number"
                  placeholder="0.00"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, targetAmount: e.target.value }))}
                  data-testid="input-goal-target-amount"
                />
              </div>
              
              <div>
                <Label htmlFor="current-amount">Current Amount (Optional)</Label>
                <Input
                  id="current-amount"
                  type="number"
                  placeholder="0.00"
                  value={newGoal.currentAmount}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, currentAmount: e.target.value }))}
                  data-testid="input-goal-current-amount"
                />
              </div>
              
              <div>
                <Label htmlFor="target-date">Target Date (Optional)</Label>
                <Input
                  id="target-date"
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, targetDate: e.target.value }))}
                  data-testid="input-goal-target-date"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button 
                  onClick={handleCreateGoal}
                  disabled={createGoalMutation.isPending}
                  className="flex-1 bg-trust-blue hover:bg-blue-700"
                  data-testid="button-save-goal"
                >
                  {createGoalMutation.isPending ? "Creating..." : "Create Goal"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setNewGoalDialogOpen(false)}
                  data-testid="button-cancel-goal"
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
        <Card className="shadow-sm" data-testid="card-total-goals">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">Total Goals</h3>
              <div className="w-10 h-10 bg-trust-blue/10 rounded-lg flex items-center justify-center">
                <Target className="text-trust-blue w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-text" data-testid="text-total-goals">
              {goals.length}
            </p>
            <p className="text-sm text-gray-500 mt-2">{completedGoals} completed</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm" data-testid="card-total-target">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">Total Target</h3>
              <div className="w-10 h-10 bg-money-green/10 rounded-lg flex items-center justify-center">
                <Target className="text-money-green w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-text" data-testid="text-total-target">
              ${totalGoalAmount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-2">Across all goals</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm" data-testid="card-total-saved">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">Total Saved</h3>
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <Target className="text-success w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-text" data-testid="text-total-saved">
              ${totalSaved.toLocaleString()}
            </p>
            <p className="text-sm text-success mt-2">
              {totalGoalAmount > 0 ? `${((totalSaved / totalGoalAmount) * 100).toFixed(1)}%` : '0%'} of target
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Your Financial Goals ({goals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No financial goals yet</h3>
              <p className="mb-6">Create your first goal to start tracking your financial milestones</p>
              <Button 
                onClick={() => setNewGoalDialogOpen(true)}
                className="bg-trust-blue hover:bg-blue-700"
                data-testid="button-create-first-goal"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Goal
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {goals.map((goal: any) => {
                const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
                const remaining = parseFloat(goal.targetAmount) - parseFloat(goal.currentAmount || '0');
                const Icon = getGoalIcon(goal.category);
                const isCompleted = progress >= 100;
                const timeRemaining = getTimeRemaining(goal.targetDate);
                
                return (
                  <div 
                    key={goal.id} 
                    className={`border rounded-lg p-6 ${isCompleted ? 'bg-success/5 border-success/20' : 'border-gray-200'}`}
                    data-testid={`goal-${goal.id}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          isCompleted ? 'bg-success/20' : 'bg-trust-blue/10'
                        }`}>
                          <Icon className={`w-6 h-6 ${isCompleted ? 'text-success' : 'text-trust-blue'}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg" data-testid={`text-goal-name-${goal.id}`}>
                            {goal.name}
                          </h3>
                          <div className="flex items-center space-x-3 mt-1">
                            <p className="text-sm text-gray-500">
                              Target: ${parseFloat(goal.targetAmount).toLocaleString()}
                            </p>
                            {goal.targetDate && (
                              <div className="flex items-center space-x-1 text-sm text-gray-500">
                                <Calendar className="w-3 h-3" />
                                <span>{timeRemaining}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isCompleted ? (
                          <Badge className="bg-success text-white" data-testid={`badge-goal-completed-${goal.id}`}>
                            Completed!
                          </Badge>
                        ) : (
                          <Badge variant="outline" data-testid={`badge-goal-progress-${goal.id}`}>
                            {progress.toFixed(0)}% Complete
                          </Badge>
                        )}
                        <Button variant="ghost" size="sm" data-testid={`button-edit-goal-${goal.id}`}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span data-testid={`text-goal-saved-${goal.id}`}>
                          ${parseFloat(goal.currentAmount || '0').toLocaleString()} saved
                        </span>
                        <span data-testid={`text-goal-remaining-${goal.id}`}>
                          {isCompleted ? 'Goal achieved!' : `$${Math.max(0, remaining).toLocaleString()} remaining`}
                        </span>
                      </div>
                      
                      <Progress 
                        value={progress} 
                        className="h-3"
                        data-testid={`progress-goal-${goal.id}`}
                      />
                      
                      {!isCompleted && (
                        <div className="flex items-center space-x-3 pt-2">
                          <div className="flex-1">
                            <Input
                              type="number"
                              placeholder="Add amount"
                              className="text-sm"
                              data-testid={`input-add-amount-${goal.id}`}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  const input = e.target as HTMLInputElement;
                                  const newTotal = parseFloat(goal.currentAmount || '0') + parseFloat(input.value || '0');
                                  handleUpdateProgress(goal.id, newTotal.toString());
                                  input.value = '';
                                }
                              }}
                            />
                          </div>
                          <Button 
                            size="sm"
                            className="bg-money-green hover:bg-green-700 text-white"
                            data-testid={`button-add-amount-${goal.id}`}
                            onClick={(e) => {
                              const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                              if (input && input.value) {
                                const newTotal = parseFloat(goal.currentAmount || '0') + parseFloat(input.value || '0');
                                handleUpdateProgress(goal.id, newTotal.toString());
                                input.value = '';
                              }
                            }}
                          >
                            Add
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {isCompleted && (
                      <div className="mt-4 p-3 bg-success/10 rounded-lg border border-success/20">
                        <p className="text-sm text-success font-medium">
                          🎉 Congratulations! You've reached your goal of ${parseFloat(goal.targetAmount).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Goal Tips */}
      <Card className="shadow-sm bg-gradient-to-r from-trust-blue/10 to-money-green/10">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-trust-blue/20 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-trust-blue" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-text mb-1">Smart Goal Tips</h3>
              <p className="text-gray-600">
                Set specific, measurable, achievable, relevant, and time-bound (SMART) goals. 
                Break large goals into smaller milestones and automate savings when possible.
              </p>
            </div>
            <Button 
              variant="outline"
              className="bg-white/50 hover:bg-white/80"
              data-testid="button-goal-tips"
            >
              Learn More
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
