import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/lib/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Sparkles, 
  TrendingUp,
  AlertCircle,
} from 'lucide-react'
import { useQuery, db, tx } from '@/lib/db'
import { inngest } from '@/lib/inngest'
import { createServerFn } from '@tanstack/react-start'

// GET request (default)
export const generatePrompts = createServerFn().handler(async () => {
  await inngest.send({
    name: 'prompts/generate.requested',
    data: {
      batchSize: 50,
      category: 'daily',
    },
  })
  return { message: 'Prompt generation started!' }
})

export const Route = createFileRoute('/admin/prompts')({
  component: AdminPromptsPage,
})

function AdminPromptsPage() {
  return (
    <ProtectedRoute requirePayment>
      <AdminPromptsContent />
    </ProtectedRoute>
  )
}

function AdminPromptsContent() {
  const { user } = useAuth()
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // Query all prompts grouped by status
  const { data, isLoading, error } = useQuery({
    prompts: {},
  })

  console.log('Prompts data:', data)

  const prompts = data?.prompts || []
  
  // Group prompts by status
  const pending = prompts.filter(p => p.status === 'pending')
  const active = prompts.filter(p => p.status === 'active')
  const rejected = prompts.filter(p => p.status === 'rejected')

  /**
   * Approve a prompt
   */
  const handleApprove = async (promptId: string) => {
    try {
      setActionLoading(promptId)
      setActionError(null)

      await db.transact([
        tx.prompts[promptId].update({
          status: 'active',
        }),
      ])

      console.log(`✅ Approved prompt: ${promptId}`)
    } catch (err) {
      console.error('Error approving prompt:', err)
      setActionError(err instanceof Error ? err.message : 'Failed to approve prompt')
    } finally {
      setActionLoading(null)
    }
  }

  /**
   * Reject a prompt
   */
  const handleReject = async (promptId: string) => {
    try {
      setActionLoading(promptId)
      setActionError(null)

      await db.transact([
        tx.prompts[promptId].update({
          status: 'rejected',
        }),
      ])

      console.log(`❌ Rejected prompt: ${promptId}`)
    } catch (err) {
      console.error('Error rejecting prompt:', err)
      setActionError(err instanceof Error ? err.message : 'Failed to reject prompt')
    } finally {
      setActionLoading(null)
    }
  }

  /**
   * Trigger prompt generation
   */
  const handleGeneratePrompts = async () => {
    try {
      setIsGenerating(true)
      setActionError(null)

      // Trigger Inngest function
      await generatePrompts()

      alert('✅ Prompt generation started! Check the Inngest dashboard to monitor progress.')
    } catch (err) {
      console.error('Error triggering prompt generation:', err)
      setActionError(err instanceof Error ? err.message : 'Failed to trigger generation')
    } finally {
      setIsGenerating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md text-center p-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading prompts...</p>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load prompts. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin: Prompt Management</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Review and approve AI-generated reflection prompts
              </p>
            </div>
            <Button
              onClick={handleGeneratePrompts}
              disabled={isGenerating}
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate 50 Prompts
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Error Alert */}
          {actionError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{actionError}</AlertDescription>
            </Alert>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  Pending Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{pending.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Active
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{active.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{prompts.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Prompts */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Prompts ({pending.length})</CardTitle>
              <CardDescription>
                Review and approve these AI-generated prompts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pending.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No prompts pending review</p>
                  <p className="text-sm mt-2">Generate new prompts using the button above</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pending.map((prompt) => (
                    <div
                      key={prompt.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{prompt.promptText}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {prompt.createdBy}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(prompt.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprove(prompt.id)}
                          disabled={actionLoading === prompt.id}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          {actionLoading === prompt.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(prompt.id)}
                          disabled={actionLoading === prompt.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {actionLoading === prompt.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Prompts */}
          <Card>
            <CardHeader>
              <CardTitle>Active Prompts ({active.length})</CardTitle>
              <CardDescription>
                These prompts are being shown to users
              </CardDescription>
            </CardHeader>
            <CardContent>
              {active.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No active prompts yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {active.slice(0, 20).map((prompt) => (
                    <div
                      key={prompt.id}
                      className="p-3 border rounded-lg text-sm"
                    >
                      <p>{prompt.promptText}</p>
                    </div>
                  ))}
                  {active.length > 20 && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      ... and {active.length - 20} more
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

