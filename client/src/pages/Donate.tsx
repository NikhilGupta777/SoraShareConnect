import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Heart, ArrowLeft, Sparkles, PartyPopper, Gift } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Donate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [code, setCode] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const donateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/codes/contribute', { code });
      return await res.json();
    },
    onSuccess: () => {
      setShowConfetti(true);
      setShowSuccess(true);
      setCode('');
      setTimeout(() => setShowConfetti(false), 5000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to donate code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDonate = () => {
    if (!code.trim()) {
      toast({
        title: "Missing Code",
        description: "Please enter your Sora invite code.",
        variant: "destructive",
      });
      return;
    }
    donateMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
          ))}
        </div>
      )}

      <header className="border-b backdrop-blur-sm bg-background/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {!showSuccess ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="border-2 border-primary/20 shadow-2xl">
                <CardHeader className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/5 flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-10 h-10 text-green-500" />
                  </div>
                  <CardTitle className="text-3xl">Donate Your Code</CardTitle>
                  <p className="text-muted-foreground mt-2 text-base">
                    Help the community by donating your Sora invite code
                  </p>
                </CardHeader>
                <CardContent className="space-y-6 pb-10">
                  <div className="bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-green-500/10 border border-green-500/20 rounded-lg p-6 space-y-3">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-green-500" />
                      Why donate?
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                        <span>Your code can help <span className="font-bold text-green-600">6 people</span> access Sora</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                        <span>Keep the community growing and sustainable</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                        <span>Pay it forward for others in need</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="donate-code" className="text-base font-semibold">Your Sora Invite Code</Label>
                    <Input
                      id="donate-code"
                      placeholder="Enter your invite code (e.g., SORA-XXX-XXX)"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="font-mono text-lg h-14"
                    />
                    <p className="text-xs text-muted-foreground">
                      Find this in Sora: Settings → Invite Friends → Copy your code
                    </p>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <p className="text-sm">
                      <span className="font-semibold">Note:</span> Each Sora code can invite 6 people. By donating, you're helping expand access to the entire community!
                    </p>
                  </div>

                  <Button 
                    onClick={handleDonate}
                    disabled={donateMutation.isPending}
                    className="w-full h-14 text-lg gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
                  >
                    {donateMutation.isPending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Donating...
                      </>
                    ) : (
                      <>
                        <Gift className="w-5 h-5" />
                        Donate Code & Help 6 People
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in duration-700">
              <Card className="border-2 border-green-500/30 shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent">
                  <CardContent className="py-20 text-center space-y-8">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/10 flex items-center justify-center mx-auto animate-bounce">
                        <PartyPopper className="w-12 h-12 text-green-500" />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-32 rounded-full bg-green-500/20 animate-ping" />
                      </div>
                    </div>

                    <div>
                      <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        Thank You So Much!
                      </h2>
                      <p className="text-xl text-muted-foreground max-w-md mx-auto leading-relaxed">
                        Your donated code will help <span className="font-bold text-primary">6 more people</span> access Sora for free!
                      </p>
                    </div>

                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 max-w-md mx-auto">
                      <p className="text-sm font-semibold mb-2 flex items-center justify-center gap-2">
                        <Heart className="w-4 h-4 text-red-500 animate-pulse" />
                        You're making a difference!
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Every code donation keeps this platform free and accessible for everyone
                      </p>
                    </div>

                    <div className="flex gap-3 justify-center">
                      <Button 
                        size="lg" 
                        onClick={() => setShowSuccess(false)}
                        variant="outline"
                        className="gap-2"
                      >
                        Donate Another Code
                      </Button>
                      <Link href="/">
                        <Button size="lg" className="gap-2">
                          <Sparkles className="w-5 h-5" />
                          Return to Home
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
