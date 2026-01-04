import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  ClipboardCheck, 
  Plus, 
  Search, 
  AlertTriangle,
  UserX,
  Upload,
  FileText,
  Image as ImageIcon,
  Calendar,
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Filter,
  Download,
  ExternalLink
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { 
  canCreateNonConformance, 
  canViewNonConformance, 
  canCloseNonConformance,
  getUserNonConformances,
  getUserProjects,
  getUserCompanies
} from '@/lib/permissions'
import { 
  nonConformances,
  getProjectById,
  getCompanyById,
  getUserById,
  NonConformanceStatus,
  NonConformanceType
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

export function Inspection() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [isAddNCOpen, setIsAddNCOpen] = useState(false)
  const [selectedNC, setSelectedNC] = useState<string | null>(null)
  const [isCloseNCOpen, setIsCloseNCOpen] = useState(false)
  
  const [newNC, setNewNC] = useState({
    projectId: '',
    companyId: '',
    type: 'hazardous_condition' as NonConformanceType,
    standard: '',
    description: '',
    recommendedAction: '',
  })

  const [closureData, setClosureData] = useState({
    action: '',
    status: 'in_progress' as NonConformanceStatus,
  })

  const { user } = useAuthStore()
  const { toast } = useToast()

  if (!user) return null

  const accessibleNCs = getUserNonConformances(user, nonConformances)
  const userProjects = getUserProjects(user)
  const userCompanies = getUserCompanies(user)

  // Filtrele
  const filteredNCs = accessibleNCs.filter((nc) => {
    const matchesSearch = 
      nc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nc.recommendedAction.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (nc.standard && nc.standard.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || nc.status === statusFilter
    const matchesType = typeFilter === 'all' || nc.type === typeFilter
    const matchesProject = projectFilter === 'all' || nc.projectId === projectFilter

    return matchesSearch && matchesStatus && matchesType && matchesProject
  })

  // İstatistikler
  const stats = {
    total: accessibleNCs.length,
    open: accessibleNCs.filter((nc) => nc.status === 'open').length,
    inProgress: accessibleNCs.filter((nc) => nc.status === 'in_progress').length,
    closed: accessibleNCs.filter((nc) => nc.status === 'closed').length,
    hazardousCondition: accessibleNCs.filter((nc) => nc.type === 'hazardous_condition').length,
    hazardousBehavior: accessibleNCs.filter((nc) => nc.type === 'hazardous_behavior').length,
  }

  const getStatusBadge = (status: NonConformanceStatus) => {
    const variants = {
      open: <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" /> Açık</Badge>,
      in_progress: <Badge className="bg-warning text-warning-foreground gap-1"><Clock className="w-3 h-3" /> Devam Ediyor</Badge>,
      closed: <Badge className="bg-success gap-1"><CheckCircle2 className="w-3 h-3" /> Kapatıldı</Badge>,
    }
    return variants[status]
  }

  const getTypeBadge = (type: NonConformanceType) => {
    const variants = {
      hazardous_condition: <Badge variant="outline" className="gap-1"><AlertTriangle className="w-3 h-3" /> Tehlikeli Durum</Badge>,
      hazardous_behavior: <Badge variant="outline" className="gap-1"><UserX className="w-3 h-3" /> Tehlikeli Davranış</Badge>,
    }
    return variants[type]
  }

  const handleCreateNC = () => {
    if (!newNC.projectId || !newNC.companyId || !newNC.description || !newNC.recommendedAction) {
      toast({
        title: 'Eksik Bilgi',
        description: 'Lütfen zorunlu alanları doldurun.',
        variant: 'destructive',
      })
      return
    }

    const nc = {
      id: `nc-${nonConformances.length + 1}`,
      projectId: newNC.projectId,
      companyId: newNC.companyId,
      reportedByCompanyId: user.companyId,
      reportedByUserId: user.id,
      reportedAt: new Date().toISOString(),
      type: newNC.type,
      standard: newNC.standard,
      description: newNC.description,
      recommendedAction: newNC.recommendedAction,
      photos: [],
      documents: [],
      status: 'open' as NonConformanceStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    nonConformances.push(nc)

    const company = getCompanyById(newNC.companyId)
    toast({
      title: 'Uygunsuzluk Kaydedildi',
      description: `${company?.name} şirketine yöneltilen uygunsuzluk başarıyla kaydedildi.`,
    })

    setIsAddNCOpen(false)
    setNewNC({
      projectId: '',
      companyId: '',
      type: 'hazardous_condition',
      standard: '',
      description: '',
      recommendedAction: '',
    })
  }

  const handleCloseNC = () => {
    if (!selectedNC || !closureData.action) {
      toast({
        title: 'Eksik Bilgi',
        description: 'Düzeltici faaliyet açıklaması gereklidir.',
        variant: 'destructive',
      })
      return
    }

    const nc = nonConformances.find((n) => n.id === selectedNC)
    if (!nc) return

    nc.closureAction = closureData.action
    nc.status = closureData.status
    nc.updatedAt = new Date().toISOString()

    if (closureData.status === 'closed') {
      nc.closedByUserId = user.id
      nc.closedAt = new Date().toISOString()
    }

    toast({
      title: 'Uygunsuzluk Güncellendi',
      description: `Uygunsuzluk durumu "${closureData.status === 'closed' ? 'Kapatıldı' : 'Devam Ediyor'}" olarak güncellendi.`,
    })

    setIsCloseNCOpen(false)
    setSelectedNC(null)
    setClosureData({
      action: '',
      status: 'in_progress',
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Saha Denetim & Gözlem</h1>
          <p className="text-muted-foreground mt-1">
            Uygunsuzluk kayıt ve takip sistemi
          </p>
        </div>
        {canCreateNonConformance(user) && (
          <Dialog open={isAddNCOpen} onOpenChange={setIsAddNCOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Yeni Uygunsuzluk Kaydı
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Uygunsuzluk Kayıt Formu</DialogTitle>
                <DialogDescription>
                  Tespit edilen uygunsuzluğu kaydedin ve ilgili firmaya yönlendirin
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Proje *</Label>
                    <Select
                      value={newNC.projectId}
                      onValueChange={(value) => setNewNC({ ...newNC, projectId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Proje seçin..." />
                      </SelectTrigger>
                      <SelectContent>
                        {userProjects.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>İlgili Taşeron / Firma *</Label>
                    <Select
                      value={newNC.companyId}
                      onValueChange={(value) => setNewNC({ ...newNC, companyId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Firma seçin..." />
                      </SelectTrigger>
                      <SelectContent>
                        {userCompanies.filter((c) => c.type !== 'main').map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Uygunsuzluk Türü *</Label>
                    <Select
                      value={newNC.type}
                      onValueChange={(value: NonConformanceType) => setNewNC({ ...newNC, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hazardous_condition">Tehlikeli Durum</SelectItem>
                        <SelectItem value="hazardous_behavior">Tehlikeli Davranış</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Uygunsuzluk Tarihi *</Label>
                    <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Standart / Mevzuat Gerekliliği</Label>
                  <Input
                    placeholder="Örn: İSG Yönetmeliği Madde 5..."
                    value={newNC.standard}
                    onChange={(e) => setNewNC({ ...newNC, standard: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Uygunsuzluk Açıklaması *</Label>
                  <Textarea
                    dir="ltr"
                    placeholder="Tespit edilen uygunsuzluğu detaylı olarak açıklayın..."
                    value={newNC.description}
                    onChange={(e) => setNewNC({ ...newNC, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tavsiye Edilen Düzeltici Faaliyet *</Label>
                  <Textarea
                    dir="ltr"
                    placeholder="Uygunsuzluğun giderilmesi için önerilen aksiyonları yazın..."
                    value={newNC.recommendedAction}
                    onChange={(e) => setNewNC({ ...newNC, recommendedAction: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Fotoğraf Yükleme
                    </Label>
                    <Input type="file" accept="image/*" multiple />
                    <p className="text-xs text-muted-foreground">
                      Çoklu fotoğraf seçebilirsiniz (JPG, PNG)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Belge Yükleme
                    </Label>
                    <Input type="file" accept=".pdf,.doc,.docx" multiple />
                    <p className="text-xs text-muted-foreground">
                      PDF, Word belgelerini ekleyebilirsiniz
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddNCOpen(false)}>
                  İptal
                </Button>
                <Button onClick={handleCreateNC}>
                  <Upload className="w-4 h-4 mr-2" />
                  Uygunsuzluğu Kaydet
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Toplam</p>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
              </div>
              <ClipboardCheck className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Açık</p>
                <p className="text-2xl font-bold mt-1 text-danger">{stats.open}</p>
              </div>
              <XCircle className="w-8 h-8 text-danger" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Devam Ediyor</p>
                <p className="text-2xl font-bold mt-1 text-warning">{stats.inProgress}</p>
              </div>
              <Clock className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Kapatıldı</p>
                <p className="text-2xl font-bold mt-1 text-success">{stats.closed}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Tehlikeli Durum</p>
                <p className="text-2xl font-bold mt-1">{stats.hazardousCondition}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Tehlikeli Davranış</p>
                <p className="text-2xl font-bold mt-1">{stats.hazardousBehavior}</p>
              </div>
              <UserX className="w-8 h-8 text-info" />
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
                placeholder="Açıklama, tavsiye veya standart ara..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="open">Açık</SelectItem>
                <SelectItem value="in_progress">Devam Ediyor</SelectItem>
                <SelectItem value="closed">Kapatıldı</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tür" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Türler</SelectItem>
                <SelectItem value="hazardous_condition">Tehlikeli Durum</SelectItem>
                <SelectItem value="hazardous_behavior">Tehlikeli Davranış</SelectItem>
              </SelectContent>
            </Select>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Proje" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Projeler</SelectItem>
                {userProjects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Close NC Dialog */}
      <Dialog open={isCloseNCOpen} onOpenChange={setIsCloseNCOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Uygunsuzluğu Güncelle</DialogTitle>
            <DialogDescription>
              Düzeltici faaliyetleri açıklayın ve durumu güncelleyin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Düzeltici Faaliyet Açıklaması *</Label>
              <Textarea
                dir="ltr"
                placeholder="Uygunsuzluğu gidermek için yapılan işlemleri detaylı olarak açıklayın..."
                value={closureData.action}
                onChange={(e) => setClosureData({ ...closureData, action: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Durum *</Label>
              <Select
                value={closureData.status}
                onValueChange={(value: NonConformanceStatus) => setClosureData({ ...closureData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_progress">Devam Ediyor</SelectItem>
                  <SelectItem value="closed">Kapatıldı</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                "Kapatıldı" durumu seçildiğinde uygunsuzluk arşivlenecektir
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Kapanış Fotoğrafları
                </Label>
                <Input type="file" accept="image/*" multiple />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Kapanış Belgeleri
                </Label>
                <Input type="file" accept=".pdf,.doc,.docx" multiple />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCloseNCOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleCloseNC}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Güncelle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* NC List */}
      <div className="space-y-4">
        {filteredNCs.map((nc) => {
          const project = getProjectById(nc.projectId)
          const company = getCompanyById(nc.companyId)
          const reportedByUser = getUserById(nc.reportedByUserId)
          const closedByUser = nc.closedByUserId ? getUserById(nc.closedByUserId) : null
          const canClose = canCloseNonConformance(user, nc)

          return (
            <Card key={nc.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">#{nc.id.toUpperCase()}</CardTitle>
                      {getStatusBadge(nc.status)}
                      {getTypeBadge(nc.type)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(nc.reportedAt).toLocaleDateString('tr-TR')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {project?.name}
                      </div>
                    </div>
                  </div>
                  {canClose && nc.status !== 'closed' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedNC(nc.id)
                        setClosureData({
                          action: nc.closureAction || '',
                          status: nc.status === 'open' ? 'in_progress' : 'closed',
                        })
                        setIsCloseNCOpen(true)
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Güncelle
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-danger/5 border border-danger/20">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-danger mb-1">Yöneltilen Firma</h4>
                      <p className="text-sm">{company?.name}</p>
                    </div>
                  </div>
                </div>

                {nc.standard && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">Standart / Mevzuat</h4>
                    <p className="text-sm text-muted-foreground">{nc.standard}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-sm mb-1">Uygunsuzluk Açıklaması</h4>
                  <p className="text-sm text-muted-foreground">{nc.description}</p>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-1">Tavsiye Edilen Düzeltici Faaliyet</h4>
                  <p className="text-sm text-muted-foreground">{nc.recommendedAction}</p>
                </div>

                {nc.photos.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Fotoğraflar ({nc.photos.length})</h4>
                    <div className="flex gap-2">
                      {nc.photos.slice(0, 3).map((photo, i) => (
                        <div
                          key={i}
                          className="w-20 h-20 rounded border border-border bg-muted flex items-center justify-center"
                        >
                          <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                      ))}
                      {nc.photos.length > 3 && (
                        <div className="w-20 h-20 rounded border border-border bg-muted flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">+{nc.photos.length - 3}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {nc.closureAction && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      Düzeltici Faaliyet
                    </h4>
                    <p className="text-sm text-muted-foreground">{nc.closureAction}</p>
                    {nc.closurePhotos && nc.closurePhotos.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground mb-2">
                          Kapanış Fotoğrafları ({nc.closurePhotos.length})
                        </p>
                        <div className="flex gap-2">
                          {nc.closurePhotos.slice(0, 3).map((photo, i) => (
                            <div
                              key={i}
                              className="w-16 h-16 rounded border border-border bg-muted flex items-center justify-center"
                            >
                              <ImageIcon className="w-6 h-6 text-muted-foreground" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t text-xs text-muted-foreground">
                  <div>
                    Raporlayan: {reportedByUser?.firstName} {reportedByUser?.lastName}
                  </div>
                  {closedByUser && (
                    <div>
                      Kapatan: {closedByUser.firstName} {closedByUser.lastName} ({new Date(nc.closedAt!).toLocaleDateString('tr-TR')})
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}

        {filteredNCs.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <ClipboardCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Uygunsuzluk Bulunamadı</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                  ? 'Arama kriterlerinize uygun uygunsuzluk bulunamadı' 
                  : 'Henüz uygunsuzluk kaydı eklenmemiş'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
