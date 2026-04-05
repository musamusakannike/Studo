import { TutorApplications } from '@/components/dashboard/tutor-applications'

export default function TutorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tutor Management</h1>
        <p className="text-muted-foreground">
          Review and approve tutor applications
        </p>
      </div>

      <TutorApplications />
    </div>
  )
}
