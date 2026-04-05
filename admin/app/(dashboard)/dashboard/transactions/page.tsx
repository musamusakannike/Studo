import { TransactionsTable } from '@/components/dashboard/transactions-table'

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
        <p className="text-muted-foreground">
          View all platform transactions and revenue logs
        </p>
      </div>

      <TransactionsTable />
    </div>
  )
}
