import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { monthlyIncome, incomeType, primaryGoal } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Calculate 50/30/20 budget
    const needsBudget = monthlyIncome * 0.5;
    const wantsBudget = monthlyIncome * 0.3;
    const savingsBudget = monthlyIncome * 0.2;

    const systemPrompt = `You are FinBuddy, a friendly AI finance coach for Ghanaians. Generate a warm, encouraging welcome message for a new user based on their financial profile. Keep it conversational, personal, and under 100 words. Focus on their goal and give them confidence about their financial journey.`;

    const userPrompt = `New user profile:
- Monthly Income: GH₵${monthlyIncome.toLocaleString()}
- Income Type: ${incomeType}
- Primary Goal: ${primaryGoal}
- Budget Plan: 50% Needs (GH₵${needsBudget.toFixed(2)}), 30% Wants (GH₵${wantsBudget.toFixed(2)}), 20% Savings (GH₵${savingsBudget.toFixed(2)})

Generate a friendly welcome message.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    const aiMessage = aiResponse.choices[0]?.message?.content || "Welcome! I've created your first budget. Let's start your financial journey together! 🎯";

    return new Response(
      JSON.stringify({
        needsBudget,
        wantsBudget,
        savingsBudget,
        aiMessage,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-budget function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
