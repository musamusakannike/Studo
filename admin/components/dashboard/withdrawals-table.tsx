'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { toast } from 'sonner'
import type { Withdrawal, User } from '@/lib/types'

export function WithdrawalsTable() {
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null)
  const [actionDialog, setActionDialog] = useState<'approve' | 'reject' | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const queryClient = useQueryClient()

  const { data: withdrawals, isLoading } = useQuery<Withdrawal[]>({
    queryKey: ['withdrawals'],
    queryFn: async () => {
      const response = await api.get('/admin/withdrawals')
      return response.data
    },
  })

  const approveMutation = useMutation({
    mutationFn: async (withdrawalId: string) => {
      await api.post(`/admin/withdrawals/${withdrawalId}/approve`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      toast.success('Withdrawal approved and processed')
      setActionDialog(null)
      setSelectedWithdrawal(null)
    },
    onError: () => {
      toast.error('Failed to approve withdrawal')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: async ({ withdrawalId, reason }: { withdrawalId: string; reason: string }) => {
      await api.post(`/admin/withdrawals/${withdrawalId}/reject`, { reason })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      toast.success('Withdrawal rejected')
      setActionDialog(null)
      setSelectedWithdrawal(null)
      setRejectionReason('')
    },
    onError: () => {
      toast.error('Failed to reject withdrawal')
    },
  })

  const pendingWithdrawals = withdrawals?.filter((w) => w.status === 'pending') || []
  const processedWithdrawals = withdrawals?.filter((w) => w.status !== 'pending') || []

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'outline' as const, className: 'bg-yellow-50 text-yellow-700' },
      approved: { variant: 'outline' as const, className: 'bg-green-50 text-green-700' },
      rejected: { variant: 'outline' as const, className: 'bg-red-50 text-red-700' },
    }

    const config = variants[status as keyof typeof variants] || variants.pending

    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    )
  }

  const getUserName = (user: User | string) => {
    return typeof user === 'string' ? 'Unknown' : user.fullName
  }

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pending Withdrawals</CardTitle>
              <Badge variant="destructive" className="text-lg px-3 py-1">
                {pendingWithdrawals.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded bg-muted" />
                ))}
              </div>
            ) : pendingWithdrawals.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Bank Details</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Net Amount</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingWithdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal._id}>
                      <TableCell className="font-medium">
                        {getUserName(withdrawal.user)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{withdrawal.bankName}</div>
                          <div className="text-muted-foreground">{withdrawal.accountNumber}</div>
                          <div className="text-muted-foreground">{withdrawal.accountName}</div>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(withdrawal.amount)}</TableCell>
                      <TableCell>{formatCurrency(withdrawal.charge)}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(withdrawal.netAmount)}
                      </TableCell>
                      <TableCell>{formatDateTime(withdrawal.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedWithdrawal(withdrawal)
                              setActionDialog('approve')
                            }}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedWithdrawal(withdrawal)
                              setActionDialog('reject')
                            }}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                No pending withdrawals
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Processed Withdrawals</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded bg-muted" />
                ))}
              </div>
            ) : processedWithdrawals.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Processed</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedWithdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal._id}>
                      <TableCell className="font-medium">
                        {getUserName(withdrawal.user)}
                      </TableCell>
                      <TableCell>{formatCurrency(withdrawal.netAmount)}</TableCell>
                      <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                      <TableCell>
                        {withdrawal.processedAt
                          ? formatDateTime(withdrawal.processedAt)
                          : '-'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {withdrawal.rejectionReason || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                No processed withdrawals
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={actionDialog === 'approve'} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Withdrawal</DialogTitle>
            <DialogDescription>
              Confirm withdrawal approval. This will trigger a Paystack transfer.
            </DialogDescription>
          </DialogHeader>

          {selectedWithdrawal && (
            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">User</span>
                <span className="font-medium">{getUserName(selectedWithdrawal.user)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Bank</span>
                <span className="font-medium">{selectedWithdrawal.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Account</span>
                <span className="font-medium">
                  {selectedWithdrawal.accountNumber} - {selectedWithdrawal.accountName}
                </span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="text-sm text-muted-foreground">Net Amount</span>
                <span className="text-lg font-bold">
                  {formatCurrency(selectedWithdrawal.netAmount)}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 rounded-lg bg-yellow-50 p-3 text-sm dark:bg-yellow-950">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <p className="text-yellow-800 dark:text-yellow-200">
              This will initiate a Paystack transfer. Ensure sufficient balance in your Paystack account.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedWithdrawal && approveMutation.mutate(selectedWithdrawal._id)}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? 'Processing...' : 'Approve & Transfer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={actionDialog === 'reject'} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Withdrawal</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this withdrawal request
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Rejection Reason</label>
              <Input
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                selectedWithdrawal &&
                rejectMutation.mutate({
                  withdrawalId: selectedWithdrawal._id,
                  reason: rejectionReason,
                })
              }
              disabled={rejectMutation.isPending || !rejectionReason}
            >
              {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
