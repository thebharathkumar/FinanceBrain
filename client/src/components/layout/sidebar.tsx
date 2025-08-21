import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  TrendingUp, 
  CreditCard, 
  Calculator, 
  PieChart, 
  Brain, 
  Target,
  Settings,
  User
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: TrendingUp },
  { name: "Transactions", href: "/transactions", icon: CreditCard },
  { name: "Budgets", href: "/budgets", icon: Calculator },
  { name: "Investments", href: "/investments", icon: PieChart },
  { name: "AI Insights", href: "/insights", icon: Brain },
  { name: "Goals", href: "/goals", icon: Target },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white shadow-lg fixed h-full z-20" data-testid="sidebar">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-trust-blue rounded-lg flex items-center justify-center">
            <TrendingUp className="text-white text-sm" />
          </div>
          <h1 className="text-xl font-semibold text-text">FinanceAI</h1>
        </div>
      </div>
      
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href || (location === "/" && item.href === "/dashboard");
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <a
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg font-medium transition-colors",
                  isActive
                    ? "bg-trust-blue text-white"
                    : "text-gray-600 hover:bg-gray-100"
                )}
                data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </a>
            </Link>
          );
        })}
      </nav>
      
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="font-medium text-sm">John Doe</p>
              <p className="text-xs text-gray-500">Premium Plan</p>
            </div>
          </div>
          <button 
            className="w-full text-xs text-gray-600 hover:text-text flex items-center justify-center space-x-1"
            data-testid="button-settings"
          >
            <Settings className="w-3 h-3" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
