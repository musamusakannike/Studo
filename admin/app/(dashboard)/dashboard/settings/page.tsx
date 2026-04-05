import { SystemSettings } from '@/components/dashboard/system-settings'
import { AuditLogs } from '@/components/dashboard/audit-logs'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">
          Configure platform settings and view audit logs
        </p>
      </div>

      <SystemSettings />
      <AuditLogs />
    </div>
  )
}
