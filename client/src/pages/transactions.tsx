import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Download, Camera } from "lucide-react";
import { format } from "date-fns";
import UploadDialog from "@/components/ui/upload-dialog";

const MOCK_USER_ID = "testuser";

const categoryColors: Record<string, string> = {
  "Food & Dining": "bg-orange-100 text-orange-800",
  "Transportation": "bg-green-100 text-green-800", 
  "Shopping": "bg-purple-100 text-purple-800",
  "Income": "bg-blue-100 text-blue-800",
  "Bills & Utilities": "bg-gray-100 text-gray-800",
  "Entertainment": "bg-pink-100 text-pink-800",
};

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["/api/transactions", MOCK_USER_ID, { category: categoryFilter }],
    queryFn: () => api.getTransactions(MOCK_USER_ID, categoryFilter ? { category: categoryFilter } : {}),
  });

  const { data: dashboardData } = useQuery({
    queryKey: ["/api/dashboard", MOCK_USER_ID],
    queryFn: () => api.getDashboard(MOCK_USER_ID),
  });

  const filteredTransactions = transactions.filter((transaction: any) =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (transaction.merchant || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = Array.from(new Set(transactions.map((t: any) => t.category)));

  const formatAmount = (amount: string, isIncome: boolean) => {
    const value = parseFloat(amount);
    const formatted = Math.abs(value).toFixed(2);
    
    if (isIncome) {
      return `+$${formatted}`;
    }
    return `-$${formatted}`;
  };

  const getAccountName = (accountId: string) => {
    const account = dashboardData?.accounts?.find((a: any) => a.id === accountId);
    return account?.name || 'Unknown Account';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading transactions...</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-text mb-2">Transactions</h2>
            <p className="text-gray-600">View and manage all your financial transactions</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              className="bg-money-green text-white hover:bg-green-700 flex items-center space-x-2"
              onClick={() => setUploadDialogOpen(true)}
              data-testid="button-scan-receipt"
            >
              <Camera className="w-4 h-4" />
              <span>Scan Receipt</span>
            </Button>
            <Button variant="outline" data-testid="button-export">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-transactions"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48" data-testid="select-category-filter">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map((category: string) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" data-testid="button-advanced-filters">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>All Transactions ({filteredTransactions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No transactions found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Date</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Description</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Category</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Account</th>
                      <th className="text-right py-3 text-sm font-medium text-gray-600">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredTransactions.map((transaction: any) => (
                      <tr key={transaction.id} className="hover:bg-gray-50" data-testid={`transaction-row-${transaction.id}`}>
                        <td className="py-4 text-sm text-gray-600" data-testid={`text-transaction-date-${transaction.id}`}>
                          {format(new Date(transaction.date), 'MMM d, yyyy')}
                        </td>
                        <td className="py-4">
                          <div>
                            <p className="font-medium text-sm" data-testid={`text-transaction-description-${transaction.id}`}>
                              {transaction.description}
                            </p>
                            {transaction.merchant && (
                              <p className="text-xs text-gray-500" data-testid={`text-transaction-merchant-${transaction.id}`}>
                                {transaction.merchant}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-4">
                          <Badge 
                            variant="secondary"
                            className={categoryColors[transaction.category] || "bg-gray-100 text-gray-800"}
                            data-testid={`badge-transaction-category-${transaction.id}`}
                          >
                            {transaction.category}
                          </Badge>
                        </td>
                        <td className="py-4 text-sm text-gray-600" data-testid={`text-transaction-account-${transaction.id}`}>
                          {getAccountName(transaction.accountId)}
                        </td>
                        <td className="py-4 text-right">
                          <span 
                            className={`font-medium ${transaction.isIncome ? 'text-success' : 'text-alert-orange'}`}
                            data-testid={`text-transaction-amount-${transaction.id}`}
                          >
                            {formatAmount(transaction.amount, transaction.isIncome)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <UploadDialog 
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        userId={MOCK_USER_ID}
      />
    </>
  );
}
