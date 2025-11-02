import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, Users, Zap, Info, Sparkles, ArrowRight, TrendingUp, Heart } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";

export default function Home() {
  const [showInfo, setShowInfo] = useState(false);
  
  const { data: stats } = useQuery<{ 
    total: number; 
    available: number; 
    active: number; 
    exhausted: number; 
    invalid: number;
    totalClaims: number;
  }>({
    queryKey: ['/api/codes/stats'],
  });

  useEffect(() => {
    const hasSeenInfo = localStorage.getItem('hasSeenSoraInfo');
    if (!hasSeenInfo) {
      setShowInfo(true);
      localStorage.setItem('hasSeenSoraInfo', 'true');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <Dialog open={showInfo} onOpenChange={setShowInfo}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
              Welcome to Sora Invite Code Sharing
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-base leading-relaxed space-y-4 pt-4">
            <p className="font-semibold text-foreground">
              Get free Sora invite codes and help grow the community!
            </p>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-primary" />
                How it works:
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Request an invite code from our website</li>
                <li>Connect to a VPN on your desktop or mobile device</li>
                <li>Go to <span className="font-mono font-semibold">sora.com</span> and sign up with your email</li>
                <li>Enter the invite code you received from us</li>
                <li>After logging in, go to Settings → <span className="font-semibold">Invite Friends</span></li>
                <li>You'll receive ONE invite code that can be used 6 times</li>
                <li>Copy your new code and come back to our website</li>
                <li>Click "Contribute Code" and paste your code to help 6 more people!</li>
              </ol>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="text-sm font-semibold text-primary flex items-center gap-2">
                <Info className="w-4 h-4" />
                Important: Each code can invite 6 people!
              </p>
              <p className="text-xs mt-2 text-muted-foreground">
                When you contribute 1 code back, you're helping 6 other people get access to Sora.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowInfo(false)}>
              I'll read this later
            </Button>
            <Button onClick={() => setShowInfo(false)} className="gap-2">
              Got it! <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <header className="border-b backdrop-blur-sm bg-background/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
              <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Sora Codes
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowInfo(true)}
              className="gap-2"
            >
              <Info className="w-4 h-4" />
              How it works
            </Button>
            <Link href="/admin">
              <Button variant="ghost" size="sm" data-testid="link-admin">
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative py-20 sm:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
          <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-8 mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Free Sora Access for Everyone</span>
              </div>
              
              <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
                  Get Your
                </span>
                <br />
                <span className="bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent animate-pulse">
                  Sora Invite Code
                </span>
              </h2>
              
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Join our community-powered platform. Each code invites 6 people – get one, share one back!
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
              <Card className="lg:col-span-2 border-2 border-primary/20 shadow-xl shadow-primary/5 hover:shadow-primary/10 transition-all duration-300">
                <CardContent className="p-10">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-wide text-muted-foreground font-semibold">
                          Codes Available Now
                        </p>
                        <p className="text-6xl font-bold mt-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent" data-testid="text-available-count">
                          {stats?.available ?? 0}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Codes</p>
                        <p className="text-3xl font-bold">{stats?.total ?? 0}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Active</p>
                        <p className="text-2xl font-semibold text-blue-500">{stats?.active ?? 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Used</p>
                        <p className="text-2xl font-semibold text-green-500">{stats?.exhausted ?? 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Claims</p>
                        <p className="text-2xl font-semibold text-purple-500">{stats?.totalClaims ?? 0}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Link href="/request">
                        <Button 
                          size="lg" 
                          className="w-full h-14 text-base gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300" 
                          data-testid="button-request-code"
                        >
                          <Zap className="w-5 h-5" />
                          Request Code
                        </Button>
                      </Link>
                      <Link href="/donate">
                        <Button 
                          size="lg" 
                          variant="outline"
                          className="w-full h-14 text-base gap-2 border-2 hover:bg-green-500/10 hover:border-green-500/50 transition-all duration-300" 
                        >
                          <Heart className="w-5 h-5 text-green-500" />
                          Donate Code
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/40 transition-all duration-300 bg-gradient-to-br from-card to-card/50">
                <CardContent className="p-6 h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Live Stats</h3>
                        <p className="text-xs text-muted-foreground">Real-time updates</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Available</span>
                        <div className="flex-1 mx-3 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                            style={{ width: `${stats ? (stats.available / stats.total) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold">{((stats ? (stats.available / stats.total) * 100 : 0)).toFixed(0)}%</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Active</span>
                        <div className="flex-1 mx-3 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                            style={{ width: `${stats ? (stats.active / stats.total) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold">{((stats ? (stats.active / stats.total) * 100 : 0)).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-2 hover:border-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 flex items-center justify-center mx-auto">
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                  <h4 className="font-bold text-lg">Community-Powered</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Built by the community, for the community. Every code shared helps 6 more people.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 flex items-center justify-center mx-auto">
                    <Zap className="w-8 h-8 text-purple-500" />
                  </div>
                  <h4 className="font-bold text-lg">Instant Access</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Get your code immediately. No waiting, no queues, no hassle.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 flex items-center justify-center mx-auto">
                    <Shield className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h4 className="font-bold text-lg">Always Free</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    100% free forever. No hidden costs, no subscriptions, no catches.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>Made with ❤️ for the Sora community • Each code invites 6 people</p>
        </div>
      </footer>
    </div>
  );
}
