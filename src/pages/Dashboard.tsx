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
  CreditCard, 
  TrendingUp, 
  User as UserIcon,
  LogOut,
  Wallet,
  PlusCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ExpenseForm } from "@/components/ExpenseForm";
import { BudgetOverview } from "@/components/BudgetOverview";
import { ExpenseList } from "@/components/ExpenseList";

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
          <TabsList className="grid w-full grid-cols-7 mb-6">
            <TabsTrigger value="home" className="flex flex-col items-center gap-1 py-2">
              <Home className="h-4 w-4" />
              <span className="text-xs">Home</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex flex-col items-center gap-1 py-2">
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex flex-col items-center gap-1 py-2">
              <Receipt className="h-4 w-4" />
              <span className="text-xs">Expenses</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex flex-col items-center gap-1 py-2">
              <Target className="h-4 w-4" />
              <span className="text-xs">Goals</span>
            </TabsTrigger>
            <TabsTrigger value="loans" className="flex flex-col items-center gap-1 py-2">
              <CreditCard className="h-4 w-4" />
              <span className="text-xs">Loans</span>
            </TabsTrigger>
            <TabsTrigger value="invest" className="flex flex-col items-center gap-1 py-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Invest</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex flex-col items-center gap-1 py-2">
              <UserIcon className="h-4 w-4" />
              <span className="text-xs">Profile</span>
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
            <Card>
              <CardHeader>
                <CardTitle>AI Finance Coach</CardTitle>
                <CardDescription>
                  Get instant advice on your finances. Ask me anything in English or Twi!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 flex items-center justify-center text-muted-foreground">
                  <div className="text-center space-y-4">
                    <MessageCircle className="h-16 w-16 mx-auto text-primary" />
                    <p className="text-lg font-medium">AI Chat Coming Soon!</p>
                    <p className="text-sm max-w-md">
                      Your personal finance coach will help you make smart money decisions, 
                      track spending, and reach your goals faster.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <ExpenseList refreshTrigger={refreshTrigger} />
          </TabsContent>

          {/* Other Tabs - Placeholder for now */}
          {["goals", "loans", "invest", "profile"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <Card>
                <CardHeader>
                  <CardTitle className="capitalize">{tab}</CardTitle>
                  <CardDescription>
                    {tab === "goals" && "Set and achieve your financial goals"}
                    {tab === "loans" && "Access responsible borrowing options"}
                    {tab === "invest" && "Grow your wealth with smart investments"}
                    {tab === "profile" && "Manage your account settings"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <p>This feature is coming in the next phase!</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
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
