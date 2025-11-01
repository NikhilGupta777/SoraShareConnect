import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Copy, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import ReCAPTCHA from "react-google-recaptcha";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function RequestCode() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<'verify' | 'received' | 'contribute' | 'thankyou'>('verify');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [receivedCode, setReceivedCode] = useState<string>('');
  const [codeId, setCodeId] = useState<string>('');
  const [newCodes, setNewCodes] = useState(['', '', '', '']);
  const [copied, setCopied] = useState(false);

  const requestCodeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/codes/request', { recaptchaToken });
      return await res.json();
    },
    onSuccess: (data: any) => {
      setReceivedCode(data.code);
      setCodeId(data.codeId);
      setStep('received');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to request code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const submitCodesMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/codes/submit', {
        codes: newCodes,
        distributedCodeId: codeId,
      });
      return await res.json();
    },
    onSuccess: () => {
      setStep('thankyou');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit codes. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
  };

  const handleRequestCode = () => {
    if (!recaptchaToken) {
      toast({
        title: "Verification Required",
        description: "Please complete the reCAPTCHA verification.",
        variant: "destructive",
      });
      return;
    }
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

  const handleSubmitCodes = () => {
    if (newCodes.some(code => !code.trim())) {
      toast({
        title: "Missing Codes",
        description: "Please fill in all 4 code fields.",
        variant: "destructive",
      });
      return;
    }
    submitCodesMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {step === 'verify' && (
            <Card>
              <CardHeader>
                <CardTitle>Verify You're Human</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Complete the verification below to receive your Sora invite code.
                </p>
                <div className="flex justify-center">
                  <ReCAPTCHA
                    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
                    onChange={handleRecaptchaChange}
                  />
                </div>
                <Button 
                  onClick={handleRequestCode} 
                  disabled={!recaptchaToken || requestCodeMutation.isPending}
                  className="w-full"
                  data-testid="button-verify-request"
                >
                  {requestCodeMutation.isPending ? "Requesting..." : "Request Code"}
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 'received' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-primary" />
                  Your Invite Code
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-primary rounded-lg p-8 text-center space-y-4">
                  <p className="text-2xl font-mono font-bold tracking-wider" data-testid="text-received-code">
                    {receivedCode}
                  </p>
                  <Button 
                    onClick={handleCopyCode}
                    variant="outline"
                    data-testid="button-copy-code"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Code
                      </>
                    )}
                  </Button>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-2">Next Step: Pay It Forward</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    After you use this code, you'll receive 4 new invite codes from Sora. 
                    Please share them below to help the community!
                  </p>
                  <Button 
                    onClick={() => setStep('contribute')}
                    className="w-full"
                    data-testid="button-proceed-contribute"
                  >
                    Continue to Contribute
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'contribute' && (
            <Card>
              <CardHeader>
                <CardTitle>Share Your New Codes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  After signing up with Sora, you'll receive 4 new invite codes. 
                  Enter them below to help others in the community.
                </p>
                <div className="space-y-4">
                  {newCodes.map((code, index) => (
                    <div key={index}>
                      <Label htmlFor={`code-${index}`}>Code {index + 1}</Label>
                      <Input
                        id={`code-${index}`}
                        placeholder="SORA-XXX-XXX"
                        value={code}
                        onChange={(e) => {
                          const updated = [...newCodes];
                          updated[index] = e.target.value;
                          setNewCodes(updated);
                        }}
                        className="font-mono"
                        data-testid={`input-code-${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
                <Button 
                  onClick={handleSubmitCodes}
                  disabled={submitCodesMutation.isPending}
                  className="w-full"
                  data-testid="button-submit-codes"
                >
                  {submitCodesMutation.isPending ? "Submitting..." : "Submit New Codes"}
                </Button>
                <Button 
                  onClick={() => setLocation('/')}
                  variant="ghost"
                  className="w-full"
                  data-testid="button-skip"
                >
                  Skip for Now
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 'thankyou' && (
            <Card>
              <CardContent className="py-16 text-center space-y-6">
                <CheckCircle className="w-16 h-16 text-primary mx-auto" />
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Thank You!</h2>
                  <p className="text-muted-foreground">
                    Your contribution helps keep the community thriving.
                  </p>
                </div>
                <Link href="/">
                  <Button data-testid="button-return-home">
                    Return to Home
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
