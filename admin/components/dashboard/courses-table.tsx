'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Search, Eye, CheckCircle, XCircle } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import type { Course } from '@/lib/types'

export function CoursesTable() {
  const [search, setSearch] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [viewDialog, setViewDialog] = useState(false)
  const queryClient = useQueryClient()

  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ['courses', search],
    queryFn: async () => {
      const response = await api.get('/admin/courses', { params: { search } })
      return response.data
    },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ courseId, isActive }: { courseId: string; isActive: boolean }) => {
      await api.patch(`/admin/courses/${courseId}/toggle-active`, { isActive })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      toast.success('Course status updated')
      setViewDialog(false)
    },
    onError: () => {
      toast.error('Failed to update course status')
    },
  })

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Courses</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses?.map((course) => (
                  <TableRow key={course._id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>{course.courseCode}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{course.level}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(course.price)}</TableCell>
                    <TableCell>{course.totalStudents}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span>{course.averageRating.toFixed(1)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {course.isActive ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(course.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedCourse(course)
                          setViewDialog(true)
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={viewDialog} onOpenChange={setViewDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Course Details</DialogTitle>
            <DialogDescription>
              Review course content and manage status
            </DialogDescription>
          </DialogHeader>

          {selectedCourse && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <p className="text-sm text-muted-foreground">{selectedCourse.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Course Code</label>
                  <p className="text-sm text-muted-foreground">{selectedCourse.courseCode}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm text-muted-foreground">{selectedCourse.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Level</label>
                  <p className="text-sm text-muted-foreground">{selectedCourse.level}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Price</label>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(selectedCourse.price)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Students</label>
                  <p className="text-sm text-muted-foreground">{selectedCourse.totalStudents}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Lessons ({selectedCourse.lessons.length})</label>
                <div className="mt-2 space-y-2">
                  {selectedCourse.lessons.map((lesson, idx) => (
                    <div key={idx} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{lesson.title}</h4>
                        <Badge variant={lesson.isActive ? 'default' : 'secondary'}>
                          {lesson.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{lesson.description}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {lesson.contents.length} content items
                        {lesson.quiz && `, ${lesson.quiz.questions.length} quiz questions`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialog(false)}>
              Close
            </Button>
            {selectedCourse && (
              <Button
                variant={selectedCourse.isActive ? 'destructive' : 'default'}
                onClick={() =>
                  toggleActiveMutation.mutate({
                    courseId: selectedCourse._id,
                    isActive: !selectedCourse.isActive,
                  })
                }
                disabled={toggleActiveMutation.isPending}
              >
                {selectedCourse.isActive ? (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Activate
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
