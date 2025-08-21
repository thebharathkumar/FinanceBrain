import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, AlertTriangle, Lightbulb, TrendingUp } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface AiInsightsProps {
  insights?: Array<{
    id: string;
    type: string;
    title: string;
    content: string;
    priority: string;
  }>;
  userId: string;
}

const insightIcons = {
  spending_alert: AlertTriangle,
  savings_opportunity: Lightbulb,
  investment_advice: TrendingUp,
};

const insightColors = {
  spending_alert: "bg-alert-orange/10 border-alert-orange/20",
  savings_opportunity: "bg-money-green/10 border-money-green/20",
  investment_advice: "bg-trust-blue/10 border-trust-blue/20",
};

export default function AiInsights({ insights = [], userId }: AiInsightsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateInsightsMutation = useMutation({
    mutationFn: () => api.generateInsights(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard", userId] });
      toast({
        title: "AI Insights Generated",
        description: "New personalized insights have been created based on your financial data.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate AI insights. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Default insights when none are available
  const defaultInsights = [
    {
      id: "1",
      type: "spending_alert",
      title: "Dining Budget Alert",
      content: "You're spending 23% more on dining this month. Consider setting a $600 limit.",
      priority: "medium"
    },
    {
      id: "2", 
      type: "savings_opportunity",
      title: "Subscription Optimization",
      content: "You could save an additional $340/month by optimizing unused subscriptions.",
      priority: "high"
    }
  ];

  const displayInsights = insights.length > 0 ? insights : defaultInsights;

  return (
    <Card className="bg-gradient-to-br from-trust-blue to-blue-800 text-white shadow-sm" data-testid="card-ai-insights">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Brain className="text-white w-5 h-5" />
          </div>
          <CardTitle className="text-xl font-semibold">AI Financial Insights</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayInsights.slice(0, 2).map((insight) => {
            const Icon = insightIcons[insight.type as keyof typeof insightIcons] || Brain;
            
            return (
              <div key={insight.id} className="bg-white/10 rounded-lg p-4" data-testid={`insight-${insight.id}`}>
                <div className="flex items-start space-x-3">
                  <Icon className="w-4 h-4 mt-1 opacity-90" />
                  <div className="flex-1">
                    <p className="text-sm opacity-90 mb-2" data-testid={`text-insight-title-${insight.id}`}>
                      {insight.title}
                    </p>
                    <p className="font-medium text-sm" data-testid={`text-insight-content-${insight.id}`}>
                      {insight.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex space-x-3 mt-6">
          <Button 
            variant="ghost"
            className="bg-white/20 hover:bg-white/30 text-white border-0"
            data-testid="button-view-all-insights"
          >
            View All Insights
          </Button>
          
          <Button
            variant="ghost"
            className="bg-white/20 hover:bg-white/30 text-white border-0"
            onClick={() => generateInsightsMutation.mutate()}
            disabled={generateInsightsMutation.isPending}
            data-testid="button-generate-insights"
          >
            {generateInsightsMutation.isPending ? "Generating..." : "Refresh Insights"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
