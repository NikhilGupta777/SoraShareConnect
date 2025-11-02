import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Plus, Trash2, Filter, TrendingUp, Users, CheckCircle2, XCircle, Activity, Eye } from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useEffect, useState } from "react";
import type { InviteCode, CodeUsage } from "@shared/schema";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [newCodes, setNewCodes] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCodeId, setSelectedCodeId] = useState<string | null>(null);
  const [showUsages, setShowUsages] = useState(false);

  const { data: authCheck } = useQuery<{ authenticated: boolean }>({
    queryKey: ['/api/admin/check'],
  });

  const { data: stats } = useQuery<{ 
    total: number; 
    available: number; 
    active: number; 
    exhausted: number; 
    invalid: number;
    totalClaims: number;
    needsReview: number;
  }>({
    queryKey: ['/api/codes/stats'],
  });

  const { data: codes = [] } = useQuery<InviteCode[]>({
    queryKey: ['/api/admin/codes'],
  });

  const { data: usages = [] } = useQuery<CodeUsage[]>({
    queryKey: [`/api/admin/codes/${selectedCodeId}/usages`],
    enabled: !!selectedCodeId && showUsages,
  });

  useEffect(() => {
    if (authCheck && !authCheck.authenticated) {
      setLocation('/admin');
    }
  }, [authCheck, setLocation]);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/admin/logout');
      return await res.json();
    },
    onSuccess: () => {
      setLocation('/admin');
    },
  });

  const addCodesMutation = useMutation({
    mutationFn: async () => {
      const codeArray = newCodes.split('\n').filter(c => c.trim() !== '');
      const res = await apiRequest('POST', '/api/admin/codes', { codes: codeArray });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/codes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/codes/stats'] });
      setNewCodes('');
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Codes added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add codes",
        variant: "destructive",
      });
    },
  });

  const updateCodeMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest('PATCH', `/api/admin/codes/${id}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/codes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/codes/stats'] });
      toast({
        title: "Success",
        description: "Code status updated",
      });
    },
  });

  const deleteCodeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('DELETE', `/api/admin/codes/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/codes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/codes/stats'] });
      toast({
        title: "Success",
        description: "Code deleted successfully",
      });
    },
  });

  const filteredCodes = statusFilter === 'all' 
    ? codes 
    : codes.filter(code => code.status === statusFilter);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'active':
        return 'secondary';
      case 'exhausted':
        return 'outline';
      case 'invalid':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'text-green-500';
      case 'active':
        return 'text-blue-500';
      case 'exhausted':
        return 'text-gray-500';
      case 'invalid':
        return 'text-red-500';
      default:
        return '';
    }
  };

  if (!authCheck?.authenticated) {
    return null;
  }

  const totalCapacity = codes.reduce((sum, code) => sum + code.maxUses, 0);
  const totalUsed = codes.reduce((sum, code) => sum + code.usageCount, 0);
  const utilizationRate = totalCapacity > 0 ? (totalUsed / totalCapacity) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <header className="border-b backdrop-blur-sm bg-background/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => logoutMutation.mutate()}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-2 hover:border-primary/30 transition-all">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Total Codes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold" data-testid="text-total-codes">
                  {stats?.total ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {totalCapacity} total invites possible
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2 hover:border-green-500/30 transition-all">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Available
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-green-500" data-testid="text-available-codes">
                  {stats?.available ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Ready to be claimed
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2 hover:border-blue-500/30 transition-all">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  Active
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-blue-500" data-testid="text-distributed-codes">
                  {stats?.active ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Currently in use
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2 hover:border-purple-500/30 transition-all">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  Total Claims
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-purple-500" data-testid="text-used-codes">
                  {stats?.totalClaims ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  People helped
                </p>
              </CardContent>
            </Card>
          </div>

          {stats && stats.needsReview > 0 && (
            <Card className="border-2 border-yellow-500/50 bg-yellow-500/5">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-yellow-500" />
                  Codes Needing Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {stats.needsReview} code{stats.needsReview !== 1 ? 's have' : ' has'} been marked as not working 5+ times and need{stats.needsReview === 1 ? 's' : ''} your review.
                </p>
                <p className="text-xs text-yellow-600 bg-yellow-500/10 border border-yellow-500/20 rounded p-3">
                  These codes may be invalid or expired. Please verify and update their status accordingly.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">System Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Code Utilization</span>
                    <span className="font-semibold">{utilizationRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={utilizationRate} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {totalUsed} / {totalCapacity} total capacity used
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Exhausted</span>
                      <XCircle className="w-4 h-4 text-gray-500" />
                    </div>
                    <p className="text-2xl font-bold">{stats?.exhausted ?? 0}</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Invalid</span>
                      <XCircle className="w-4 h-4 text-red-500" />
                    </div>
                    <p className="text-2xl font-bold">{stats?.invalid ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" data-testid="button-add-codes">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Codes
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Codes</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="codes">Codes (one per line)</Label>
                        <Textarea
                          id="codes"
                          placeholder="SORA-ABC-123&#10;SORA-DEF-456&#10;SORA-GHI-789"
                          value={newCodes}
                          onChange={(e) => setNewCodes(e.target.value)}
                          rows={8}
                          className="font-mono"
                          data-testid="textarea-new-codes"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          Each code will be set to allow 6 uses by default
                        </p>
                      </div>
                      <Button
                        onClick={() => addCodesMutation.mutate()}
                        disabled={!newCodes.trim() || addCodesMutation.isPending}
                        className="w-full"
                        data-testid="button-submit-new-codes"
                      >
                        {addCodesMutation.isPending ? "Adding..." : "Add Codes"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <div className="pt-3 border-t">
                  <h4 className="text-sm font-semibold mb-2">Filter Codes</h4>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger data-testid="select-status-filter">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="exhausted">Exhausted</SelectItem>
                      <SelectItem value="invalid">Invalid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-2">
            <CardHeader>
              <CardTitle>Code Management</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredCodes.length} {statusFilter !== 'all' ? statusFilter : ''} code{filteredCodes.length !== 1 ? 's' : ''}
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Failed Reports</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCodes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No codes found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCodes.map((code) => (
                        <TableRow key={code.id} className="hover:bg-muted/50">
                          <TableCell className="font-mono font-semibold" data-testid={`text-code-${code.id}`}>
                            {code.code}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(code.status)} data-testid={`badge-status-${code.id}`}>
                              {code.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-semibold ${getStatusColor(code.status)}`}>
                                  {code.usageCount} / {code.maxUses}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2"
                                  onClick={() => {
                                    setSelectedCodeId(code.id);
                                    setShowUsages(true);
                                  }}
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                              </div>
                              <Progress 
                                value={(code.usageCount / code.maxUses) * 100} 
                                className="h-1.5 w-24"
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            {code.failedValidations > 0 ? (
                              <div className="flex items-center gap-2">
                                <Badge variant={code.needsReview ? "destructive" : "secondary"} className="gap-1">
                                  {code.failedValidations}
                                  {code.needsReview && <XCircle className="w-3 h-3" />}
                                </Badge>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">0</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(code.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Select
                                value={code.status}
                                onValueChange={(status) => updateCodeMutation.mutate({ id: code.id, status })}
                              >
                                <SelectTrigger className="w-[130px]" data-testid={`select-status-${code.id}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="available">Available</SelectItem>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="exhausted">Exhausted</SelectItem>
                                  <SelectItem value="invalid">Invalid</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteCodeMutation.mutate(code.id)}
                                data-testid={`button-delete-${code.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={showUsages} onOpenChange={setShowUsages}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Code Usage History</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {usages.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No usage history yet
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {usages.map((usage) => (
                  <div key={usage.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant={usage.status === 'confirmed' ? 'default' : 'secondary'}>
                        {usage.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(usage.claimedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm space-y-1">
                      <p className="text-muted-foreground">
                        IP: {usage.ipHash?.substring(0, 16)}...
                      </p>
                      {usage.userAgent && (
                        <p className="text-xs text-muted-foreground truncate">
                          {usage.userAgent}
                        </p>
                      )}
                      {usage.note && (
                        <p className="text-sm mt-2">{usage.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
