import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Building2, Users, Plus, Search, MapPin, Phone, Mail, UserPlus, ArrowRight, Upload, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthStore } from '@/stores/authStore'
import { getUserProjects, getUserCompanies, getUserEmployees, canCreateProject, canCreateCompany, canAssignEmployee } from '@/lib/permissions'
import { getProjects, getCompanies, getEmployees, getCompanyById, getEmployeesByProjectId, getCompaniesByProjectId, getDocumentRequirementsByProject, getEmployeeDocuments, getMissingDocuments, employeeDocuments as allEmployeeDocuments } from '@/lib/mockData'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

export function Organizations() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [selectedEmployee, setSelectedEmployee] = useState<string>('')
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, File>>({})
  const { user } = useAuthStore()
  const { toast } = useToast()

  if (!user) return null

  const companies = getUserCompanies(user)
  const projects = getUserProjects(user)
  const employees = getUserEmployees(user)
  const allProjects = getProjects()
  const allCompanies = getCompanies()
  const allEmployees = getEmployees()

  // Taşeron yöneticisi için havuzdaki personeller (projeye atanmamış)
  const unassignedEmployees = employees.filter((e) => e.assignedProjectIds.length === 0)

  const getCompanyTypeBadge = (type: string) => {
    const types: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      main: { label: 'Ana Firma', variant: 'default' },
      contractor: { label: 'Taşeron', variant: 'secondary' },
      subcontractor: { label: 'Alt Taşeron', variant: 'outline' },
    }
    const t = types[type] || types.contractor
    return <Badge variant={t.variant}>{t.label}</Badge>
  }

  const handleFileUpload = (requirementId: string, file: File) => {
    setUploadedDocs({ ...uploadedDocs, [requirementId]: file })
  }

  const handleAssignEmployee = () => {
    if (!selectedProject || !selectedEmployee) return

    const requirements = getDocumentRequirementsByProject(selectedProject)
    const mandatoryReqs = requirements.filter((r) => r.isMandatory)
    
    // Zorunlu evrakların hepsinin yüklendiğini kontrol et
    const missingMandatory = mandatoryReqs.filter(
      (req) => !uploadedDocs[req.id]
    )

    if (missingMandatory.length > 0) {
      toast({
        title: 'Evrak Eksikliği',
        description: `${missingMandatory.length} zorunlu evrak yüklenmedi. Lütfen tüm zorunlu evrakları yükleyin.`,
        variant: 'destructive',
      })
      return
    }

    // Mock assignment
    const employee = allEmployees.find((e) => e.id === selectedEmployee)
    if (employee && !employee.assignedProjectIds.includes(selectedProject)) {
      employee.assignedProjectIds.push(selectedProject)

      // Mock evrak kayıtlarını oluştur
      Object.entries(uploadedDocs).forEach(([reqId, file]) => {
        const requirement = requirements.find((r) => r.id === reqId)
        let expiryDate: string | undefined
        
        // Geçerlilik tarihi hesapla
        if (requirement?.hasExpiryDate && requirement.validityMonths) {
          const uploadDate = new Date()
          uploadDate.setMonth(uploadDate.getMonth() + requirement.validityMonths)
          expiryDate = uploadDate.toISOString().split('T')[0]
        }
        
        allEmployeeDocuments.push({
          id: `doc-${allEmployeeDocuments.length + 1}`,
          employeeId: selectedEmployee,
          projectId: selectedProject,
          requirementId: reqId,
          fileName: file.name,
          fileUrl: `/mock/files/${file.name}`,
          uploadedBy: user?.id || '',
          uploadedAt: new Date().toISOString(),
          expiryDate,
          status: 'pending',
        })
      })

      toast({
        title: 'Başarılı',
        description: `${employee.firstName} ${employee.lastName} projeye atandı ve evrakları yüklendi. Onay bekliyor.`,
      })

      setSelectedEmployee('')
      setSelectedProject('')
      setUploadedDocs({})
      setIsAssignDialogOpen(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organizasyon & Projeler</h1>
          <p className="text-muted-foreground mt-1">
            {user.role === 'center_manager' && 'Tüm projeler, şirketler ve personeller'}
            {user.role === 'project_manager' && 'Atandığınız projeler ve taşeronlar'}
            {user.role === 'contractor_manager' && 'Şirketinizin çalıştığı projeler ve personeller'}
          </p>
        </div>
        <div className="flex gap-2">
          {canCreateCompany(user) && (
            <Button variant="outline">
              <Building2 className="w-4 h-4 mr-2" />
              Yeni Şirket
            </Button>
          )}
          {canCreateProject(user) && (
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Proje
            </Button>
          )}
        </div>
      </div>

      {/* Role Badge */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="default" className="text-sm">
                {user.role === 'center_manager' && 'Merkez Yöneticisi'}
                {user.role === 'project_manager' && 'Proje Yöneticisi'}
                {user.role === 'contractor_manager' && 'Taşeron Yöneticisi'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {companies.length} Şirket • {projects.length} Proje • {employees.length} Personel
              </span>
            </div>
            {user.role === 'contractor_manager' && unassignedEmployees.length > 0 && (
              <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Personel Ata ({unassignedEmployees.length})
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Personel Projeye Ata ve Evrak Yükle</DialogTitle>
                    <DialogDescription>
                      Personeli projeye atamak için önce gerekli evrakları yüklemelisiniz
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Personel Seçin *</Label>
                        <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                          <SelectTrigger>
                            <SelectValue placeholder="Personel seçin..." />
                          </SelectTrigger>
                          <SelectContent>
                            {unassignedEmployees.map((emp) => (
                              <SelectItem key={emp.id} value={emp.id}>
                                {emp.firstName} {emp.lastName} - {emp.title} ({emp.employeeCode})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Proje Seçin *</Label>
                        <Select value={selectedProject} onValueChange={(value) => {
                          setSelectedProject(value)
                          setUploadedDocs({}) // Proje değişince evrakları sıfırla
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Proje seçin..." />
                          </SelectTrigger>
                          <SelectContent>
                            {projects.map((proj) => (
                              <SelectItem key={proj.id} value={proj.id}>
                                {proj.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {selectedProject && (
                      <div className="border-t pt-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Gerekli Evraklar
                        </h3>
                        <div className="space-y-3">
                          {getDocumentRequirementsByProject(selectedProject).map((req) => {
                            const isUploaded = !!uploadedDocs[req.id]
                            return (
                              <div
                                key={req.id}
                                className="p-4 rounded-lg border border-border"
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-medium">{req.name}</h4>
                                      {req.isMandatory ? (
                                        <Badge className="bg-danger text-xs">Zorunlu</Badge>
                                      ) : (
                                        <Badge variant="secondary" className="text-xs">
                                          Opsiyonel
                                        </Badge>
                                      )}
                                      {isUploaded && (
                                        <CheckCircle2 className="w-4 h-4 text-success" />
                                      )}
                                    </div>
                                    {req.description && (
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {req.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file) handleFileUpload(req.id, file)
                                    }}
                                    className="flex-1"
                                  />
                                  {isUploaded && (
                                    <span className="text-sm text-success font-medium">
                                      {uploadedDocs[req.id].name}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {/* Uyarı */}
                        {getDocumentRequirementsByProject(selectedProject).filter(
                          (r) => r.isMandatory
                        ).length > 0 && (
                          <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                            <p className="text-sm text-warning">
                              Tüm zorunlu evraklar yüklenmeden personel projeye atanamaz.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button variant="outline" onClick={() => {
                      setIsAssignDialogOpen(false)
                      setSelectedEmployee('')
                      setSelectedProject('')
                      setUploadedDocs({})
                    }}>
                      İptal
                    </Button>
                    <Button
                      onClick={handleAssignEmployee}
                      disabled={!selectedEmployee || !selectedProject}
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Projeye Ata ve Evrakları Kaydet
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList>
          <TabsTrigger value="projects">Projeler ({projects.length})</TabsTrigger>
          <TabsTrigger value="companies">Şirketler ({companies.length})</TabsTrigger>
          <TabsTrigger value="employees">Personel ({employees.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {projects.map((project) => {
              const projectCompanies = getCompaniesByProjectId(project.id)
              const projectEmployees = getEmployeesByProjectId(project.id)
              
              return (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {project.location}
                        </CardDescription>
                      </div>
                      <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                        {project.status === 'active' ? 'Aktif' : project.status === 'planning' ? 'Planlama' : 'Tamamlandı'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Şirket Sayısı</div>
                        <div className="text-2xl font-bold mt-1">{projectCompanies.length}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Toplam Personel</div>
                        <div className="text-2xl font-bold mt-1">{projectEmployees.length}</div>
                      </div>
                    </div>
                    
                    {/* Projedeki şirketler */}
                    <div className="pt-3 border-t border-border">
                      <div className="text-xs text-muted-foreground mb-2">Çalışan Şirketler:</div>
                      <div className="flex flex-wrap gap-1">
                        {projectCompanies.map((company) => (
                          <Badge key={company.id} variant="outline" className="text-xs">
                            {company.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full" size="sm">
                      Proje Detayları
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="companies" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Şirket ara..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => {
              const companyEmployees = employees.filter((e) => e.companyId === company.id)
              const companyProjects = projects.filter((p) => p.companyIds.includes(company.id))
              
              return (
                <Card key={company.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{company.name}</CardTitle>
                        <div className="mt-2">{getCompanyTypeBadge(company.type)}</div>
                      </div>
                      <Building2 className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Çalışan Sayısı</span>
                      <span className="font-semibold">{companyEmployees.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Proje Sayısı</span>
                      <span className="font-semibold">{companyProjects.length}</span>
                    </div>
                    <div className="pt-3 border-t border-border space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {company.location}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {company.contact}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        {company.phone}
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-4" size="sm">
                      Detayları Görüntüle
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Personel Listesi</CardTitle>
                  <CardDescription>
                    {user.role === 'contractor_manager' 
                      ? 'Şirketinizin tüm personeli (havuz dahil)' 
                      : 'Erişim yetkiniz olan personeller'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium">Ad Soyad</th>
                      <th className="text-left p-3 text-sm font-medium">Ünvan</th>
                      <th className="text-left p-3 text-sm font-medium">Şirket</th>
                      <th className="text-left p-3 text-sm font-medium">Atandığı Proje</th>
                      <th className="text-left p-3 text-sm font-medium">Durum</th>
                      <th className="text-right p-3 text-sm font-medium">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((employee) => {
                      const company = getCompanyById(employee.companyId)
                      const assignedProjects = allProjects.filter((p) => 
                        employee.assignedProjectIds.includes(p.id)
                      )
                      
                      return (
                        <tr key={employee.id} className="border-t border-border hover:bg-accent/50">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Users className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <span className="font-medium">{employee.firstName} {employee.lastName}</span>
                                <div className="text-xs text-muted-foreground">{employee.employeeCode}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">{employee.title}</td>
                          <td className="p-3 text-sm">{company?.name}</td>
                          <td className="p-3 text-sm">
                            {assignedProjects.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {assignedProjects.map((proj) => (
                                  <Badge key={proj.id} variant="outline" className="text-xs">
                                    {proj.name.split('-')[0].trim()}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <Badge variant="secondary" className="text-xs">Havuzda</Badge>
                            )}
                          </td>
                          <td className="p-3">
                            <Badge variant="default" className="bg-success">Aktif</Badge>
                          </td>
                          <td className="p-3 text-right">
                            <Button variant="ghost" size="sm">Detay</Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
