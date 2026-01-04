import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  FileCheck, 
  CheckCircle2, 
  XCircle,
  Clock,
  Shield,
  User,
  FileText,
  Eye,
  AlertTriangle,
  Download
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { canApproveDocuments, getUserProjects } from '@/lib/permissions'
import { 
  employeeDocuments as allEmployeeDocuments,
  getEmployeeById, 
  getProjectById,
  getDocumentRequirementsByProject,
  getSystemUsers
} from '@/lib/mockData'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function DocumentApproval() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [notes, setNotes] = useState('')
  
  const { user } = useAuthStore()
  const { toast } = useToast()

  if (!user) return null

  // Yetki kontrolü
  if (!canApproveDocuments(user)) {
    return (
      <div className="p-6">
        <Card className="border-danger">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-danger">
              <Shield className="w-8 h-8" />
              <div>
                <h2 className="text-xl font-bold">Erişim Engellendi</h2>
                <p className="text-muted-foreground mt-1">
                  Evrak onay sayfasına sadece merkez yöneticileri, proje yöneticileri ve İSG uzmanları erişebilir.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const projects = getUserProjects(user)
  const selectedProject = projects.find((p) => p.id === selectedProjectId)
  const systemUsers = getSystemUsers()
  
  // Seçili projeye ait evraklar
  const pendingDocs = allEmployeeDocuments.filter(
    (d) => d.projectId === selectedProjectId && d.status === 'pending'
  )
  const approvedDocs = allEmployeeDocuments.filter(
    (d) => d.projectId === selectedProjectId && d.status === 'approved'
  )
  const rejectedDocs = allEmployeeDocuments.filter(
    (d) => d.projectId === selectedProjectId && d.status === 'rejected'
  )

  const handleApprove = (docId: string) => {
    const doc = allEmployeeDocuments.find((d) => d.id === docId)
    if (!doc) return

    doc.status = 'approved'
    doc.reviewedBy = user.id
    doc.reviewedAt = new Date().toISOString()
    doc.notes = notes

    toast({
      title: 'Evrak Onaylandı',
      description: `${doc.fileName} başarıyla onaylandı.`,
    })

    setNotes('')
    setSelectedDocument(null)
  }

  const handleReject = (docId: string) => {
    const doc = allEmployeeDocuments.find((d) => d.id === docId)
    if (!doc || !rejectionReason) {
      toast({
        title: 'Hata',
        description: 'Red nedeni girilmelidir.',
        variant: 'destructive',
      })
      return
    }

    doc.status = 'rejected'
    doc.reviewedBy = user.id
    doc.reviewedAt = new Date().toISOString()
    doc.rejectionReason = rejectionReason
    doc.notes = notes

    toast({
      title: 'Evrak Reddedildi',
      description: `${doc.fileName} reddedildi. Taşeron firma bilgilendirildi.`,
      variant: 'destructive',
    })

    setRejectionReason('')
    setNotes('')
    setSelectedDocument(null)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: <Badge className="bg-warning text-warning-foreground gap-1"><Clock className="w-3 h-3" /> Bekliyor</Badge>,
      approved: <Badge className="bg-success gap-1"><CheckCircle2 className="w-3 h-3" /> Onaylandı</Badge>,
      rejected: <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" /> Reddedildi</Badge>,
    }
    return variants[status as keyof typeof variants]
  }

  const DocumentCard = ({ doc, showActions = true }: { doc: typeof allEmployeeDocuments[0], showActions?: boolean }) => {
    const employee = getEmployeeById(doc.employeeId)
    const requirement = getDocumentRequirementsByProject(doc.projectId).find((r) => r.id === doc.requirementId)
    const uploader = systemUsers.find((u) => u.id === doc.uploadedBy)
    const reviewer = doc.reviewedBy ? systemUsers.find((u) => u.id === doc.reviewedBy) : null

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-primary" />
                <h4 className="font-semibold">{requirement?.name}</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Personel: <strong className="text-foreground">{employee?.firstName} {employee?.lastName} ({employee?.employeeCode})</strong>
              </p>
            </div>
            {getStatusBadge(doc.status)}
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Dosya:</span>
              <code className="bg-muted px-2 py-1 rounded">{doc.fileName}</code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Yükleyen:</span>
              <span>{uploader?.firstName} {uploader?.lastName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Yüklenme:</span>
              <span>{new Date(doc.uploadedAt).toLocaleString('tr-TR')}</span>
            </div>
            {doc.reviewedBy && reviewer && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">İnceleyem:</span>
                  <span>{reviewer.firstName} {reviewer.lastName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">İnceleme:</span>
                  <span>{new Date(doc.reviewedAt!).toLocaleString('tr-TR')}</span>
                </div>
              </>
            )}
            {doc.rejectionReason && (
              <div className="mt-2 p-2 rounded bg-danger/10 border border-danger/20">
                <p className="text-xs text-danger font-medium mb-1">Red Nedeni:</p>
                <p className="text-xs text-danger">{doc.rejectionReason}</p>
              </div>
            )}
            {doc.notes && (
              <div className="mt-2 p-2 rounded bg-muted">
                <p className="text-xs text-muted-foreground font-medium mb-1">Not:</p>
                <p className="text-xs">{doc.notes}</p>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" className="flex-1">
              <Eye className="w-3 h-3 mr-1" />
              Görüntüle
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Download className="w-3 h-3 mr-1" />
              İndir
            </Button>
            {showActions && doc.status === 'pending' && (
              <Dialog open={selectedDocument === doc.id} onOpenChange={(open) => !open && setSelectedDocument(null)}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={() => setSelectedDocument(doc.id)}>
                    İncele
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Evrak İnceleme</DialogTitle>
                    <DialogDescription>
                      {doc.fileName} - {employee?.name}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="p-4 rounded bg-muted">
                      <p className="text-sm font-medium mb-2">Evrak Bilgileri</p>
                      <div className="space-y-1 text-xs">
                        <p><strong>Gereksinim:</strong> {requirement?.name}</p>
                        <p><strong>Personel:</strong> {employee?.firstName} {employee?.lastName} ({employee?.employeeCode})</p>
                        <p><strong>Dosya:</strong> {doc.fileName}</p>
                        <p><strong>Yükleyen:</strong> {uploader?.firstName} {uploader?.lastName}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>İnceleme Notu (Opsiyonel)</Label>
                      <Textarea
                        dir="ltr"
                        placeholder="Evrakla ilgili notlarınızı ekleyin..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Red Nedeni (Sadece reddedilirse)</Label>
                      <Textarea
                        dir="ltr"
                        placeholder="Eğer evrakı reddedecekseniz, nedeni açıklayın..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button
                      variant="destructive"
                      onClick={() => handleReject(doc.id)}
                      disabled={!rejectionReason}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reddet
                    </Button>
                    <Button onClick={() => handleApprove(doc.id)}>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Onayla
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Evrak Onay Sistemi</h1>
        <p className="text-muted-foreground mt-1">
          Personel evraklarını inceleyin, onaylayın veya reddedin
        </p>
      </div>

      {/* Proje Seçimi */}
      <Card>
        <CardHeader>
          <CardTitle>Proje Seçin</CardTitle>
          <CardDescription>
            Evrakları incelemek için bir proje seçin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger>
              <SelectValue placeholder="Proje seçin..." />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name} ({project.projectCode})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedProject && (
        <>
          {/* İstatistikler */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Onay Bekleyen</p>
                    <p className="text-3xl font-bold mt-2 text-warning">{pendingDocs.length}</p>
                  </div>
                  <Clock className="w-10 h-10 text-warning" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Onaylanan</p>
                    <p className="text-3xl font-bold mt-2 text-success">{approvedDocs.length}</p>
                  </div>
                  <CheckCircle2 className="w-10 h-10 text-success" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Reddedilen</p>
                    <p className="text-3xl font-bold mt-2 text-danger">{rejectedDocs.length}</p>
                  </div>
                  <XCircle className="w-10 h-10 text-danger" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Uyarı */}
          {pendingDocs.length > 0 && (
            <Card className="border-warning bg-warning/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  <div>
                    <h3 className="font-semibold text-warning">İnceleme Bekleyen Evraklar Var</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {pendingDocs.length} evrak incelemenizi bekliyor. Lütfen en kısa sürede inceleyin.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Evraklar */}
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">
                Onay Bekleyen ({pendingDocs.length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Onaylanan ({approvedDocs.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Reddedilen ({rejectedDocs.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4 mt-4">
              {pendingDocs.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Tüm Evraklar İncelendi</h3>
                    <p className="text-muted-foreground">
                      Bu projede onay bekleyen evrak bulunmuyor
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {pendingDocs.map((doc) => (
                    <DocumentCard key={doc.id} doc={doc} showActions={true} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4 mt-4">
              {approvedDocs.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <CheckCircle2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Henüz onaylanmış evrak bulunmuyor
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {approvedDocs.map((doc) => (
                    <DocumentCard key={doc.id} doc={doc} showActions={false} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4 mt-4">
              {rejectedDocs.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <XCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Reddedilmiş evrak bulunmuyor
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {rejectedDocs.map((doc) => (
                    <DocumentCard key={doc.id} doc={doc} showActions={false} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}

      {!selectedProject && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Proje Seçin</h3>
            <p className="text-muted-foreground">
              Evrakları görüntülemek için yukarıdan bir proje seçin
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
