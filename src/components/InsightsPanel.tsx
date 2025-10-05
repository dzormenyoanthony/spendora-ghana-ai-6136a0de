import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertCircle, Lightbulb } from "lucide-react";

interface Insight {
  type: "success" | "warning" | "tip";
  title: string;
  message: string;
}

export default function InsightsPanel() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateInsights();
  }, []);

  const generateInsights = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get user data
    const { data: budget } = await supabase
      .from("budgets")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const { data: expenses } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id);

    if (!budget || !expenses) {
      setLoading(false);
      return;
    }

    const insights: Insight[] = [];

    // Calculate spending by category
    const spendingByCategory = expenses.reduce((acc: any, exp: any) => {
      acc[exp.category] = (acc[exp.category] || 0) + parseFloat(exp.amount);
      return acc;
    }, {});

    const needsSpent = spendingByCategory.needs || 0;
    const wantsSpent = spendingByCategory.wants || 0;
    const savingsSpent = spendingByCategory.savings || 0;

    // Generate insights
    if (needsSpent > budget.needs_budget) {
      insights.push({
        type: "warning",
        title: "Overspending on Needs",
        message: `You've spent GH₵${needsSpent.toFixed(2)} on needs, which is GH₵${(needsSpent - budget.needs_budget).toFixed(2)} over budget.`,
      });
    } else {
      insights.push({
        type: "success",
        title: "Great Job on Essentials!",
        message: `You're within budget on needs. You have GH₵${(budget.needs_budget - needsSpent).toFixed(2)} remaining.`,
      });
    }

    if (wantsSpent > budget.wants_budget) {
      insights.push({
        type: "warning",
        title: "Watch Your Wants",
        message: `Consider reducing discretionary spending. You're GH₵${(wantsSpent - budget.wants_budget).toFixed(2)} over budget.`,
      });
    }

    if (savingsSpent < budget.savings_budget * 0.5) {
      insights.push({
        type: "tip",
        title: "Boost Your Savings",
        message: `You're saving less than planned. Try to automate your savings to hit your target of GH₵${budget.savings_budget}.`,
      });
    }

    // Add a general tip
    insights.push({
      type: "tip",
      title: "Pro Tip",
      message: "Track every expense, no matter how small. Small purchases add up quickly!",
    });

    setInsights(insights);
    setLoading(false);
  };

  if (loading) return <div>Loading insights...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">Financial Insights</h2>
      {insights.map((insight, index) => (
        <Card
          key={index}
          className={`p-4 border-l-4 ${
            insight.type === "success"
              ? "border-l-green-500 bg-green-50 dark:bg-green-950"
              : insight.type === "warning"
              ? "border-l-orange-500 bg-orange-50 dark:bg-orange-950"
              : "border-l-blue-500 bg-blue-50 dark:bg-blue-950"
          }`}
        >
          <div className="flex items-start gap-3">
            {insight.type === "success" && (
              <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
            )}
            {insight.type === "warning" && (
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
            )}
            {insight.type === "tip" && (
              <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
            )}
            <div>
              <h3 className="font-semibold mb-1">{insight.title}</h3>
              <p className="text-sm text-muted-foreground">{insight.message}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}