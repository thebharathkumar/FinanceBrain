import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, ExternalLink } from "lucide-react";
import { useState } from "react";
import UploadDialog from "@/components/ui/upload-dialog";
import { format } from "date-fns";

interface Transaction {
  id: string;
  amount: string;
  description: string;
  merchant?: string;
  category: string;
  date: string;
  isIncome: boolean;
}

interface Account {
  id: string;
  name: string;
  type: string;
}

interface RecentTransactionsProps {
  transactions?: Transaction[];
  accounts?: Account[];
  userId: string;
}

const categoryColors: Record<string, string> = {
  "Food & Dining": "bg-orange-100 text-orange-800",
  "Transportation": "bg-green-100 text-green-800", 
  "Shopping": "bg-purple-100 text-purple-800",
  "Income": "bg-blue-100 text-blue-800",
  "Bills & Utilities": "bg-gray-100 text-gray-800",
  "Entertainment": "bg-pink-100 text-pink-800",
};

export default function RecentTransactions({ 
  transactions = [], 
  accounts = [],
  userId 
}: RecentTransactionsProps) {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const getAccountName = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    return account?.name || 'Unknown Account';
  };

  const formatAmount = (amount: string, isIncome: boolean) => {
    const value = parseFloat(amount);
    const formatted = Math.abs(value).toFixed(2);
    
    if (isIncome) {
      return `+$${formatted}`;
    }
    return `-$${formatted}`;
  };

  const getAmountColor = (isIncome: boolean) => {
    return isIncome ? 'text-success' : 'text-alert-orange';
  };

  return (
    <>
      <Card className="shadow-sm" data-testid="card-recent-transactions">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-text">Recent Transactions</CardTitle>
            <div className="flex space-x-3">
              <Button 
                className="bg-money-green text-white hover:bg-green-700 flex items-center space-x-2"
                onClick={() => setUploadDialogOpen(true)}
                data-testid="button-scan-receipt"
              >
                <Camera className="w-4 h-4" />
                <span>Scan Receipt</span>
              </Button>
              
              <Button 
                variant="ghost"
                className="text-trust-blue hover:text-blue-700"
                data-testid="button-view-all-transactions"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                View All
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No recent transactions found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 text-sm font-medium text-gray-600">Description</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-600">Category</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-600">Account</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-600">Date</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-600">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50" data-testid={`transaction-${transaction.id}`}>
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
                      <td className="py-4 text-sm text-gray-600" data-testid={`text-transaction-date-${transaction.id}`}>
                        {format(new Date(transaction.date), 'MMM d, yyyy')}
                      </td>
                      <td className="py-4 text-right">
                        <span 
                          className={`font-medium ${getAmountColor(transaction.isIncome)}`}
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

      <UploadDialog 
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        userId={userId}
      />
    </>
  );
}
