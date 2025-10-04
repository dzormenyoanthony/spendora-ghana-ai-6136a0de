import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, TrendingUp, Shield, Wallet, Target, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: Wallet,
      title: "Smart Tracking",
      description: "Auto-categorize expenses from MoMo & Bank feeds",
      color: "text-primary",
    },
    {
      icon: Target,
      title: "Savings Goals",
      description: "Set targets, automate savings with round-ups",
      color: "text-success",
    },
    {
      icon: TrendingUp,
      title: "AI Insights",
      description: "Forecast balances & get personalized money tips",
      color: "text-accent",
    },
    {
      icon: MessageCircle,
      title: "AI Coach",
      description: "Chat in Twi or English for instant advice",
      color: "text-warning",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 gradient-hero opacity-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(263_70%_50%/0.1),transparent_50%)]" />
        
        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center animate-slide-up">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              AI-Powered Finance for Ghana
            </div>

            {/* Headline */}
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              Your Money,{" "}
              <span className="bg-gradient-to-r from-primary via-primary-light to-accent bg-clip-text text-transparent">
                Smarter & Safer
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mb-8 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
              Track spending, save automatically, borrow responsibly, and invest with confidence. 
              Your AI finance coach, built for Ghanaians.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="group bg-primary hover:bg-primary-dark shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
                onClick={() => navigate("/auth")}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2"
              >
                Watch Demo
              </Button>
            </div>

            {/* Trust Badge */}
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-success" />
              <span>Bank-level security • No hidden fees • Ghana-focused</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Master Your Money
            </h2>
            <p className="text-muted-foreground text-lg">
              Powerful tools designed for your financial success
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isHovered = hoveredFeature === index;
              
              return (
                <div
                  key={index}
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  className="group relative bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg cursor-pointer"
                >
                  <div className={`mb-4 inline-flex p-3 rounded-xl bg-muted ${isHovered ? 'scale-110' : ''} transition-transform duration-300`}>
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold gradient-primary bg-clip-text text-transparent">
                50/30/20
              </div>
              <p className="text-muted-foreground">Smart budgeting rule applied</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold gradient-accent bg-clip-text text-transparent">
                24/7
              </div>
              <p className="text-muted-foreground">AI coach availability</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-success">
                100%
              </div>
              <p className="text-muted-foreground">Secure & encrypted</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-5" />
        <div className="container relative mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Take Control of Your Finances?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of Ghanaians building wealth with Spendora
            </p>
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary-dark shadow-glow"
              onClick={() => navigate("/auth")}
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Spendora. Built with care for Ghanaians.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
