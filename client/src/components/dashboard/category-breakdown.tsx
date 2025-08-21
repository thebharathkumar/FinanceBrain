import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, Car, ShoppingBag, Home, Gamepad2 } from "lucide-react";

interface CategoryBreakdownProps {
  data?: {
    categorySpending: Record<string, number>;
    totalSpending: number;
  };
}

const categoryIcons: Record<string, any> = {
  "Food & Dining": Utensils,
  "Transportation": Car,
  "Shopping": ShoppingBag,
  "Bills & Utilities": Home,
  "Entertainment": Gamepad2,
};

const categoryColors: Record<string, string> = {
  "Food & Dining": "bg-trust-blue/10 text-trust-blue",
  "Transportation": "bg-money-green/10 text-money-green",
  "Shopping": "bg-alert-orange/10 text-alert-orange",
  "Bills & Utilities": "bg-success/10 text-success",
  "Entertainment": "bg-purple-100 text-purple-600",
};

export default function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  if (!data) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Top Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const categories = Object.entries(data.categorySpending)
    .map(([category, amount]) => ({
      name: category,
      amount,
      percentage: Math.round((amount / data.totalSpending) * 100),
      transactions: Math.floor(Math.random() * 25) + 5, // Mock transaction count
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return (
    <Card className="shadow-sm" data-testid="card-category-breakdown">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-text">Top Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((category) => {
            const Icon = categoryIcons[category.name] || ShoppingBag;
            const colorClass = categoryColors[category.name] || "bg-gray-100 text-gray-600";
            
            return (
              <div 
                key={category.name} 
                className="flex items-center justify-between"
                data-testid={`category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium" data-testid={`text-category-name-${category.name.toLowerCase().replace(/\s+/g, '-')}`}>
                      {category.name}
                    </p>
                    <p className="text-sm text-gray-500" data-testid={`text-category-transactions-${category.name.toLowerCase().replace(/\s+/g, '-')}`}>
                      {category.transactions} transactions
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold" data-testid={`text-category-amount-${category.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    ${category.amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500" data-testid={`text-category-percentage-${category.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    {category.percentage}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
