import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Home, 
  MessageCircle, 
  Receipt, 
  Target, 
  TrendingUp, 
  LogOut,
  Wallet,
  PlusCircle,
  Bell,
  Lightbulb,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ExpenseForm } from "@/components/ExpenseForm";
import { BudgetOverview } from "@/components/BudgetOverview";
import { ExpenseList } from "@/components/ExpenseList";
import FinBuddyChat from "@/components/FinBuddyChat";
import GoalsTracking from "@/components/GoalsTracking";
import InsightsPanel from "@/components/InsightsPanel";
import NotificationsPanel from "@/components/NotificationsPanel";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }
      
      setUser(session.user);
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Spendora</h1>
              <p className="text-xs text-muted-foreground">Welcome back, {userName}!</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="home" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="home" className="flex flex-col items-center gap-1 py-2">
              <Home className="h-4 w-4" />
              <span className="text-xs">Home</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex flex-col items-center gap-1 py-2">
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">FinBuddy</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex flex-col items-center gap-1 py-2">
              <Receipt className="h-4 w-4" />
              <span className="text-xs">Expenses</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex flex-col items-center gap-1 py-2">
              <Target className="h-4 w-4" />
              <span className="text-xs">Goals</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex flex-col items-center gap-1 py-2">
              <Lightbulb className="h-4 w-4" />
              <span className="text-xs">Insights</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex flex-col items-center gap-1 py-2">
              <Bell className="h-4 w-4" />
              <span className="text-xs">Alerts</span>
            </TabsTrigger>
          </TabsList>

          {/* Home Tab */}
          <TabsContent value="home" className="space-y-6">
            <BudgetOverview key={refreshTrigger} />

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setExpenseDialogOpen(true)}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Expense
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Target className="h-4 w-4 mr-2" />
                    Create Savings Goal
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat with AI Coach
                  </Button>
                </CardContent>
              </Card>

              <ExpenseList refreshTrigger={refreshTrigger} />
            </div>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat">
            <FinBuddyChat />
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Transaction History</h2>
              <Button onClick={() => setExpenseDialogOpen(true)} className="gradient-primary">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </div>
            <ExpenseList refreshTrigger={refreshTrigger} />
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals">
            <GoalsTracking />
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights">
            <InsightsPanel />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <NotificationsPanel />
          </TabsContent>
        </Tabs>
      </div>

      <ExpenseForm 
        open={expenseDialogOpen}
        onOpenChange={setExpenseDialogOpen}
        onExpenseAdded={() => setRefreshTrigger(prev => prev + 1)}
      />
    </div>
  );
};

export default Dashboard;
