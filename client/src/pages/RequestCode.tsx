import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Copy, ArrowLeft, Sparkles, Heart, PartyPopper, Gift, ThumbsUp, ThumbsDown, Check, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function RequestCode() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<'request' | 'received' | 'contribute' | 'thankyou'>('request');
  const [receivedCode, setReceivedCode] = useState<string>('');
  const [remainingUses, setRemainingUses] = useState<number>(6);
  const [usageId, setUsageId] = useState<string>('');
  const [newCode, setNewCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [markedAsUsed, setMarkedAsUsed] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  const requestCodeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/codes/request', {});
      return await res.json();
    },
    onSuccess: (data: any) => {
      setReceivedCode(data.code);
      setRemainingUses(data.remainingUses || 6);
      setUsageId(data.usageId);
      setStep('received');
      setFeedbackGiven(false);
      setMarkedAsUsed(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to request code. Please try again later.",
        variant: "destructive",
      });
    },
  });

  const submitCodeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/codes/contribute', {
        code: newCode,
      });
      return await res.json();
    },
    onSuccess: () => {
      setShowConfetti(true);
      setStep('thankyou');
      setTimeout(() => setShowConfetti(false), 5000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: async (working: boolean) => {
      const res = await apiRequest('POST', '/api/codes/feedback', {
        usageId,
        working,
      });
      return await res.json();
    },
    onSuccess: (data: any) => {
      setFeedbackGiven(true);
      if (data.replaced && data.newCode) {
        setReceivedCode(data.newCode.code);
        setUsageId(data.newCode.usageId);
        setRemainingUses(data.newCode.remainingUses);
        setMarkedAsUsed(false);
        setFeedbackGiven(false);
        toast({
          title: "Code Replaced!",
          description: "We've given you a new working code.",
        });
      } else {
        toast({
          title: "Thanks for the feedback!",
          description: data.message || "Your feedback helps improve the community.",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit feedback.",
        variant: "destructive",
      });
    },
  });

  const markUsedMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/codes/mark-used', {
        usageId,
      });
      return await res.json();
    },
    onSuccess: () => {
      setMarkedAsUsed(true);
      toast({
        title: "Marked as used!",
        description: "Thanks for letting us know!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark as used.",
        variant: "destructive",
      });
    },
  });

  const handleRequestCode = () => {
    requestCodeMutation.mutate();
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(receivedCode);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Code copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the code manually",
        variant: "destructive",
      });
    }
  };

  const handleSubmitCode = () => {
    if (!newCode.trim()) {
      toast({
        title: "Missing Code",
        description: "Please enter your invite code.",
        variant: "destructive",
      });
      return;
    }
    submitCodeMutation.mutate();
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
            <Button variant="ghost" size="sm" data-testid="button-back-home" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {step === 'request' && (
            <Card className="border-2 border-primary/20 shadow-2xl">
              <CardHeader className="text-center pb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-10 h-10 text-primary" />
                </div>
                <CardTitle className="text-3xl">Get Your Invite Code</CardTitle>
                <p className="text-muted-foreground mt-2">
                  Click the button below to receive your free Sora invite code instantly
                </p>
              </CardHeader>
              <CardContent className="space-y-6 pb-10">
                <div className="bg-primary/5 border border-primary/10 rounded-lg p-6 space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    What you'll get:
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>One valid Sora invite code</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>This code can invite 6 people total</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>After you use it, you'll receive a new code to share</span>
                    </li>
                  </ul>
                </div>

                <Button 
                  onClick={handleRequestCode} 
                  disabled={requestCodeMutation.isPending}
                  className="w-full h-14 text-lg gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                  data-testid="button-verify-request"
                >
                  {requestCodeMutation.isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Getting your code...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Request Code Now
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  No verification needed • Instant delivery • Completely free
                </p>
              </CardContent>
            </Card>
          )}

          {step === 'received' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="border-2 border-primary/20 shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 animate-bounce">
                      <CheckCircle className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Success! Here's Your Code</h3>
                    <p className="text-sm text-muted-foreground">
                      This code can be used {remainingUses} more times
                    </p>
                  </div>

                  <div className="bg-background border-2 border-primary rounded-xl p-6 space-y-4">
                    <p className="text-3xl sm:text-4xl font-mono font-bold tracking-wider text-center break-all" data-testid="text-received-code">
                      {receivedCode}
                    </p>
                    <Button 
                      onClick={handleCopyCode}
                      variant="outline"
                      size="lg"
                      className="w-full gap-2"
                      data-testid="button-copy-code"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5" />
                          Copy Code
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <CardContent className="pt-6 pb-8 space-y-6">
                  <div className="border rounded-lg p-4 space-y-3">
                    <Label className="text-sm font-semibold">Did you use this code?</Label>
                    <Select 
                      value={markedAsUsed ? "yes" : "no"} 
                      onValueChange={(val) => {
                        if (val === "yes" && !markedAsUsed) {
                          markUsedMutation.mutate();
                        }
                      }}
                      disabled={markedAsUsed}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no">Not yet</SelectItem>
                        <SelectItem value="yes">Yes, I used it!</SelectItem>
                      </SelectContent>
                    </Select>
                    {markedAsUsed && (
                      <p className="text-xs text-green-600 flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Thanks for letting us know!
                      </p>
                    )}
                  </div>

                  <div className="border rounded-lg p-4 space-y-3">
                    <Label className="text-sm font-semibold">Did the code work?</Label>
                    <p className="text-xs text-muted-foreground">
                      Help us maintain quality codes by providing feedback
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        onClick={() => feedbackMutation.mutate(true)}
                        disabled={feedbackGiven || feedbackMutation.isPending}
                        className="gap-2 border-green-500/50 hover:bg-green-500/10"
                      >
                        <ThumbsUp className="w-4 h-4 text-green-500" />
                        Working
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => feedbackMutation.mutate(false)}
                        disabled={feedbackGiven || feedbackMutation.isPending}
                        className="gap-2 border-red-500/50 hover:bg-red-500/10"
                      >
                        <ThumbsDown className="w-4 h-4 text-red-500" />
                        Not Working
                      </Button>
                    </div>
                    {feedbackGiven && (
                      <p className="text-xs text-primary flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Thank you for your feedback!
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      If the code doesn't work, we'll automatically give you a new one!
                    </p>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      Next Steps:
                    </h4>
                    <ol className="text-sm space-y-1 text-muted-foreground list-decimal list-inside">
                      <li>Connect to a VPN</li>
                      <li>Go to sora.com and sign up</li>
                      <li>Use this code to activate your account</li>
                      <li>After activation, find your invite code in Settings → Invite Friends</li>
                      <li>Come back and contribute your new code!</li>
                    </ol>
                  </div>

                  <Button 
                    onClick={() => setStep('contribute')}
                    className="w-full h-12 gap-2"
                    data-testid="button-proceed-contribute"
                  >
                    <Heart className="w-5 h-5" />
                    Ready to Contribute Back
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {step === 'contribute' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="border-2 border-primary/20 shadow-2xl">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-green-500" />
                  </div>
                  <CardTitle className="text-2xl">Contribute Your Code</CardTitle>
                  <p className="text-muted-foreground mt-2">
                    Share your new invite code to help 6 more people access Sora
                  </p>
                </CardHeader>
                <CardContent className="space-y-6 pb-10">
                  <div className="bg-green-500/5 border border-green-500/10 rounded-lg p-4">
                    <p className="text-sm">
                      <span className="font-semibold">Important:</span> After using the code we gave you, 
                      Sora will generate ONE new invite code for you. This single code can be used by 6 different people.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-code" className="text-base">Your New Invite Code</Label>
                    <Input
                      id="new-code"
                      placeholder="Enter your new code (e.g., SORA-XXX-XXX)"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      className="font-mono text-lg h-14"
                      data-testid="input-code-1"
                    />
                    <p className="text-xs text-muted-foreground">
                      Find this in Sora: Settings → Invite Friends
                    </p>
                  </div>

                  <Button 
                    onClick={handleSubmitCode}
                    disabled={submitCodeMutation.isPending}
                    className="w-full h-14 text-lg gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    data-testid="button-submit-codes"
                  >
                    {submitCodeMutation.isPending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Gift className="w-5 h-5" />
                        Submit Code & Help 6 People
                      </>
                    )}
                  </Button>

                  <Button 
                    onClick={() => setLocation('/')}
                    variant="ghost"
                    className="w-full"
                    data-testid="button-skip"
                  >
                    I'll contribute later
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {step === 'thankyou' && (
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
                        You're Amazing!
                      </h2>
                      <p className="text-xl text-muted-foreground max-w-md mx-auto leading-relaxed">
                        Your contribution will help <span className="font-bold text-primary">6 more people</span> get access to Sora.
                      </p>
                    </div>

                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 max-w-md mx-auto">
                      <p className="text-sm font-semibold mb-2 flex items-center justify-center gap-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        Thank you for keeping the community alive!
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Every code shared makes Sora more accessible to everyone
                      </p>
                    </div>

                    <Link href="/">
                      <Button size="lg" className="gap-2" data-testid="button-return-home">
                        <Sparkles className="w-5 h-5" />
                        Return to Home
                      </Button>
                    </Link>
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
