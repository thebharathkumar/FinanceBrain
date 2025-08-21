import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Plus, ExternalLink, DollarSign, Target, PieChart } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const MOCK_USER_ID = "testuser";

const COLORS = ['#0066CC', '#00A86B', '#FF6B35', '#28A745', '#6366F1'];

export default function Investments() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard", MOCK_USER_ID],
    queryFn: () => api.getDashboard(MOCK_USER_ID),
  });

  const investments = dashboardData?.investments || [];
  const totalValue = investments.reduce((sum: number, inv: any) => sum + parseFloat(inv.currentPrice), 0);
  
  // Mock performance data for charts
  const performanceData = [
    { month: 'Jan', value: 24500 },
    { month: 'Feb', value: 25200 },
    { month: 'Mar', value: 26800 },
    { month: 'Apr', value: 25900 },
    { month: 'May', value: 27300 },
    { month: 'Jun', value: 28492 }
  ];

  const allocationData = investments.map((inv: any, index: number) => ({
    name: inv.name,
    value: parseFloat(inv.currentPrice),
    color: COLORS[index % COLORS.length]
  }));

  const calculateGains = (current: string, purchase: string) => {
    const currentPrice = parseFloat(current);
    const purchasePrice = parseFloat(purchase);
    const gain = currentPrice - purchasePrice;
    const percentage = ((gain / purchasePrice) * 100);
    return { gain, percentage };
  };

  const totalGains = investments.reduce((total: number, inv: any) => {
    const { gain } = calculateGains(inv.currentPrice, inv.purchasePrice);
    return total + gain;
  }, 0);

  const totalGainPercentage = investments.length > 0 
    ? ((totalGains / investments.reduce((sum: number, inv: any) => sum + parseFloat(inv.purchasePrice), 0)) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading investments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-text mb-2">Investment Portfolio</h2>
          <p className="text-gray-600">Monitor your investments and track performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            className="bg-trust-blue text-white hover:bg-blue-700 flex items-center space-x-2"
            data-testid="button-add-investment"
          >
            <Plus className="w-4 h-4" />
            <span>Add Investment</span>
          </Button>
          <Button variant="outline" data-testid="button-portfolio-analysis">
            <ExternalLink className="w-4 h-4 mr-2" />
            Full Analysis
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-sm" data-testid="card-total-value">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">Total Value</h3>
              <div className="w-10 h-10 bg-trust-blue/10 rounded-lg flex items-center justify-center">
                <DollarSign className="text-trust-blue w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-text" data-testid="text-total-value">
              ${totalValue.toLocaleString()}
            </p>
            <p className="text-sm text-success mt-2 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>+{totalGainPercentage.toFixed(1)}% total return</span>
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm" data-testid="card-total-gains">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">Total Gains</h3>
              <div className="w-10 h-10 bg-money-green/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-money-green w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-text" data-testid="text-total-gains">
              +${totalGains.toLocaleString()}
            </p>
            <p className="text-sm text-success mt-2">Year to date</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm" data-testid="card-best-performer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">Best Performer</h3>
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <Target className="text-success w-5 h-5" />
              </div>
            </div>
            {investments.length > 0 ? (
              <>
                <p className="text-xl font-bold text-text mb-1" data-testid="text-best-performer">
                  {investments[0]?.name || 'N/A'}
                </p>
                <p className="text-sm text-success">
                  +{calculateGains(investments[0]?.currentPrice || '0', investments[0]?.purchasePrice || '0').percentage.toFixed(1)}%
                </p>
              </>
            ) : (
              <p className="text-xl font-bold text-gray-400">No investments</p>
            )}
          </CardContent>
        </Card>
        
        <Card className="shadow-sm" data-testid="card-diversification">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">Diversification</h3>
              <div className="w-10 h-10 bg-alert-orange/10 rounded-lg flex items-center justify-center">
                <PieChart className="text-alert-orange w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-text" data-testid="text-diversification-score">
              {investments.length > 0 ? '8.2' : '0'}/10
            </p>
            <p className="text-sm text-gray-500 mt-2">Diversification score</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <Card className="shadow-sm" data-testid="card-performance-chart">
          <CardHeader>
            <CardTitle>Portfolio Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
                    labelStyle={{ color: '#374151' }}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="var(--trust-blue)"
                    strokeWidth={3}
                    dot={{ fill: "var(--trust-blue)", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "var(--trust-blue)", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Asset Allocation */}
        <Card className="shadow-sm" data-testid="card-asset-allocation">
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            {allocationData.length > 0 ? (
              <div className="h-80 flex items-center">
                <div className="w-1/2">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        dataKey="value"
                      >
                        {allocationData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-3">
                  {allocationData.map((item: any, index: number) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          ${item.value.toLocaleString()} ({((item.value / totalValue) * 100).toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <PieChart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No investments to display</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Investments List */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Investment Holdings ({investments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {investments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No investments found</h3>
              <p className="mb-6">Start building your investment portfolio</p>
              <Button 
                className="bg-trust-blue hover:bg-blue-700"
                data-testid="button-add-first-investment"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Investment
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {investments.map((investment: any) => {
                const { gain, percentage } = calculateGains(investment.currentPrice, investment.purchasePrice);
                const isPositive = gain > 0;
                const portfolioPercentage = (parseFloat(investment.currentPrice) / totalValue) * 100;
                
                return (
                  <div 
                    key={investment.id} 
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow"
                    data-testid={`investment-${investment.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-trust-blue/10 rounded-lg flex items-center justify-center">
                          <span className="font-bold text-trust-blue text-sm">
                            {investment.symbol}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg" data-testid={`text-investment-name-${investment.id}`}>
                            {investment.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {investment.type} • {investment.quantity} shares
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xl font-bold text-text" data-testid={`text-investment-current-value-${investment.id}`}>
                          ${parseFloat(investment.currentPrice).toLocaleString()}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={isPositive ? "default" : "destructive"}
                            className={isPositive ? "bg-success text-white" : ""}
                            data-testid={`badge-investment-performance-${investment.id}`}
                          >
                            {isPositive ? '+' : ''}{percentage.toFixed(1)}%
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {portfolioPercentage.toFixed(1)}% of portfolio
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Purchase Price</p>
                        <p className="font-medium">${parseFloat(investment.purchasePrice).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Current Price</p>
                        <p className="font-medium">${parseFloat(investment.currentPrice).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Total Gain/Loss</p>
                        <p className={`font-medium ${isPositive ? 'text-success' : 'text-alert-orange'}`}>
                          {isPositive ? '+' : ''}${gain.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Summary */}
      {investments.length > 0 && (
        <Card className="shadow-sm bg-gradient-to-r from-success/10 to-money-green/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-text mb-2">Portfolio Summary</h3>
                <p className="text-gray-600">
                  Your portfolio has gained <span className="font-semibold text-success">${totalGains.toLocaleString()}</span> 
                  {' '}({totalGainPercentage.toFixed(1)}%) this year across {investments.length} investments.
                </p>
              </div>
              <div className="text-right">
                <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mb-2">
                  <TrendingUp className="w-8 h-8 text-success" />
                </div>
                <p className="text-sm text-gray-600">Strong Performance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
