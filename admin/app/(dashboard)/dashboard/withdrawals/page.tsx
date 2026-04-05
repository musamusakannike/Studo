import { WithdrawalsTable } from '@/components/dashboard/withdrawals-table'

export default function WithdrawalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Withdrawal Management</h1>
        <p className="text-muted-foreground">
          Process pending withdrawal requests
        </p>
      </div>

      <WithdrawalsTable />
    </div>
  )
}
