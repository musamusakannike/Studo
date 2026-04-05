import { AnalyticsOverview } from '@/components/dashboard/analytics-overview'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { DepartmentChart } from '@/components/dashboard/department-chart'
import { UserDistributionChart } from '@/components/dashboard/user-distribution-chart'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Overview</h1>
        <p className="text-muted-foreground">
          Monitor platform performance and key metrics
        </p>
      </div>

      <AnalyticsOverview />

      <div className="grid gap-6 md:grid-cols-2">
        <RevenueChart />
        <UserDistributionChart />
      </div>

      <DepartmentChart />
    </div>
  )
}
