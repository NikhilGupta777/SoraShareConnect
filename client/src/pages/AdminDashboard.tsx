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
import { useToast } from "@/hooks/use-toast";
import { LogOut, Plus, Trash2, Filter } from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useEffect, useState } from "react";
import type { InviteCode } from "@shared/schema";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [newCodes, setNewCodes] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: authCheck } = useQuery<{ authenticated: boolean }>({
    queryKey: ['/api/admin/check'],
  });

  const { data: stats } = useQuery<{ total: number; available: number; distributed: number; used: number; invalid: number }>({
    queryKey: ['/api/codes/stats'],
  });

  const { data: codes = [] } = useQuery<InviteCode[]>({
    queryKey: ['/api/admin/codes'],
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
      case 'distributed':
        return 'secondary';
      case 'used':
        return 'outline';
      case 'invalid':
        return 'destructive';
      default:
        return 'default';
    }
  };

  if (!authCheck?.authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
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
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Codes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold" data-testid="text-total-codes">
                  {stats?.total ?? 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Available</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary" data-testid="text-available-codes">
                  {stats?.available ?? 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Distributed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold" data-testid="text-distributed-codes">
                  {stats?.distributed ?? 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Used</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold" data-testid="text-used-codes">
                  {stats?.used ?? 0}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Code Management</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[150px]" data-testid="select-status-filter">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="distributed">Distributed</SelectItem>
                        <SelectItem value="used">Used</SelectItem>
                        <SelectItem value="invalid">Invalid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-add-codes">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Codes
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
                            rows={6}
                            data-testid="textarea-new-codes"
                          />
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
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead>Date Distributed</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCodes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No codes found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCodes.map((code) => (
                      <TableRow key={code.id}>
                        <TableCell className="font-mono" data-testid={`text-code-${code.id}`}>
                          {code.code}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(code.status)} data-testid={`badge-status-${code.id}`}>
                            {code.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(code.dateAdded).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {code.dateDistributed ? new Date(code.dateDistributed).toLocaleDateString() : '-'}
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
                                <SelectItem value="distributed">Distributed</SelectItem>
                                <SelectItem value="used">Used</SelectItem>
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
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
