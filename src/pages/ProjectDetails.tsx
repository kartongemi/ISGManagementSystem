import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  Briefcase, 
  Edit,
  Save,
  X,
  Building2,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserMinus,
  Plus,
  ExternalLink,
  MapPin,
  Calendar,
  User,
  XCircle
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { canManageProjects } from '@/lib/permissions'
import { 
  projects as allProjects,
  getProjectById,
  getCompanies,
  getCustomerById,
  getUserById,
  getEmployeesByProjectId,
  getCompanyById,
  getDocumentRequirementsByProject,
  getEmployeeDocuments,
  getMissingDocuments,
  employees as allEmployees
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'

interface ProjectDetailsProps {
  projectId: string
  onBack: () => void
}

export function ProjectDetails({ projectId, onBack }: ProjectDetailsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false)
  const [isRemoveEmployeeOpen, setIsRemoveEmployeeOpen] = useState(false)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('')
  const [exitReason, setExitReason] = useState('')
  const [exitDate, setExitDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('')
  const [editedProject, setEditedProject] = useState<any>(null)

  const { user } = useAuthStore()
  const { toast } = useToast()

  if (!user) return null

  const project = getProjectById(projectId)
  if (!project) {
    return (
      <div className="p-6">
        <Card className="border-danger">
          <CardContent className="p-6">
            <p className="text-danger">Proje bulunamadı</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const customer = project.customerId ? getCustomerById(project.customerId) : null
  const projectManager = project.projectManagerId ? getUserById(project.projectManagerId) : null
  const projectCompanies = getCompanies().filter((c) => project.companyIds.includes(c.id))
  const projectEmployees = getEmployeesByProjectId(project.id)
  const allCompanies = getCompanies()
  const availableCompanies = allCompanies.filter((c) => !project.companyIds.includes(c.id))

  // Şirket bazlı personel grupları
  const employeesByCompany = projectCompanies.map((company) => ({
    company,
    employees: projectEmployees.filter((e) => e.companyId === company.id),
  }))

  const handleStartEdit = () => {
    setEditedProject({ ...project })
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setEditedProject(null)
    setIsEditing(false)
  }

  const handleSaveEdit = () => {
    if (!editedProject) return

    const original = getProjectById(projectId)
    if (original) {
      Object.assign(original, editedProject)
      original.updatedAt = new Date().toISOString()
    }

    toast({
      title: 'Proje Güncellendi',
      description: 'Proje bilgileri başarıyla kaydedildi.',
    })

    setIsEditing(false)
    setEditedProject(null)
  }

  const handleAddCompany = () => {
    if (!selectedCompanyId) return

    project.companyIds.push(selectedCompanyId)
    project.updatedAt = new Date().toISOString()

    const company = getCompanyById(selectedCompanyId)
    toast({
      title: 'Taşeron Eklendi',
      description: `${company?.name} projeye eklendi.`,
    })

    setIsAddCompanyOpen(false)
    setSelectedCompanyId('')
  }

  const handleRemoveCompany = (companyId: string) => {
    const company = getCompanyById(companyId)
    const companyEmployees = projectEmployees.filter((e) => e.companyId === companyId)

    if (companyEmployees.length > 0) {
      toast({
        title: 'İşlem Başarısız',
        description: `${company?.name} şirketinin bu projede ${companyEmployees.length} personeli var. Önce personelleri çıkarın.`,
        variant: 'destructive',
      })
      return
    }

    const index = project.companyIds.indexOf(companyId)
    if (index > -1) {
      project.companyIds.splice(index, 1)
      project.updatedAt = new Date().toISOString()

      toast({
        title: 'Taşeron Çıkarıldı',
        description: `${company?.name} projeden çıkarıldı.`,
      })
    }
  }

  const handleRemoveEmployee = () => {
    if (!selectedEmployeeId || !exitReason) {
      toast({
        title: 'Hata',
        description: 'Çıkış nedeni girilmelidir.',
        variant: 'destructive',
      })
      return
    }

    const employee = allEmployees.find((e) => e.id === selectedEmployeeId)
    if (!employee) return

    // Projeyi assigned listesinden çıkar
    const index = employee.assignedProjectIds.indexOf(projectId)
    if (index > -1) {
      employee.assignedProjectIds.splice(index, 1)
    }

    // Çıkış bilgilerini kaydet
    if (!employee.projectExitDates) employee.projectExitDates = {}
    if (!employee.projectExitReasons) employee.projectExitReasons = {}
    
    employee.projectExitDates[projectId] = exitDate
    employee.projectExitReasons[projectId] = exitReason
    employee.status = 'inactive'
    employee.updatedAt = new Date().toISOString()

    toast({
      title: 'Personel Projeden Çıkarıldı',
      description: `${employee.firstName} ${employee.lastName} projeden çıkarıldı ve pasif yapıldı.`,
    })

    setIsRemoveEmployeeOpen(false)
    setSelectedEmployeeId('')
    setExitReason('')
    setExitDate(new Date().toISOString().split('T')[0])
  }

  const getEmployeeDocumentStatus = (employeeId: string) => {
    const requirements = getDocumentRequirementsByProject(projectId)
    const documents = getEmployeeDocuments(employeeId, projectId)
    const missing = getMissingDocuments(employeeId, projectId)

    const mandatoryCount = requirements.filter((r) => r.isMandatory).length
    const uploadedMandatory = documents.filter((d) => 
      requirements.find((r) => r.id === d.requirementId && r.isMandatory)
    ).length

    const pending = documents.filter((d) => d.status === 'pending').length
    const approved = documents.filter((d) => d.status === 'approved').length
    const rejected = documents.filter((d) => d.status === 'rejected').length

    return {
      total: requirements.length,
      uploaded: documents.length,
      missing: missing.length,
      mandatoryCount,
      uploadedMandatory,
      pending,
      approved,
      rejected,
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      planning: <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" /> Planlama</Badge>,
      waiting: <Badge variant="outline" className="gap-1"><Clock className="w-3 h-3" /> Beklemede</Badge>,
      ongoing: <Badge className="bg-success gap-1"><CheckCircle2 className="w-3 h-3" /> Devam Ediyor</Badge>,
      completed: <Badge variant="default" className="gap-1"><CheckCircle2 className="w-3 h-3" /> Tamamlandı</Badge>,
    }
    return variants[status as keyof typeof variants]
  }

  const displayProject = isEditing && editedProject ? editedProject : project

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onBack}>
              ← Geri
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{displayProject.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{displayProject.projectCode}</Badge>
                {getStatusBadge(displayProject.status)}
                <Badge variant="secondary">{displayProject.type}</Badge>
              </div>
            </div>
          </div>
        </div>
        {canManageProjects(user) && !isEditing && (
          <Button onClick={handleStartEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Düzenle
          </Button>
        )}
        {isEditing && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancelEdit}>
              <X className="w-4 h-4 mr-2" />
              İptal
            </Button>
            <Button onClick={handleSaveEdit}>
              <Save className="w-4 h-4 mr-2" />
              Kaydet
            </Button>
          </div>
        )}
      </div>

      {/* Project Info */}
      <Card>
        <CardHeader>
          <CardTitle>Proje Bilgileri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Proje Adı</Label>
                  <Input
                    value={editedProject?.name || ''}
                    onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Proje Türü</Label>
                  <Input
                    value={editedProject?.type || ''}
                    onChange={(e) => setEditedProject({ ...editedProject, type: e.target.value })}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Açıklama</Label>
                  <Textarea
                    value={editedProject?.description || ''}
                    onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>İl</Label>
                  <Input
                    value={editedProject?.address.city || ''}
                    onChange={(e) => setEditedProject({ 
                      ...editedProject, 
                      address: { ...editedProject.address, city: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>İlçe</Label>
                  <Input
                    value={editedProject?.address.district || ''}
                    onChange={(e) => setEditedProject({ 
                      ...editedProject, 
                      address: { ...editedProject.address, district: e.target.value }
                    })}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Detay Adres</Label>
                  <Textarea
                    value={editedProject?.address.detail || ''}
                    onChange={(e) => setEditedProject({ 
                      ...editedProject, 
                      address: { ...editedProject.address, detail: e.target.value }
                    })}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Durum</Label>
                  <Select
                    value={editedProject?.status || 'planning'}
                    onValueChange={(value) => setEditedProject({ ...editedProject, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planlama</SelectItem>
                      <SelectItem value="waiting">Beklemede</SelectItem>
                      <SelectItem value="ongoing">Devam Ediyor</SelectItem>
                      <SelectItem value="completed">Tamamlandı</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Açıklama</p>
                <p className="mt-1">{displayProject.description}</p>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Adres</p>
                  <p className="mt-1">
                    {displayProject.address.detail}, {displayProject.address.district}/{displayProject.address.city}
                  </p>
                </div>
              </div>
              {customer && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Müşteri</p>
                    <p className="mt-1 font-medium">{customer.name}</p>
                  </div>
                </div>
              )}
              {projectManager && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Proje Yöneticisi</p>
                    <p className="mt-1 font-medium">
                      {projectManager.firstName} {projectManager.lastName}
                    </p>
                  </div>
                </div>
              )}
              {/* Dates */}
              {(project.dates.planningStart || project.dates.actualStart || project.dates.plannedEnd || project.dates.actualEnd) && (
                <div className="pt-3 border-t">
                  <div className="grid grid-cols-2 gap-3">
                    {project.dates.planningStart && (
                      <div>
                        <p className="text-sm text-muted-foreground">Planlama Başlangıç</p>
                        <p className="mt-1 font-medium">
                          {new Date(project.dates.planningStart).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    )}
                    {project.dates.actualStart && (
                      <div>
                        <p className="text-sm text-muted-foreground">Fiili Başlangıç</p>
                        <p className="mt-1 font-medium">
                          {new Date(project.dates.actualStart).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    )}
                    {project.dates.plannedEnd && (
                      <div>
                        <p className="text-sm text-muted-foreground">Planlanan Bitiş</p>
                        <p className="mt-1 font-medium">
                          {new Date(project.dates.plannedEnd).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    )}
                    {project.dates.actualEnd && (
                      <div>
                        <p className="text-sm text-muted-foreground">Fiili Bitiş</p>
                        <p className="mt-1 font-medium">
                          {new Date(project.dates.actualEnd).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taşeron Sayısı</p>
                <p className="text-3xl font-bold mt-2">{projectCompanies.length}</p>
              </div>
              <Building2 className="w-10 h-10 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Personel</p>
                <p className="text-3xl font-bold mt-2">{projectEmployees.length}</p>
              </div>
              <Users className="w-10 h-10 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Evrak Gereksinimleri</p>
                <p className="text-3xl font-bold mt-2">
                  {getDocumentRequirementsByProject(projectId).length}
                </p>
              </div>
              <FileText className="w-10 h-10 text-info" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="companies">
        <TabsList>
          <TabsTrigger value="companies">Taşeronlar ({projectCompanies.length})</TabsTrigger>
          <TabsTrigger value="personnel">Personel ({projectEmployees.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Taşeron Şirketler</CardTitle>
                {canManageProjects(user) && (
                  <Dialog open={isAddCompanyOpen} onOpenChange={setIsAddCompanyOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Taşeron Ekle
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Projeye Taşeron Ekle</DialogTitle>
                        <DialogDescription>
                          Bu projede çalışacak taşeron şirketi seçin
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Taşeron Şirket</Label>
                          <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Şirket seçin..." />
                            </SelectTrigger>
                            <SelectContent>
                              {availableCompanies.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.name} - {c.type === 'contractor' ? 'Taşeron' : 'Alt Taşeron'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddCompanyOpen(false)}>
                          İptal
                        </Button>
                        <Button onClick={handleAddCompany} disabled={!selectedCompanyId}>
                          Ekle
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {projectCompanies.map((company) => {
                  const companyEmployees = projectEmployees.filter((e) => e.companyId === company.id)
                  return (
                    <div
                      key={company.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50"
                    >
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{company.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {companyEmployees.length} personel
                          </p>
                        </div>
                      </div>
                      {canManageProjects(user) && company.type !== 'main' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCompany(company.id)}
                        >
                          <XCircle className="w-4 h-4 text-danger" />
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personnel" className="space-y-4">
          {employeesByCompany.map(({ company, employees }) => (
            <Card key={company.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  {company.name}
                  <Badge variant="outline">{employees.length} personel</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {employees.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Bu şirketten henüz personel atanmamış
                  </p>
                ) : (
                  <div className="space-y-3">
                    {employees.map((employee) => {
                      const docStatus = getEmployeeDocumentStatus(employee.id)
                      const hasDocumentIssues = docStatus.missing.length > 0 || docStatus.rejected > 0
                      const exitDate = employee.projectExitDates?.[projectId]
                      const exitReason = employee.projectExitReasons?.[projectId]

                      return (
                        <div
                          key={employee.id}
                          className="p-4 rounded-lg border border-border hover:bg-accent/50"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">
                                  {employee.firstName} {employee.lastName}
                                </h4>
                                <Badge variant="outline" className="text-xs">
                                  {employee.employeeCode}
                                </Badge>
                                {employee.status === 'inactive' && (
                                  <Badge variant="secondary">Pasif</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">
                                {employee.title}
                              </p>

                              {/* Document Status */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-4 text-xs">
                                  <div className="flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    <span className="text-muted-foreground">
                                      Evrak: {docStatus.uploaded}/{docStatus.total}
                                    </span>
                                  </div>
                                  {docStatus.pending > 0 && (
                                    <div className="flex items-center gap-1 text-warning">
                                      <Clock className="w-3 h-3" />
                                      <span>{docStatus.pending} bekliyor</span>
                                    </div>
                                  )}
                                  {docStatus.approved > 0 && (
                                    <div className="flex items-center gap-1 text-success">
                                      <CheckCircle2 className="w-3 h-3" />
                                      <span>{docStatus.approved} onaylı</span>
                                    </div>
                                  )}
                                  {docStatus.rejected > 0 && (
                                    <div className="flex items-center gap-1 text-danger">
                                      <XCircle className="w-3 h-3" />
                                      <span>{docStatus.rejected} reddedildi</span>
                                    </div>
                                  )}
                                </div>

                                {hasDocumentIssues && (
                                  <div className="flex items-center gap-2 text-xs text-warning">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>
                                      {docStatus.missing.length > 0 && `${docStatus.missing.length} evrak eksik`}
                                      {docStatus.missing.length > 0 && docStatus.rejected > 0 && ', '}
                                      {docStatus.rejected > 0 && `${docStatus.rejected} evrak reddedildi`}
                                    </span>
                                  </div>
                                )}

                                {/* Exit Info */}
                                {exitDate && (
                                  <div className="mt-2 p-2 rounded bg-muted text-xs">
                                    <p className="font-medium mb-1">Projeden Çıkış Bilgisi:</p>
                                    <p>
                                      <strong>Tarih:</strong> {new Date(exitDate).toLocaleDateString('tr-TR')}
                                    </p>
                                    {exitReason && (
                                      <p>
                                        <strong>Neden:</strong> {exitReason}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Personel evrak detayına git
                                  toast({
                                    title: 'Özellik Geliştiriliyor',
                                    description: 'Personel evrak detay sayfası yakında eklenecek.',
                                  })
                                }}
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Evraklar
                              </Button>
                              {canManageProjects(user) && !exitDate && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedEmployeeId(employee.id)
                                    setIsRemoveEmployeeOpen(true)
                                  }}
                                >
                                  <UserMinus className="w-4 h-4 text-danger" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {projectEmployees.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Henüz projeye personel atanmamış
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Remove Employee Dialog */}
      <Dialog open={isRemoveEmployeeOpen} onOpenChange={setIsRemoveEmployeeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Personeli Projeden Çıkar</DialogTitle>
            <DialogDescription>
              Personel projeden çıkarılacak ve pasif yapılacaktır
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Çıkış Tarihi *</Label>
              <Input
                type="date"
                value={exitDate}
                onChange={(e) => setExitDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Çıkış Nedeni *</Label>
              <Textarea
                dir="ltr"
                placeholder="Personelin projeden çıkış nedenini girin..."
                value={exitReason}
                onChange={(e) => setExitReason(e.target.value)}
                rows={3}
              />
            </div>
            <div className="p-3 rounded bg-warning/10 border border-warning/20 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <p className="text-sm text-warning">
                Bu işlem sonrası personel pasif duruma geçecektir. Çıkış tarihi ve nedeni kalıcı olarak kaydedilecektir.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRemoveEmployeeOpen(false)
                setSelectedEmployeeId('')
                setExitReason('')
                setExitDate(new Date().toISOString().split('T')[0])
              }}
            >
              İptal
            </Button>
            <Button variant="destructive" onClick={handleRemoveEmployee}>
              <UserMinus className="w-4 h-4 mr-2" />
              Projeden Çıkar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
