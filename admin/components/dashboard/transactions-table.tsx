'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search } from 'lucide-react'
import { formatCurrency, formatDateTime, calculateTutorShare, calculatePlatformShare } from '@/lib/utils'
import type { Transaction, User } from '@/lib/types'

export function TransactionsTable() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ['transactions', search, filter],
    queryFn: async () => {
      const response = await api.get('/admin/transactions', {
        params: { search, filter: filter !== 'all' ? filter : undefined },
      })
      return response.data.data.transactions
    },
  })

  const getTypeBadge = (type: string) => {
    return type === 'credit' ? (
      <Badge variant="outline" className="bg-green-50 text-green-700">
        Credit
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-red-50 text-red-700">
        Debit
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      success: { variant: 'outline' as const, className: 'bg-green-50 text-green-700' },
      pending: { variant: 'outline' as const, className: 'bg-yellow-50 text-yellow-700' },
      failed: { variant: 'outline' as const, className: 'bg-red-50 text-red-700' },
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

  const getPurposeLabel = (purpose: string) => {
    const labels: Record<string, string> = {
      wallet_topup: 'Wallet Top-up',
      course_purchase: 'Course Purchase',
      pastquestion_purchase: 'Past Question',
      tutor_application: 'Tutor Registration',
      withdrawal: 'Withdrawal',
      tutor_earning: 'Tutor Earning',
    }
    return labels[purpose] || purpose
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>All Transactions</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="course_purchase">Course Purchases</SelectItem>
                <SelectItem value="wallet_topup">Wallet Top-ups</SelectItem>
                <SelectItem value="withdrawal">Withdrawals</SelectItem>
                <SelectItem value="tutor_earning">Tutor Earnings</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions?.map((transaction) => (
                <TableRow key={transaction._id}>
                  <TableCell className="font-medium">
                    {getUserName(transaction.user)}
                  </TableCell>
                  <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div>{getPurposeLabel(transaction.purpose)}</div>
                      {transaction.purpose === 'course_purchase' && (
                        <div className="text-xs text-muted-foreground">
                          Tutor: {formatCurrency(calculateTutorShare(transaction.amount))} |
                          Platform: {formatCurrency(calculatePlatformShare(transaction.amount))}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {transaction.reference || '-'}
                  </TableCell>
                  <TableCell>{formatDateTime(transaction.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
