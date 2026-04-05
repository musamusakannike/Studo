import { UsersTable } from '@/components/dashboard/users-table'

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Manage all platform users and their roles
        </p>
      </div>

      <UsersTable />
    </div>
  )
}
