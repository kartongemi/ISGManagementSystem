import { useState } from 'react'
import { ProjectDetails } from './ProjectDetails'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  Briefcase, 
  Plus, 
  Search, 
  MapPin,
  Calendar,
  Building2,
  User,
  Shield,
  Edit,
  Clock,
  CheckCircle2,
  Pause,
  PlayCircle
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { canManageProjects } from '@/lib/permissions'
import { projects as allProjects, generateProjectCode, getCustomers, getSystemUsers, getCompanies } from '@/lib/mockData'
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

export function ProjectManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [newProjectData, setNewProjectData] = useState({
    name: '',
    customerId: '',
    projectManagerId: '',
    type: '',
    description: '',
    city: '',
    district: '',
    addressDetail: '',
    status: 'planning' as 'planning' | 'waiting' | 'ongoing' | 'completed',
    planningStart: '',
    actualStart: '',
    plannedEnd: '',
    actualEnd: '',
  })

  const { user } = useAuthStore()
  const { toast } = useToast()
  const customers = getCustomers()
  const systemUsers = getSystemUsers()
  const companies = getCompanies()

  if (!user) return null

  // Eğer proje seçiliyse, proje detay sayfasını göster
  if (selectedProjectId) {
    return <ProjectDetails projectId={selectedProjectId} onBack={() => setSelectedProjectId(null)} />
  }

  // Yetki kontrolü
  if (!canManageProjects(user)) {
    return (
      <div className="p-6">
        <Card className="border-danger">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-danger">
              <Shield className="w-8 h-8" />
              <div>
                <h2 className="text-xl font-bold">Erişim Engellendi</h2>
                <p className="text-muted-foreground mt-1">
                  Proje yönetimi sayfasına sadece merkez yöneticileri erişebilir.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Filtrele
  const filteredProjects = allProjects.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const variants = {
      planning: <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" /> Planlama</Badge>,
      waiting: <Badge variant="outline" className="gap-1"><Pause className="w-3 h-3" /> Beklemede</Badge>,
      ongoing: <Badge className="bg-success gap-1"><PlayCircle className="w-3 h-3" /> Devam Ediyor</Badge>,
      completed: <Badge variant="default" className="gap-1"><CheckCircle2 className="w-3 h-3" /> Tamamlandı</Badge>,
    }
    return variants[status as keyof typeof variants] || variants.planning
  }

  const handleCreateProject = () => {
    const newProject = {
      id: `proj-${allProjects.length + 1}`,
      name: newProjectData.name,
      projectCode: generateProjectCode(),
      customerId: newProjectData.customerId || undefined,
      projectManagerId: newProjectData.projectManagerId || undefined,
      type: newProjectData.type,
      description: newProjectData.description,
      address: {
        city: newProjectData.city,
        district: newProjectData.district,
        detail: newProjectData.addressDetail,
      },
      status: newProjectData.status,
      dates: {
        planningStart: newProjectData.planningStart || undefined,
        actualStart: newProjectData.actualStart || undefined,
        plannedEnd: newProjectData.plannedEnd || undefined,
        actualEnd: newProjectData.actualEnd || undefined,
      },
      companyIds: ['comp-1'], // Başlangıçta sadece ana firma
      createdAt: new Date().toISOString(),
      createdBy: user.id,
      updatedAt: new Date().toISOString(),
    }

    allProjects.push(newProject)

    toast({
      title: 'Proje Oluşturuldu',
      description: `${newProject.name} (${newProject.projectCode}) başarıyla sisteme eklendi.`,
    })

    setIsAddProjectOpen(false)
    setNewProjectData({
      name: '',
      customerId: '',
      projectManagerId: '',
      type: '',
      description: '',
      city: '',
      district: '',
      addressDetail: '',
      status: 'planning',
      planningStart: '',
      actualStart: '',
      plannedEnd: '',
      actualEnd: '',
    })
  }

  // Proje yöneticisi olabilecek kullanıcılar (merkez yöneticileri ve proje yöneticileri)
  const projectManagerCandidates = systemUsers.filter(
    (u) => u.role === 'center_manager' || u.role === 'project_manager'
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Proje Yönetimi</h1>
          <p className="text-muted-foreground mt-1">
            Tüm projeleri yönetin, proje yöneticileri atayın ve durumları takip edin
          </p>
        </div>
        <Dialog open={isAddProjectOpen} onOpenChange={setIsAddProjectOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Proje
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yeni Proje Oluştur</DialogTitle>
              <DialogDescription>
                Proje bilgilerini girin ve proje yöneticisi atayın
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2 space-y-2">
                <Label>Proje Adı *</Label>
                <Input
                  placeholder="Örn: Konut Projesi - Kadıköy"
                  value={newProjectData.name}
                  onChange={(e) => setNewProjectData({ ...newProjectData, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Müşteri</Label>
                <Select
                  value={newProjectData.customerId}
                  onValueChange={(value) => setNewProjectData({ ...newProjectData, customerId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Müşteri seçin (opsiyonel)" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Proje Yöneticisi</Label>
                <Select
                  value={newProjectData.projectManagerId}
                  onValueChange={(value) => setNewProjectData({ ...newProjectData, projectManagerId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Proje yöneticisi atayın (opsiyonel)" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectManagerCandidates.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.firstName} {u.lastName} - {u.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Proje yöneticisi atandığında proje için admin yetkisi alır
                </p>
              </div>

              <div className="space-y-2">
                <Label>Proje Türü *</Label>
                <Input
                  placeholder="Örn: Konut İnşaatı, Fabrika, Altyapı"
                  value={newProjectData.type}
                  onChange={(e) => setNewProjectData({ ...newProjectData, type: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Proje Durumu *</Label>
                <Select
                  value={newProjectData.status}
                  onValueChange={(value: any) => setNewProjectData({ ...newProjectData, status: value })}
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

              <div className="col-span-2 space-y-2">
                <Label>Proje Açıklaması *</Label>
                <Textarea
                  placeholder="Projenin detaylı açıklaması..."
                  value={newProjectData.description}
                  onChange={(e) => setNewProjectData({ ...newProjectData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="col-span-2 pt-4 border-t">
                <h3 className="font-semibold mb-3">Proje Adresi</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>İl *</Label>
                    <Input
                      placeholder="Örn: İstanbul"
                      value={newProjectData.city}
                      onChange={(e) => setNewProjectData({ ...newProjectData, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>İlçe *</Label>
                    <Input
                      placeholder="Örn: Kadıköy"
                      value={newProjectData.district}
                      onChange={(e) => setNewProjectData({ ...newProjectData, district: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Detay Adres *</Label>
                    <Textarea
                      placeholder="Mahalle, sokak, proje alanı"
                      value={newProjectData.addressDetail}
                      onChange={(e) => setNewProjectData({ ...newProjectData, addressDetail: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <div className="col-span-2 pt-4 border-t">
                <h3 className="font-semibold mb-3">Proje Tarihleri</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Planlama Başlangıç</Label>
                    <Input
                      type="date"
                      value={newProjectData.planningStart}
                      onChange={(e) => setNewProjectData({ ...newProjectData, planningStart: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fiili Başlangıç</Label>
                    <Input
                      type="date"
                      value={newProjectData.actualStart}
                      onChange={(e) => setNewProjectData({ ...newProjectData, actualStart: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Planlanan Bitiş</Label>
                    <Input
                      type="date"
                      value={newProjectData.plannedEnd}
                      onChange={(e) => setNewProjectData({ ...newProjectData, plannedEnd: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fiili Bitiş</Label>
                    <Input
                      type="date"
                      value={newProjectData.actualEnd}
                      onChange={(e) => setNewProjectData({ ...newProjectData, actualEnd: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddProjectOpen(false)}>
                İptal
              </Button>
              <Button
                onClick={handleCreateProject}
                disabled={!newProjectData.name || !newProjectData.type || !newProjectData.description || !newProjectData.city}
              >
                Proje Oluştur
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Proje</p>
                <p className="text-3xl font-bold mt-2">{allProjects.length}</p>
              </div>
              <Briefcase className="w-10 h-10 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Devam Ediyor</p>
                <p className="text-3xl font-bold mt-2 text-success">
                  {allProjects.filter((p) => p.status === 'ongoing').length}
                </p>
              </div>
              <PlayCircle className="w-10 h-10 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Planlama</p>
                <p className="text-3xl font-bold mt-2">
                  {allProjects.filter((p) => p.status === 'planning').length}
                </p>
              </div>
              <Clock className="w-10 h-10 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tamamlandı</p>
                <p className="text-3xl font-bold mt-2">
                  {allProjects.filter((p) => p.status === 'completed').length}
                </p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-info" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Proje adı, kodu veya açıklama ara..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Durum filtrele..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="planning">Planlama</SelectItem>
                <SelectItem value="waiting">Beklemede</SelectItem>
                <SelectItem value="ongoing">Devam Ediyor</SelectItem>
                <SelectItem value="completed">Tamamlandı</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredProjects.map((project) => {
          const customer = project.customerId ? customers.find((c) => c.id === project.customerId) : null
          const projectManager = project.projectManagerId ? systemUsers.find((u) => u.id === project.projectManagerId) : null
          const projectCompanies = companies.filter((c) => project.companyIds.includes(c.id))

          return (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      {getStatusBadge(project.status)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {project.projectCode}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {project.type}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{project.description}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      {project.address.detail}, {project.address.district}/{project.address.city}
                    </span>
                  </div>
                  
                  {customer && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Müşteri: <strong className="text-foreground">{customer.name}</strong>
                      </span>
                    </div>
                  )}

                  {projectManager && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Proje Yöneticisi: <strong className="text-foreground">{projectManager.firstName} {projectManager.lastName}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Dates */}
                <div className="pt-3 border-t">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {project.dates.planningStart && (
                      <div>
                        <span className="text-muted-foreground">Planlama:</span>
                        <p className="font-medium">{new Date(project.dates.planningStart).toLocaleDateString('tr-TR')}</p>
                      </div>
                    )}
                    {project.dates.actualStart && (
                      <div>
                        <span className="text-muted-foreground">Başlangıç:</span>
                        <p className="font-medium">{new Date(project.dates.actualStart).toLocaleDateString('tr-TR')}</p>
                      </div>
                    )}
                    {project.dates.plannedEnd && (
                      <div>
                        <span className="text-muted-foreground">Planlanan Bitiş:</span>
                        <p className="font-medium">{new Date(project.dates.plannedEnd).toLocaleDateString('tr-TR')}</p>
                      </div>
                    )}
                    {project.dates.actualEnd && (
                      <div>
                        <span className="text-muted-foreground">Fiili Bitiş:</span>
                        <p className="font-medium">{new Date(project.dates.actualEnd).toLocaleDateString('tr-TR')}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Companies */}
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground">Çalışan Şirketler:</p>
                    <span className="text-xs font-semibold">{projectCompanies.length}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {projectCompanies.map((company) => (
                      <Badge key={company.id} variant="outline" className="text-xs">
                        {company.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button variant="outline" className="w-full" onClick={() => setSelectedProjectId(project.id)}>
                  Proje Detayları
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Proje Bulunamadı</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' 
                ? 'Arama kriterlerinize uygun proje bulunamadı' 
                : 'Henüz proje eklenmemiş'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
