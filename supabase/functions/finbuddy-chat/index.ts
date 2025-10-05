import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const authHeader = req.headers.get("Authorization");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
    if (!authHeader) throw new Error("No authorization header");

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    // Get user's financial data for context
    const { data: financeData } = await supabase
      .from("user_finances")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const { data: budgetData } = await supabase
      .from("budgets")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const { data: expenses } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(10);

    // Build context for AI
    const context = `
User's Financial Profile:
- Monthly Income: GH₵${financeData?.monthly_income || 0}
- Income Type: ${financeData?.income_type || "N/A"}
- Primary Goal: ${financeData?.primary_goal || "N/A"}
- Budget: Needs (GH₵${budgetData?.needs_budget || 0}), Wants (GH₵${budgetData?.wants_budget || 0}), Savings (GH₵${budgetData?.savings_budget || 0})
- Recent Expenses: ${expenses?.length || 0} transactions

You are FinBuddy, a friendly and knowledgeable AI financial assistant for Ghanaians. 
Help users with budgeting, saving tips, and financial advice tailored to Ghana's economy.
Be conversational, encouraging, and practical. Use GH₵ for currency.
`;

    // Call Lovable AI
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: context },
          { role: "user", content: message }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Save messages to database
    await supabase.from("chat_messages").insert([
      { user_id: user.id, role: "user", content: message },
      { user_id: user.id, role: "assistant", content: aiResponse }
    ]);

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});