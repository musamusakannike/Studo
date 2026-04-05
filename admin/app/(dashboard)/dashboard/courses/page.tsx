import { CoursesTable } from '@/components/dashboard/courses-table'

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Course Management</h1>
        <p className="text-muted-foreground">
          Review and moderate course content
        </p>
      </div>

      <CoursesTable />
    </div>
  )
}
