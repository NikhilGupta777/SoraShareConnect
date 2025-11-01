import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, Zap } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { data: stats } = useQuery<{ total: number; available: number; distributed: number; used: number; invalid: number }>({
    queryKey: ['/api/codes/stats'],
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Sora Invite Codes</h1>
          <Link href="/admin">
            <Button variant="ghost" size="sm" data-testid="link-admin">
              Admin Login
            </Button>
          </Link>
        </div>
      </header>

      <main>
        <section className="py-16 sm:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-5xl font-bold mb-4">Get Your Sora Invite Code</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Community-powered invite code sharing. Get one code, share four back.
                </p>
              </div>

              <Card className="max-w-md mx-auto">
                <CardContent className="p-8">
                  <div className="text-center space-y-4">
                    <p className="text-sm uppercase tracking-wide text-muted-foreground">
                      Codes Available
                    </p>
                    <p className="text-4xl font-bold" data-testid="text-available-count">
                      {stats?.available ?? 0}
                    </p>
                    <Link href="/request">
                      <Button size="lg" className="w-full" data-testid="button-request-code">
                        Request a Code
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Community-powered</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>Instant delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Free forever</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-2xl font-semibold text-center mb-12">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold mx-auto">
                  1
                </div>
                <h4 className="font-semibold">Request</h4>
                <p className="text-sm text-muted-foreground">
                  Verify you're human and request an invite code
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold mx-auto">
                  2
                </div>
                <h4 className="font-semibold">Receive</h4>
                <p className="text-sm text-muted-foreground">
                  Get one valid Sora invite code instantly
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold mx-auto">
                  3
                </div>
                <h4 className="font-semibold">Share Back</h4>
                <p className="text-sm text-muted-foreground">
                  Contribute your 4 new codes to help others
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
