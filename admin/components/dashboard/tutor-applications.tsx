'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CheckCircle, XCircle, Eye } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import type { User } from '@/lib/types'
import Image from 'next/image'

export function TutorApplications() {
  const [selectedTutor, setSelectedTutor] = useState<User | null>(null)
  const [viewDialog, setViewDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const queryClient = useQueryClient()

  const { data: applications, isLoading } = useQuery<User[]>({
    queryKey: ['tutor-applications'],
    queryFn: async () => {
      const response = await api.get('/admin/tutors/pending')
      return response.data
    },
  })

  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.post(`/admin/tutors/${userId}/approve`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutor-applications'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      toast.success('Tutor application approved')
      setViewDialog(false)
      setSelectedTutor(null)
    },
    onError: () => {
      toast.error('Failed to approve application')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      await api.post(`/admin/tutors/${userId}/reject`, { reason })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutor-applications'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      toast.success('Tutor application rejected')
      setViewDialog(false)
      setSelectedTutor(null)
      setRejectReason('')
    },
    onError: () => {
      toast.error('Failed to reject application')
    },
  })

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Pending Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : applications && applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((tutor) => (
                <div
                  key={tutor._id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      {tutor.profileImage ? (
                        <Image
                          src={tutor.profileImage}
                          alt={tutor.fullName}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      ) : (
                        <span className="text-lg font-semibold">
                          {tutor.fullName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{tutor.fullName}</h3>
                      <p className="text-sm text-muted-foreground">{tutor.email}</p>
                      <div className="mt-1 flex gap-2">
                        {tutor.tutorApplicationDetails?.expertise?.map((exp) => (
                          <Badge key={exp} variant="secondary" className="text-xs">
                            {exp}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {formatDate(tutor.tutorApplicationDetails?.appliedAt || tutor.createdAt)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTutor(tutor)
                        setViewDialog(true)
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              No pending applications
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={viewDialog} onOpenChange={setViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tutor Application Review</DialogTitle>
            <DialogDescription>
              Review the application details before making a decision
            </DialogDescription>
          </DialogHeader>

          {selectedTutor && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <p className="text-sm text-muted-foreground">{selectedTutor.fullName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-muted-foreground">{selectedTutor.email}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Bio</label>
                <p className="text-sm text-muted-foreground">
                  {selectedTutor.tutorApplicationDetails?.bio || 'No bio provided'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Expertise</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {selectedTutor.tutorApplicationDetails?.expertise?.map((exp) => (
                    <Badge key={exp} variant="secondary">
                      {exp}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Qualifications</label>
                <p className="text-sm text-muted-foreground">
                  {selectedTutor.tutorApplicationDetails?.qualifications || 'Not provided'}
                </p>
              </div>

              <div className="border-t pt-4">
                <label className="text-sm font-medium">Rejection Reason (if rejecting)</label>
                <Input
                  placeholder="Enter reason for rejection..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setViewDialog(false)
                setRejectReason('')
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                selectedTutor &&
                rejectMutation.mutate({ userId: selectedTutor._id, reason: rejectReason })
              }
              disabled={rejectMutation.isPending || !rejectReason}
            >
              <XCircle className="mr-2 h-4 w-4" />
              {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
            </Button>
            <Button
              onClick={() => selectedTutor && approveMutation.mutate(selectedTutor._id)}
              disabled={approveMutation.isPending}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {approveMutation.isPending ? 'Approving...' : 'Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
