import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Plus, 
  Search, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Shield,
  Mail,
  Phone,
  Building2,
  MoreVertical,
  Eye,
  Edit,
  HardHat,
  Briefcase
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { getUserEmployees, getUserCompanies } from '@/lib/permissions'
import { employees, getCompanyById, getProjectById, generateEmployeeCode } from '@/lib/mockData'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Textarea } from '@/components/ui/textarea'

export function PersonnelManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isAddPersonnelOpen, setIsAddPersonnelOpen] = useState(false)
  const [newPersonnel, setNewPersonnel] = useState({
    firstName: '',
    lastName: '',
    title: '',
    department: '',
    companyId: '',
    phone: '',
    email: '',
  })
  
  const { user } = useAuthStore()
  const { toast } = useToast()

  if (!user) return null

  const accessiblePersonnel = getUserEmployees(user)
  const accessibleCompanies = getUserCompanies(user)

  // Filtrele
  const filteredPersonnel = accessiblePersonnel.filter((p) => {
    const matchesSearch = 
      p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.title.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // İstatistikler
  const stats = {
    total: accessiblePersonnel.length,
    active: accessiblePersonnel.filter((p) => p.status === 'active').length,
    inactive: accessiblePersonnel.filter((p) => p.status === 'inactive').length,
    assigned: accessiblePersonnel.filter((p) => p.assignedProjectIds.length > 0).length,
    unassigned: accessiblePersonnel.filter((p) => p.assignedProjectIds.length === 0).length,
  }

  const handleAddPersonnel = () => {
    if (!newPersonnel.firstName || !newPersonnel.lastName || !newPersonnel.title || !newPersonnel.companyId) {
      toast({
        title: 'Hata',
        description: 'Lütfen zorunlu alanları doldurun.',
        variant: 'destructive',
      })
      return
    }

    const personnel = {
      id: `emp-${employees.length + 1}`,
      employeeCode: generateEmployeeCode(newPersonnel.companyId),
      firstName: newPersonnel.firstName,
      lastName: newPersonnel.lastName,
      title: newPersonnel.title,
      companyId: newPersonnel.companyId,
      department: newPersonnel.department,
      phone: newPersonnel.phone,
      email: newPersonnel.email,
      status: 'active' as const,
      assignedProjectIds: [],
      createdAt: new Date().toISOString(),
      createdBy: user.id,
      updatedAt: new Date().toISOString(),
    }

    employees.push(personnel)

    toast({
      title: 'Personel Eklendi',
      description: `${personnel.firstName} ${personnel.lastName} (${personnel.employeeCode}) sisteme eklendi.`,
    })

    setIsAddPersonnelOpen(false)
    setNewPersonnel({
      firstName: '',
      lastName: '',
      title: '',
      department: '',
      companyId: '',
      phone: '',
      email: '',
    })
  }

  const handleToggleStatus = (personnelId: string) => {
    const personnel = employees.find((p) => p.id === personnelId)
    if (!personnel) return

    personnel.status = personnel.status === 'active' ? 'inactive' : 'active'
    personnel.updatedAt = new Date().toISOString()

    toast({
      title: 'Durum Güncellendi',
      description: `${personnel.firstName} ${personnel.lastName} ${personnel.status === 'active' ? 'aktif' : 'pasif'} yapıldı.`,
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Personel Yönetimi</h1>
          <p className="text-muted-foreground mt-1">
            {user.role === 'center_manager' && 'Tüm saha personelleri'}
            {user.role === 'project_manager' && 'Projelerdeki saha personelleri'}
            {user.role === 'contractor_manager' && 'Şirketinizin saha personelleri'}
          </p>
        </div>
        <Dialog open={isAddPersonnelOpen} onOpenChange={setIsAddPersonnelOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Yeni Personel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Yeni Personel Ekle</DialogTitle>
              <DialogDescription>
                Saha personeli bilgilerini girin. Bu personel projelere atanabilir.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Ad *</Label>
                <Input
                  placeholder="Örn: Ahmet"
                  value={newPersonnel.firstName}
                  onChange={(e) => setNewPersonnel({ ...newPersonnel, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Soyad *</Label>
                <Input
                  placeholder="Örn: Yılmaz"
                  value={newPersonnel.lastName}
                  onChange={(e) => setNewPersonnel({ ...newPersonnel, lastName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Ünvan *</Label>
                <Input
                  placeholder="Örn: İnşaat Ustası, Elektrikçi"
                  value={newPersonnel.title}
                  onChange={(e) => setNewPersonnel({ ...newPersonnel, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Departman</Label>
                <Input
                  placeholder="Örn: İnşaat, Elektrik"
                  value={newPersonnel.department}
                  onChange={(e) => setNewPersonnel({ ...newPersonnel, department: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Şirket *</Label>
                <Select
                  value={newPersonnel.companyId}
                  onValueChange={(value) => setNewPersonnel({ ...newPersonnel, companyId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Şirket seçin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {accessibleCompanies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input
                  placeholder="+90 5XX XXX XX XX"
                  value={newPersonnel.phone}
                  onChange={(e) => setNewPersonnel({ ...newPersonnel, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>E-posta</Label>
                <Input
                  type="email"
                  placeholder="ahmet@example.com"
                  value={newPersonnel.email}
                  onChange={(e) => setNewPersonnel({ ...newPersonnel, email: e.target.value })}
                />
              </div>
              <div className="col-span-2 p-3 rounded bg-muted text-xs text-muted-foreground">
                <p className="font-medium mb-1">Not:</p>
                <p>Personel kodu otomatik olarak oluşturulacaktır. Bu personel sisteme giriş yapamaz, sadece projelere atanır ve evrakları yüklenir.</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddPersonnelOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleAddPersonnel}>
                Personel Ekle
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Toplam</p>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Aktif</p>
                <p className="text-2xl font-bold mt-1 text-success">{stats.active}</p>
              </div>
              <UserCheck className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pasif</p>
                <p className="text-2xl font-bold mt-1">{stats.inactive}</p>
              </div>
              <UserX className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Projeye Atanmış</p>
                <p className="text-2xl font-bold mt-1 text-info">{stats.assigned}</p>
              </div>
              <Briefcase className="w-8 h-8 text-info" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Havuzda</p>
                <p className="text-2xl font-bold mt-1 text-warning">{stats.unassigned}</p>
              </div>
              <HardHat className="w-8 h-8 text-warning" />
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
                placeholder="Ad, soyad, personel kodu veya ünvan ara..."
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
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Pasif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Personnel Table */}
      <Card>
        <CardHeader>
          <CardTitle>Personel Listesi ({filteredPersonnel.length})</CardTitle>
          <CardDescription>
            Saha personeli bilgileri ve proje atamaları
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 text-sm font-medium">Personel Kodu</th>
                  <th className="text-left p-3 text-sm font-medium">Personel</th>
                  <th className="text-left p-3 text-sm font-medium">Şirket</th>
                  <th className="text-left p-3 text-sm font-medium">İletişim</th>
                  <th className="text-left p-3 text-sm font-medium">Atandığı Projeler</th>
                  <th className="text-left p-3 text-sm font-medium">Durum</th>
                  <th className="text-right p-3 text-sm font-medium">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredPersonnel.map((personnel) => {
                  const company = getCompanyById(personnel.companyId)
                  const assignedProjects = personnel.assignedProjectIds.map((id) => getProjectById(id)).filter(Boolean)

                  return (
                    <tr key={personnel.id} className="border-t border-border hover:bg-accent/50">
                      <td className="p-3">
                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                          {personnel.employeeCode}
                        </code>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <HardHat className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{personnel.firstName} {personnel.lastName}</div>
                            <div className="text-xs text-muted-foreground">{personnel.title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          {company?.name}
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        <div className="space-y-1">
                          {personnel.phone && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              {personnel.phone}
                            </div>
                          )}
                          {personnel.email && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              {personnel.email}
                            </div>
                          )}
                          {!personnel.phone && !personnel.email && (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        {assignedProjects.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {assignedProjects.map((proj) => (
                              <Badge key={proj!.id} variant="outline" className="text-xs">
                                {proj!.name.split('-')[0].trim()}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Havuzda</Badge>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge variant={personnel.status === 'active' ? 'default' : 'secondary'} className={personnel.status === 'active' ? 'bg-success' : ''}>
                          {personnel.status === 'active' ? (
                            <>
                              <UserCheck className="w-3 h-3 mr-1" /> Aktif
                            </>
                          ) : (
                            <>
                              <UserX className="w-3 h-3 mr-1" /> Pasif
                            </>
                          )}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                Detayları Görüntüle
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Düzenle
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus(personnel.id)}>
                                {personnel.status === 'active' ? (
                                  <>
                                    <UserX className="w-4 h-4 mr-2" />
                                    Pasif Yap
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    Aktif Yap
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredPersonnel.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Personel bulunamadı</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
