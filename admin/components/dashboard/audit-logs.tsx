'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'
import type { AuditLog, User } from '@/lib/types'

export function AuditLogs() {
  const { data: logs, isLoading } = useQuery<AuditLog[]>({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const response = await api.get('/admin/audit-logs')
      return response.data
    },
  })

  const getActionBadge = (action: string) => {
    if (action.includes('approve')) {
      return <Badge variant="outline" className="bg-green-50 text-green-700">Approved</Badge>
    }
    if (action.includes('reject')) {
      return <Badge variant="outline" className="bg-red-50 text-red-700">Rejected</Badge>
    }
    if (action.includes('update')) {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700">Updated</Badge>
    }
    return <Badge variant="secondary">{action}</Badge>
  }

  const getAdminName = (admin: User | string) => {
    return typeof admin === 'string' ? 'System' : admin.fullName
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Logs</CardTitle>
        <CardDescription>
          Track all administrative actions on the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : logs && logs.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target Type</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log._id}>
                  <TableCell className="font-medium">
                    {getAdminName(log.admin)}
                  </TableCell>
                  <TableCell>{getActionBadge(log.action)}</TableCell>
                  <TableCell className="capitalize">{log.targetType}</TableCell>
                  <TableCell className="max-w-md truncate text-sm text-muted-foreground">
                    {JSON.stringify(log.details)}
                  </TableCell>
                  <TableCell>{formatDateTime(log.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            No audit logs available
          </div>
        )}
      </CardContent>
    </Card>
  )
}
