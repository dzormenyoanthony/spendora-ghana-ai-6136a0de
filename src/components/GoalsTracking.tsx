import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Plus, Target, Trash2, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Goal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  category: string;
}

export default function GoalsTracking() {
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    target_amount: "",
    deadline: "",
    category: "savings",
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("savings_goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading goals:", error);
      return;
    }

    setGoals(data || []);
    setLoading(false);
  };

  const addGoal = async () => {
    if (!formData.title || !formData.target_amount) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("savings_goals").insert({
      user_id: user.id,
      title: formData.title,
      target_amount: parseFloat(formData.target_amount),
      deadline: formData.deadline || null,
      category: formData.category,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create goal",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Goal created successfully!",
    });

    setFormData({ title: "", target_amount: "", deadline: "", category: "savings" });
    setDialogOpen(false);
    loadGoals();
  };

  const deleteGoal = async (id: string) => {
    const { error } = await supabase.from("savings_goals").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Goal deleted",
    });
    loadGoals();
  };

  const updateProgress = async (id: string, amount: number) => {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;

    const newAmount = goal.current_amount + amount;
    const { error } = await supabase
      .from("savings_goals")
      .update({ current_amount: newAmount })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      });
      return;
    }

    loadGoals();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Savings Goals</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Goal Title</Label>
                <Input
                  placeholder="e.g., Emergency Fund"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Target Amount (GH₵)</Label>
                <Input
                  type="number"
                  placeholder="5000"
                  value={formData.target_amount}
                  onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                />
              </div>
              <div>
                <Label>Deadline (Optional)</Label>
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
              <Button onClick={addGoal} className="w-full gradient-primary">
                Create Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {goals.length === 0 ? (
        <Card className="p-12 text-center">
          <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Goals Yet</h3>
          <p className="text-muted-foreground mb-4">
            Start by creating your first savings goal
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {goals.map((goal) => {
            const progress = (goal.current_amount / goal.target_amount) * 100;
            return (
              <Card key={goal.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{goal.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      GH₵{goal.current_amount.toFixed(2)} of GH₵{goal.target_amount.toFixed(2)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteGoal(goal.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
                <Progress value={progress} className="mb-4" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span>{progress.toFixed(1)}% Complete</span>
                  </div>
                  {goal.deadline && (
                    <span className="text-sm text-muted-foreground">
                      Due: {new Date(goal.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateProgress(goal.id, 100)}
                  >
                    +GH₵100
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateProgress(goal.id, 500)}
                  >
                    +GH₵500
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}