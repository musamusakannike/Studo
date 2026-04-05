'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { Save } from 'lucide-react'
import type { SystemConfig } from '@/lib/types'

export function SystemSettings() {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<SystemConfig>({
    tutorRegistrationFee: 5000,
    minimumWithdrawalAmount: 1000,
    courseAccessDuration: 180,
    withdrawalFeePercentage: 1,
    minimumWithdrawalFee: 100,
  })

  const { data: config, isLoading } = useQuery<SystemConfig>({
    queryKey: ['system-config'],
    queryFn: async () => {
      const response = await api.get('/admin/config')
      return response.data
    },
    onSuccess: (data) => {
      setFormData(data)
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: SystemConfig) => {
      await api.put('/admin/config', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-config'] })
      toast.success('Settings updated successfully')
    },
    onError: () => {
      toast.error('Failed to update settings')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(formData)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Global Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Global Configuration</CardTitle>
        <CardDescription>
          Manage platform-wide settings and fees
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tutor Registration Fee</label>
              <Input
                type="number"
                value={formData.tutorRegistrationFee}
                onChange={(e) =>
                  setFormData({ ...formData, tutorRegistrationFee: Number(e.target.value) })
                }
                min="0"
              />
              <p className="text-xs text-muted-foreground">
                Current: {formatCurrency(formData.tutorRegistrationFee)}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum Withdrawal Amount</label>
              <Input
                type="number"
                value={formData.minimumWithdrawalAmount}
                onChange={(e) =>
                  setFormData({ ...formData, minimumWithdrawalAmount: Number(e.target.value) })
                }
                min="0"
              />
              <p className="text-xs text-muted-foreground">
                Current: {formatCurrency(formData.minimumWithdrawalAmount)}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Course Access Duration (days)</label>
              <Input
                type="number"
                value={formData.courseAccessDuration}
                onChange={(e) =>
                  setFormData({ ...formData, courseAccessDuration: Number(e.target.value) })
                }
                min="1"
              />
              <p className="text-xs text-muted-foreground">
                Current: {formData.courseAccessDuration} days ({Math.floor(formData.courseAccessDuration / 30)} months)
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Withdrawal Fee Percentage</label>
              <Input
                type="number"
                value={formData.withdrawalFeePercentage}
                onChange={(e) =>
                  setFormData({ ...formData, withdrawalFeePercentage: Number(e.target.value) })
                }
                min="0"
                max="100"
                step="0.1"
              />
              <p className="text-xs text-muted-foreground">
                Current: {formData.withdrawalFeePercentage}%
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum Withdrawal Fee</label>
              <Input
                type="number"
                value={formData.minimumWithdrawalFee}
                onChange={(e) =>
                  setFormData({ ...formData, minimumWithdrawalFee: Number(e.target.value) })
                }
                min="0"
              />
              <p className="text-xs text-muted-foreground">
                Current: {formatCurrency(formData.minimumWithdrawalFee)}
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={updateMutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
