'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { AnalyticsData } from '@/lib/types'

const COLORS = {
  admin: 'hsl(var(--destructive))',
  tutor: 'hsl(var(--primary))',
  user: 'hsl(var(--secondary))',
}

export function UserDistributionChart() {
  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['analytics'],
    queryFn: async () => {
      const response = await api.get('/admin/analytics')
      return response.data
    },
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Distribution</CardTitle>
          <CardDescription>By role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Distribution</CardTitle>
        <CardDescription>By role</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data?.userDistribution ?? []}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ role, count }) => `${role}: ${count}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {(data?.userDistribution ?? []).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.role as keyof typeof COLORS]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
