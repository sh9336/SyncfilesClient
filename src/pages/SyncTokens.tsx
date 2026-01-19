import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { syncTokensApi, SyncToken, SyncTokenStats } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Key,
  Loader2,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  HardDrive,
  Upload,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}

export default function SyncTokens() {
  const [tokens, setTokens] = useState<SyncToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedToken, setSelectedToken] = useState<SyncToken | null>(null);
  const [tokenStats, setTokenStats] = useState<SyncTokenStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const { toast } = useToast();

  const fetchTokens = useCallback(async () => {
    try {
      const data = await syncTokensApi.list();
      setTokens(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch tokens:', error);
      toast({
        title: 'Error',
        description: 'Failed to load sync tokens.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  const handleViewToken = async (token: SyncToken) => {
    setSelectedToken(token);
    setIsLoadingStats(true);
    setTokenStats(null);

    try {
      const [details, stats] = await Promise.all([
        syncTokensApi.get(token.id),
        syncTokensApi.getStats(token.id),
      ]);
      setSelectedToken(details);
      setTokenStats(stats);
    } catch (error) {
      console.error('Failed to fetch token details or stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 h-full flex flex-col">
        {/* Header - Minimalist */}
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Sync Tokens</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={fetchTokens} className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
              <RefreshCw className="h-4 w-4" />
            </Button>
            {/* Provide 'Create Token' button if functionality existed, ensuring it matches style */}
          </div>
        </div>

        {/* Tokens List - Minimalist */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/30" />
          </div>
        ) : tokens.length === 0 ? (
          <div className="flex-1 rounded-lg border bg-card/50 shadow-sm flex flex-col items-center justify-center text-center p-8">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/50">
              <Key className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <h3 className="text-sm font-medium text-foreground">No sync tokens</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Contact your administrator to create tokens.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border bg-card/50 shadow-sm flex flex-col">
            <div className="px-4 py-2 border-b border-border/50 bg-muted/20 grid grid-cols-12 gap-4">
              <div className="col-span-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Token Name</div>
              <div className="col-span-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Permissions</div>
              <div className="col-span-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</div>
              <div className="col-span-2 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</div>
            </div>

            <div className="divide-y divide-border/50">
              {tokens.map((token) => {
                const expired = isExpired(token.expires_at);
                return (
                  <div
                    key={token.id}
                    className="group grid grid-cols-12 gap-4 items-center p-2.5 px-4 hover:bg-muted/40 transition-colors"
                  >
                    {/* Name & ID */}
                    <div className="col-span-4 min-w-0 pr-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded bg-secondary/30 transition-colors", expired ? "text-destructive" : "text-primary")}>
                          <Key className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className={cn("text-sm font-medium truncate", expired && "text-muted-foreground line-through decoration-destructive/50")}>{token.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono truncate opacity-70">{token.id}</p>
                        </div>
                      </div>
                    </div>

                    {/* Permissions - Compact Badges */}
                    <div className="col-span-3 flex items-center gap-1.5 flex-wrap">
                      {['read', 'write', 'delete'].map((perm) => {
                        const hasPerm = token[`can_${perm}` as keyof SyncToken];
                        if (!hasPerm) return null;
                        return (
                          <span key={perm} className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-secondary text-[10px] font-medium text-secondary-foreground capitalize border border-transparent group-hover:border-border/50 transition-colors">
                            {perm}
                          </span>
                        )
                      })}
                    </div>

                    {/* Status / Dates */}
                    <div className="col-span-3 min-w-0">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", expired ? "bg-destructive" : "bg-green-500")} />
                          <span className={cn("font-medium", expired ? "text-destructive" : "text-foreground")}>
                            {expired ? 'Expired' : 'Active'}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">
                          Exp: {formatDate(token.expires_at)}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleViewToken(token)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Token Details Dialog */}
      <Dialog
        open={!!selectedToken}
        onOpenChange={() => setSelectedToken(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              {selectedToken?.name}
            </DialogTitle>
            <DialogDescription>
              Token details and usage statistics
            </DialogDescription>
          </DialogHeader>

          {selectedToken && (
            <div className="space-y-6 pt-4">
              {/* Token ID */}
              <div>
                <p className="mb-1.5 text-sm font-medium text-muted-foreground">
                  Token ID
                </p>
                <code className="token-display block w-full overflow-x-auto">
                  {selectedToken.id}
                </code>
              </div>

              {/* Permissions */}
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">
                  Permissions
                </p>
                <div className="flex gap-2">
                  {['read', 'write', 'delete'].map((perm) => {
                    const hasPermission =
                      selectedToken[`can_${perm}` as keyof SyncToken];
                    return (
                      <span
                        key={perm}
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium capitalize',
                          hasPermission ? 'status-active' : 'status-inactive'
                        )}
                      >
                        {hasPermission ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5" />
                        )}
                        {perm}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Stats */}
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">
                  Usage Statistics
                </p>
                {isLoadingStats ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : tokenStats ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-border bg-secondary/30 p-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Activity className="h-4 w-4" />
                        <span className="text-xs">Total Requests</span>
                      </div>
                      <p className="mt-1 text-xl font-semibold text-foreground">
                        {tokenStats.total_requests.toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-secondary/30 p-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <HardDrive className="h-4 w-4" />
                        <span className="text-xs">Data Transferred</span>
                      </div>
                      <p className="mt-1 text-xl font-semibold text-foreground">
                        {formatBytes(tokenStats.bytes_transferred)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-secondary/30 p-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Upload className="h-4 w-4" />
                        <span className="text-xs">Files Uploaded</span>
                      </div>
                      <p className="mt-1 text-xl font-semibold text-foreground">
                        {tokenStats.files_uploaded.toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-secondary/30 p-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Download className="h-4 w-4" />
                        <span className="text-xs">Files Downloaded</span>
                      </div>
                      <p className="mt-1 text-xl font-semibold text-foreground">
                        {tokenStats.files_downloaded.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No statistics available
                  </p>
                )}
              </div>

              {/* Dates */}
              <div className="flex gap-6 text-sm">
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium text-foreground">
                    {formatDate(selectedToken.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Expires</p>
                  <p
                    className={cn(
                      'font-medium',
                      isExpired(selectedToken.expires_at)
                        ? 'text-destructive'
                        : 'text-foreground'
                    )}
                  >
                    {formatDate(selectedToken.expires_at)}
                    {isExpired(selectedToken.expires_at) && (
                      <span className="ml-2 text-xs">(Expired)</span>
                    )}
                  </p>
                </div>
                {selectedToken.last_used_at && (
                  <div>
                    <p className="text-muted-foreground">Last Used</p>
                    <p className="font-medium text-foreground">
                      {formatDate(selectedToken.last_used_at)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
