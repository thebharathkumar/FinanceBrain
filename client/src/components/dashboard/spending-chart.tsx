import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";

interface SpendingChartProps {
  data?: {
    dailySpending: Record<string, number>;
    totalSpending: number;
  };
}

export default function SpendingChart({ data }: SpendingChartProps) {
  const [period, setPeriod] = useState("7");

  if (!data) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Spending Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-gray-500">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform data for chart
  const chartData = Object.entries(data.dailySpending)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, amount]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: amount
    }));

  const periods = [
    { label: "7 Days", value: "7" },
    { label: "30 Days", value: "30" },
    { label: "90 Days", value: "90" }
  ];

  return (
    <Card className="shadow-sm" data-testid="card-spending-chart">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-text">Spending Overview</CardTitle>
          <div className="flex space-x-2">
            {periods.map((p) => (
              <Button
                key={p.value}
                variant={period === p.value ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriod(p.value)}
                className={period === p.value ? "bg-trust-blue text-white" : ""}
                data-testid={`button-period-${p.value}`}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spending']}
                labelStyle={{ color: '#374151' }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="var(--trust-blue)"
                strokeWidth={2}
                dot={{ fill: "var(--trust-blue)", strokeWidth: 2 }}
                activeDot={{ r: 6, stroke: "var(--trust-blue)", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
