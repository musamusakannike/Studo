import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PastQuestionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Past Questions Management</h1>
        <p className="text-muted-foreground">
          Manage crowdsourced past questions and answers
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Past Questions Bank</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center text-muted-foreground">
            Past questions management interface
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
