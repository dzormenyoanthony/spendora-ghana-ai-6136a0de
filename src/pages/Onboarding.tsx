import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";

type Step = 1 | 2 | 3 | 4 | 5;

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);

  // Form data
  const [fullName, setFullName] = useState("");
  const [incomeType, setIncomeType] = useState<"salary" | "business" | "freelance" | "other">("salary");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [primaryGoal, setPrimaryGoal] = useState<"rent" | "emergency" | "education" | "business" | "other">("emergency");
  const [accountType, setAccountType] = useState<"momo" | "bank" | "none">("none");
  const [aiMessage, setAiMessage] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Generate budget using AI
      const { data: budgetData, error: functionError } = await supabase.functions.invoke(
        "generate-budget",
        {
          body: {
            monthlyIncome: parseFloat(monthlyIncome),
            incomeType,
            primaryGoal,
          },
        }
      );

      if (functionError) throw functionError;

      // Save user finances
      const { error: financeError } = await supabase
        .from("user_finances")
        .insert({
          user_id: user.id,
          income_type: incomeType,
          monthly_income: parseFloat(monthlyIncome),
          primary_goal: primaryGoal,
          account_linked: accountType !== "none",
          account_type: accountType,
          onboarding_completed: true,
        });

      if (financeError) throw financeError;

      // Save budget
      const { error: budgetError } = await supabase
        .from("budgets")
        .insert({
          user_id: user.id,
          needs_budget: budgetData.needsBudget,
          wants_budget: budgetData.wantsBudget,
          savings_budget: budgetData.savingsBudget,
          ai_message: budgetData.aiMessage,
        });

      if (budgetError) throw budgetError;

      setAiMessage(budgetData.aiMessage);
      setStep(5);
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to complete onboarding",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold gradient-text">Welcome to Spendora! 👋</h2>
              <p className="text-muted-foreground">Let's get to know you better</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">What's your name?</Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-2"
                />
              </div>
              <Button
                onClick={() => setStep(2)}
                disabled={!fullName.trim()}
                className="w-full gradient-primary"
                size="lg"
              >
                Continue
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold gradient-text">Tell us about your income</h2>
              <p className="text-muted-foreground">This helps us create a personalized budget</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Income Type</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {[
                    { value: "salary", label: "Salary" },
                    { value: "business", label: "Business" },
                    { value: "freelance", label: "Freelance" },
                    { value: "other", label: "Other" },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={incomeType === option.value ? "default" : "outline"}
                      onClick={() => setIncomeType(option.value as any)}
                      className={incomeType === option.value ? "gradient-primary" : ""}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="monthlyIncome">Average Monthly Income (GH₵)</Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  placeholder="e.g., 2000"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!monthlyIncome || parseFloat(monthlyIncome) <= 0}
                  className="flex-1 gradient-primary"
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold gradient-text">What's your main goal? 🎯</h2>
              <p className="text-muted-foreground">We'll help you prioritize your savings</p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "rent", label: "Pay Rent", emoji: "🏠" },
                  { value: "emergency", label: "Emergency Fund", emoji: "🛡️" },
                  { value: "education", label: "Education", emoji: "📚" },
                  { value: "business", label: "Start Business", emoji: "💼" },
                  { value: "other", label: "Other Goal", emoji: "✨" },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={primaryGoal === option.value ? "default" : "outline"}
                    onClick={() => setPrimaryGoal(option.value as any)}
                    className={`h-auto py-4 flex flex-col gap-2 ${
                      primaryGoal === option.value ? "gradient-primary" : ""
                    }`}
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    <span className="text-sm">{option.label}</span>
                  </Button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(4)} className="flex-1 gradient-primary">
                  Continue
                </Button>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold gradient-text">Link your account? 🔗</h2>
              <p className="text-muted-foreground">Auto-track your transactions (optional)</p>
            </div>
            <div className="space-y-4">
              <div className="grid gap-3">
                {[
                  { value: "momo", label: "Mobile Money", desc: "MTN, Vodafone, AirtelTigo" },
                  { value: "bank", label: "Bank Account", desc: "Link your bank" },
                  { value: "none", label: "Skip for now", desc: "Manual tracking only" },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={accountType === option.value ? "default" : "outline"}
                    onClick={() => setAccountType(option.value as any)}
                    className={`h-auto p-4 flex flex-col items-start gap-1 ${
                      accountType === option.value ? "gradient-primary" : ""
                    }`}
                  >
                    <span className="font-semibold">{option.label}</span>
                    <span className="text-xs opacity-80">{option.desc}</span>
                  </Button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setStep(3)} variant="outline" className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 gradient-primary"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating your budget...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Budget
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 animate-fade-in text-center">
            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-primary rounded-full flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold gradient-text">You're all set! 🎉</h2>
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6 text-left space-y-2">
                <p className="text-sm text-muted-foreground">FinBuddy says:</p>
                <p className="text-base leading-relaxed">{aiMessage}</p>
              </div>
            </div>
            <Button
              onClick={() => navigate("/dashboard")}
              className="w-full gradient-primary"
              size="lg"
            >
              Go to Dashboard
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card/80 backdrop-blur-lg border border-border rounded-2xl p-8 shadow-2xl">
          {/* Progress indicator */}
          {step < 5 && (
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className={`h-2 flex-1 mx-1 rounded-full transition-all ${
                      s <= step ? "bg-gradient-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Step {step} of 4
              </p>
            </div>
          )}

          {renderStep()}
        </div>
      </div>
    </div>
  );
}
