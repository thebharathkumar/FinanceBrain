import { Card, CardContent } from "@/components/ui/card";
import { Wallet, CreditCard, TrendingUp, Shield, ArrowUp } from "lucide-react";

interface SummaryCardsProps {
  summary?: {
    totalBalance: number;
    monthlySpending: number;
    totalInvestments: number;
    creditScore: number;
  };
}

export default function SummaryCards({ summary }: SummaryCardsProps) {
  if (!summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Balance",
      value: `$${summary.totalBalance.toLocaleString()}`,
      change: "+2.3% from last month",
      changeType: "positive" as const,
      icon: Wallet,
      bgColor: "bg-trust-blue/10",
      iconColor: "text-trust-blue",
      testId: "card-total-balance"
    },
    {
      title: "Monthly Spending",
      value: `$${summary.monthlySpending.toLocaleString()}`,
      change: "+8.1% from last month",
      changeType: "negative" as const,
      icon: CreditCard,
      bgColor: "bg-alert-orange/10",
      iconColor: "text-alert-orange",
      testId: "card-monthly-spending"
    },
    {
      title: "Investments",
      value: `$${summary.totalInvestments.toLocaleString()}`,
      change: "+12.4% YTD",
      changeType: "positive" as const,
      icon: TrendingUp,
      bgColor: "bg-money-green/10",
      iconColor: "text-money-green",
      testId: "card-investments"
    },
    {
      title: "Credit Score",
      value: summary.creditScore.toString(),
      change: "Good Credit",
      changeType: "neutral" as const,
      icon: Shield,
      bgColor: "bg-success/10",
      iconColor: "text-success",
      testId: "card-credit-score"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        
        return (
          <Card key={card.title} className="shadow-sm" data-testid={card.testId}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 text-sm font-medium">{card.title}</h3>
                <div className={`w-10 h-10 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`${card.iconColor} w-5 h-5`} />
                </div>
              </div>
              <p className="text-3xl font-bold text-text mb-2" data-testid={`text-${card.testId}-value`}>
                {card.value}
              </p>
              <p className={`text-sm mt-2 flex items-center ${
                card.changeType === 'positive' ? 'text-success' : 
                card.changeType === 'negative' ? 'text-alert-orange' : 'text-gray-500'
              }`}>
                {card.changeType !== 'neutral' && <ArrowUp className="w-3 h-3 mr-1" />}
                <span>{card.change}</span>
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
