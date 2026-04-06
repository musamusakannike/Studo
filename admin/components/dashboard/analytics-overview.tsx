'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { DollarSign, Users, UserCheck, Clock } from 'lucide-react'
import type { AnalyticsData } from '@/lib/types'

export function AnalyticsOverview() {
  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['analytics'],
    queryFn: async () => {
      const response = await api.get('/admin/analytics')
      return response.data.data
    },
  })

  const metrics = [
    {
      title: 'Total Revenue',
      value: data ? formatCurrency(data.totalRevenue) : '₦0',
      description: `Platform: ${data ? formatCurrency(data.platformRevenue) : '₦0'}`,
      icon: DollarSign,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      title: 'Active Students',
      value: data?.activeStudents ?? 0,
      description: 'Enrolled in courses',
      icon: Users,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'Pending Tutors',
      value: data?.pendingTutorApplications ?? 0,
      description: 'Awaiting approval',
      icon: UserCheck,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
    {
      title: 'Pending Withdrawals',
      value: data?.pendingWithdrawals ?? 0,
      description: 'Requires action',
      icon: Clock,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
  ]

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <div className={`rounded-full p-2 ${metric.bgColor}`}>
              <metric.icon className={`h-4 w-4 ${metric.iconColor}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground">{metric.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
