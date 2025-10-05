import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

interface BudgetData {
  needs_budget: number;
  wants_budget: number;
  savings_budget: number;
  ai_message: string | null;
}

interface ExpenseData {
  needs: number;
  wants: number;
  savings: number;
}

export const BudgetOverview = () => {
  const [budget, setBudget] = useState<BudgetData | null>(null);
  const [expenses, setExpenses] = useState<ExpenseData>({ needs: 0, wants: 0, savings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBudgetAndExpenses();
  }, []);

  const fetchBudgetAndExpenses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch budget
      const { data: budgetData } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setBudget(budgetData);

      // Fetch this month's expenses
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      
      const { data: expensesData } = await supabase
        .from("expenses")
        .select("category, amount")
        .eq("user_id", user.id)
        .gte("date", startOfMonth.toISOString().split('T')[0]);

      // Calculate totals by category
      const totals = { needs: 0, wants: 0, savings: 0 };
      expensesData?.forEach((expense) => {
        totals[expense.category as keyof ExpenseData] += Number(expense.amount);
      });

      setExpenses(totals);
    } catch (error) {
      console.error("Error fetching budget and expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!budget) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>Complete onboarding to see your budget</p>
        </CardContent>
      </Card>
    );
  }

  const categories = [
    {
      name: "Needs",
      budget: Number(budget.needs_budget),
      spent: expenses.needs,
      color: "bg-success",
    },
    {
      name: "Wants",
      budget: Number(budget.wants_budget),
      spent: expenses.wants,
      color: "bg-primary",
    },
    {
      name: "Savings",
      budget: Number(budget.savings_budget),
      spent: expenses.savings,
      color: "bg-accent",
    },
  ];

  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const percentage = category.budget > 0 ? (category.spent / category.budget) * 100 : 0;
        const remaining = category.budget - category.spent;
        
        return (
          <Card key={category.name}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>{category.name}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  GH₵ {remaining.toFixed(2)} left
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  GH₵ {category.spent.toFixed(2)} of GH₵ {category.budget.toFixed(2)}
                </span>
                <span className={percentage > 100 ? "text-destructive" : "text-muted-foreground"}>
                  {percentage.toFixed(0)}%
                </span>
              </div>
              <Progress 
                value={Math.min(percentage, 100)} 
                className="h-2"
              />
              {percentage > 90 && (
                <p className="text-xs text-warning">
                  {percentage > 100 ? "Over budget!" : "Almost at your limit"}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
