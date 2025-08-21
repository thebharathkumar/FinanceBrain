import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Lightbulb, AlertTriangle, TrendingUp, Sparkles, RefreshCw, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MOCK_USER_ID = "testuser";

const insightIcons = {
  spending_alert: AlertTriangle,
  savings_opportunity: Lightbulb,
  investment_advice: TrendingUp,
};

const insightColors = {
  spending_alert: {
    bg: "bg-alert-orange/10",
    border: "border-alert-orange/20",
    text: "text-alert-orange",
    icon: "text-alert-orange"
  },
  savings_opportunity: {
    bg: "bg-money-green/10", 
    border: "border-money-green/20",
    text: "text-money-green",
    icon: "text-money-green"
  },
  investment_advice: {
    bg: "bg-trust-blue/10",
    border: "border-trust-blue/20", 
    text: "text-trust-blue",
    icon: "text-trust-blue"
  },
};

const priorityColors = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800", 
  low: "bg-green-100 text-green-800",
};

export default function Insights() {
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: allInsights = [], isLoading } = useQuery({
    queryKey: ["/api/insights", MOCK_USER_ID],
    queryFn: () => api.getDashboard(MOCK_USER_ID).then(data => data.insights || []),
  });

  const { data: dashboardData } = useQuery({
    queryKey: ["/api/dashboard", MOCK_USER_ID],
    queryFn: () => api.getDashboard(MOCK_USER_ID),
  });

  const generateInsightsMutation = useMutation({
    mutationFn: () => api.generateInsights(MOCK_USER_ID),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/insights", MOCK_USER_ID] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard", MOCK_USER_ID] });
      toast({
        title: "AI Insights Generated",
        description: "New personalized insights have been created based on your latest financial data.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate new insights. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mock insights when none are available
  const mockInsights = [
    {
      id: "1",
      type: "spending_alert",
      title: "Dining Spending Alert",
      content: "Your dining expenses have increased by 23% this month compared to your average. Consider setting a stricter budget or exploring meal prep options to save approximately $240 monthly.",
      priority: "high",
      isRead: false,
      createdAt: new Date().toISOString()
    },
    {
      id: "2",
      type: "savings_opportunity", 
      title: "Subscription Optimization",
      content: "Analysis shows you have 5 recurring subscriptions totaling $87/month. Two haven't been used in 60+ days. Canceling unused subscriptions could save you $1,044 annually.",
      priority: "medium",
      isRead: false,
      createdAt: new Date().toISOString()
    },
    {
      id: "3",
      type: "investment_advice",
      title: "Portfolio Rebalancing Recommendation", 
      content: "Your current allocation is 65% stocks, 35% bonds. Based on your age and risk tolerance, consider shifting to 70% stocks, 30% bonds for potentially higher long-term returns.",
      priority: "low",
      isRead: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "4",
      type: "savings_opportunity",
      title: "Emergency Fund Goal",
      content: "You're doing great! Your emergency fund covers 4.2 months of expenses. Consider increasing it to 6 months ($8,400) for better financial security.",
      priority: "low", 
      isRead: false,
      createdAt: new Date().toISOString()
    },
    {
      id: "5",
      type: "spending_alert",
      title: "Credit Utilization Warning",
      content: "Your credit utilization is at 78% on your main credit card. Paying it down to under 30% could improve your credit score by 15-25 points.",
      priority: "high",
      isRead: false,
      createdAt: new Date().toISOString()
    }
  ];

  const displayInsights = allInsights.length > 0 ? allInsights : mockInsights;

  const filteredInsights = displayInsights.filter((insight: any) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !insight.isRead;
    return insight.type === activeTab;
  });

  const unreadCount = displayInsights.filter((insight: any) => !insight.isRead).length;
  const highPriorityCount = displayInsights.filter((insight: any) => insight.priority === "high").length;

  const markAsRead = (insightId: string) => {
    // In a real app, this would call an API endpoint
    toast({
      title: "Marked as Read",
      description: "Insight has been marked as read.",
    });
  };

  const getInsightIcon = (type: string) => {
    const Icon = insightIcons[type as keyof typeof insightIcons] || Brain;
    return Icon;
  };

  const getInsightColors = (type: string) => {
    return insightColors[type as keyof typeof insightColors] || insightColors.investment_advice;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading AI insights...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-text mb-2">AI Financial Insights</h2>
          <p className="text-gray-600">Personalized recommendations powered by artificial intelligence</p>
        </div>
        <Button 
          onClick={() => generateInsightsMutation.mutate()}
          disabled={generateInsightsMutation.isPending}
          className="bg-trust-blue text-white hover:bg-blue-700 flex items-center space-x-2"
          data-testid="button-generate-insights"
        >
          {generateInsightsMutation.isPending ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>{generateInsightsMutation.isPending ? "Generating..." : "Generate New Insights"}</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm" data-testid="card-total-insights">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">Total Insights</h3>
              <div className="w-10 h-10 bg-trust-blue/10 rounded-lg flex items-center justify-center">
                <Brain className="text-trust-blue w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-text" data-testid="text-total-insights">
              {displayInsights.length}
            </p>
            <p className="text-sm text-gray-500 mt-2">AI-generated recommendations</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm" data-testid="card-unread-insights">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">Unread</h3>
              <div className="w-10 h-10 bg-alert-orange/10 rounded-lg flex items-center justify-center">
                <Eye className="text-alert-orange w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-text" data-testid="text-unread-insights">
              {unreadCount}
            </p>
            <p className="text-sm text-gray-500 mt-2">Need your attention</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm" data-testid="card-high-priority">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">High Priority</h3>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="text-red-600 w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-text" data-testid="text-high-priority">
              {highPriorityCount}
            </p>
            <p className="text-sm text-gray-500 mt-2">Urgent recommendations</p>
          </CardContent>
        </Card>
      </div>

      {/* Insights Tabs */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Your Personalized Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all" data-testid="tab-all-insights">
                All ({displayInsights.length})
              </TabsTrigger>
              <TabsTrigger value="unread" data-testid="tab-unread-insights">
                Unread ({unreadCount})
              </TabsTrigger>
              <TabsTrigger value="spending_alert" data-testid="tab-spending-alerts">
                Spending
              </TabsTrigger>
              <TabsTrigger value="savings_opportunity" data-testid="tab-savings-opportunities">
                Savings
              </TabsTrigger>
              <TabsTrigger value="investment_advice" data-testid="tab-investment-advice">
                Investments
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-6">
              {filteredInsights.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Brain className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No insights available</h3>
                  <p className="mb-6">Generate AI insights to get personalized financial recommendations</p>
                  <Button 
                    onClick={() => generateInsightsMutation.mutate()}
                    className="bg-trust-blue hover:bg-blue-700"
                    data-testid="button-generate-first-insights"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Your First Insights
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredInsights.map((insight: any) => {
                    const Icon = getInsightIcon(insight.type);
                    const colors = getInsightColors(insight.type);
                    
                    return (
                      <div 
                        key={insight.id}
                        className={`border rounded-lg p-6 ${colors.bg} ${colors.border} ${!insight.isRead ? 'ring-2 ring-blue-100' : ''}`}
                        data-testid={`insight-${insight.id}`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-white/50 flex items-center justify-center">
                              <Icon className={`w-4 h-4 ${colors.icon}`} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-text mb-1" data-testid={`text-insight-title-${insight.id}`}>
                                {insight.title}
                              </h3>
                              <div className="flex items-center space-x-3">
                                <Badge 
                                  className={priorityColors[insight.priority as keyof typeof priorityColors]}
                                  data-testid={`badge-insight-priority-${insight.id}`}
                                >
                                  {insight.priority} priority
                                </Badge>
                                {!insight.isRead && (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                    Unread
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => markAsRead(insight.id)}
                            className="text-gray-500 hover:text-text"
                            data-testid={`button-mark-read-${insight.id}`}
                          >
                            {insight.isRead ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                        
                        <p className="text-gray-700 leading-relaxed" data-testid={`text-insight-content-${insight.id}`}>
                          {insight.content}
                        </p>
                        
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/50">
                          <p className="text-sm text-gray-600">
                            {new Date(insight.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="bg-white/50 hover:bg-white/80"
                              data-testid={`button-dismiss-${insight.id}`}
                            >
                              Dismiss
                            </Button>
                            <Button 
                              size="sm"
                              className={`${colors.text === 'text-trust-blue' ? 'bg-trust-blue hover:bg-blue-700' : 
                                         colors.text === 'text-money-green' ? 'bg-money-green hover:bg-green-700' :
                                         'bg-alert-orange hover:bg-orange-700'} text-white`}
                              data-testid={`button-take-action-${insight.id}`}
                            >
                              Take Action
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* AI Tips */}
      <Card className="shadow-sm bg-gradient-to-r from-trust-blue/10 to-money-green/10">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-trust-blue/20 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-trust-blue" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-text mb-1">How AI Insights Work</h3>
              <p className="text-gray-600">
                Our AI analyzes your spending patterns, income, budgets, and financial goals to provide 
                personalized recommendations. Insights are updated weekly based on your latest financial activity.
              </p>
            </div>
            <Button 
              variant="outline"
              className="bg-white/50 hover:bg-white/80"
              data-testid="button-learn-more"
            >
              Learn More
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
