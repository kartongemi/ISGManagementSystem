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
  Clock,
  MoreVertical,
  Eye,
  Edit,
  Lock,
  Unlock,
  Key
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { getAccessibleUsers, canCreateUser, canManageUserStatus, canSetPassword } from '@/lib/permissions'
import { systemUsers, getCompanyById, UserStatus } from '@/lib/mockData'
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

export function SystemUserManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isSetPasswordOpen, setIsSetPasswordOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const { user } = useAuthStore()
  const { toast } = useToast()

  if (!user) return null

  // Yetki kontrolü - Sadece merkez yöneticisi ve proje yöneticisi erişebilir
  if (user.role !== 'center_manager' && user.role !== 'project_manager') {
    return (
      <div className="p-6">
        <Card className="border-danger">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-danger">
              <Shield className="w-8 h-8" />
              <div>
                <h2 className="text-xl font-bold">Erişim Engellendi</h2>
                <p className="text-muted-foreground mt-1">
                  Sistem kullanıcı yönetimi sayfasına sadece merkez yöneticileri ve proje yöneticileri erişebilir.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const accessibleUsers = getAccessibleUsers(user)

  // Filtrele
  const filteredUsers = accessibleUsers.filter((u) => {
    const matchesSearch = 
      u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.userCode.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // İstatistikler
  const stats = {
    total: accessibleUsers.length,
    active: accessibleUsers.filter((u) => u.status === 'active').length,
    passive: accessibleUsers.filter((u) => u.status === 'passive').length,
    pending: accessibleUsers.filter((u) => u.status === 'pending_activation').length,
    locked: accessibleUsers.filter((u) => u.status === 'locked').length,
  }

  const getStatusBadge = (status: UserStatus) => {
    const variants = {
      active: <Badge className="bg-success"><UserCheck className="w-3 h-3 mr-1" /> Aktif</Badge>,
      passive: <Badge variant="secondary"><UserX className="w-3 h-3 mr-1" /> Pasif</Badge>,
      locked: <Badge variant="destructive"><Lock className="w-3 h-3 mr-1" /> Kilitli</Badge>,
      pending_activation: <Badge className="bg-warning text-warning-foreground"><Clock className="w-3 h-3 mr-1" /> Bekliyor</Badge>,
    }
    return variants[status]
  }

  const getRoleName = (role: string) => {
    const roles: Record<string, string> = {
      center_manager: 'Merkez Yöneticisi',
      project_manager: 'Proje Yöneticisi',
      contractor_manager: 'Taşeron Yöneticisi',
      isg_specialist: 'İSG Uzmanı',
      doctor: 'İşyeri Hekimi',
      employee: 'Çalışan',
    }
    return roles[role] || role
  }

  const handleToggleStatus = (userId: string, currentStatus: UserStatus) => {
    if (!canManageUserStatus(user, userId)) {
      toast({
        title: 'Yetki Hatası',
        description: 'Bu kullanıcının durumunu değiştirme yetkiniz yok.',
        variant: 'destructive',
      })
      return
    }

    const targetUser = systemUsers.find((u) => u.id === userId)
    if (!targetUser) return

    const newStatus: UserStatus = currentStatus === 'active' ? 'passive' : 'active'
    
    // Mock update - gerçek uygulamada API çağrısı yapılır
    targetUser.status = newStatus
    targetUser.updatedAt = new Date().toISOString()
    targetUser.updatedBy = user.id

    toast({
      title: 'Başarılı',
      description: `${targetUser.firstName} ${targetUser.lastName} ${newStatus === 'active' ? 'aktif' : 'pasif'} yapıldı.`,
    })
  }

  const handleSetPassword = () => {
    if (!canSetPassword(user, selectedUserId)) {
      toast({
        title: 'Yetki Hatası',
        description: 'Bu kullanıcı için şifre belirleme yetkiniz yok.',
        variant: 'destructive',
      })
      return
    }

    if (!newPassword || newPassword.length < 6) {
      toast({
        title: 'Hata',
        description: 'Şifre en az 6 karakter olmalıdır.',
        variant: 'destructive',
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Hata',
        description: 'Şifreler eşleşmiyor.',
        variant: 'destructive',
      })
      return
    }

    const targetUser = systemUsers.find((u) => u.id === selectedUserId)
    if (!targetUser) return

    // Mock update - gerçek uygulamada şifrelenmiş olarak API'ye gönderilir
    targetUser.password = newPassword
    targetUser.updatedAt = new Date().toISOString()
    targetUser.updatedBy = user.id

    toast({
      title: 'Şifre Güncellendi',
      description: `${targetUser.firstName} ${targetUser.lastName} için şifre başarıyla belirlendi.`,
    })

    setIsSetPasswordOpen(false)
    setSelectedUserId('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sistem Kullanıcı Yönetimi</h1>
          <p className="text-muted-foreground mt-1">
            Web sayfasına giriş yapabilen kullanıcıları yönetin
            {user.role === 'center_manager' && ' - Tüm sistem kullanıcıları'}
            {user.role === 'project_manager' && ' - Ana firma kullanıcıları'}
          </p>
        </div>
        {canCreateUser(user) && (
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Yeni Kullanıcı
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Yeni Kullanıcı Ekle</DialogTitle>
                <DialogDescription>
                  Sisteme yeni kullanıcı ekleyin. Kullanıcıya aktivasyon e-postası gönderilecektir.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label>Ad</Label>
                  <Input placeholder="Örn: Ahmet" />
                </div>
                <div className="space-y-2">
                  <Label>Soyad</Label>
                  <Input placeholder="Örn: Yılmaz" />
                </div>
                <div className="space-y-2">
                  <Label>E-posta</Label>
                  <Input type="email" placeholder="ahmet@sirket.com" />
                </div>
                <div className="space-y-2">
                  <Label>Telefon</Label>
                  <Input placeholder="+90 5XX XXX XX XX" />
                </div>
                  <div className="space-y-2">
                    <Label>Personel Kodu</Label>
                    <Input placeholder="USR-XXX (otomatik oluşturulacak)" disabled />
                  </div>
                <div className="space-y-2">
                  <Label>Ünvan</Label>
                  <Input placeholder="İSG Uzmanı" />
                </div>
                <div className="space-y-2">
                  <Label>Departman</Label>
                  <Input placeholder="İSG" />
                </div>
                <div className="space-y-2">
                  <Label>Rol</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Rol seçin..." />
                    </SelectTrigger>
                    <SelectContent>
                      {user.role === 'center_manager' && (
                        <>
                          <SelectItem value="center_manager">Merkez Yöneticisi</SelectItem>
                          <SelectItem value="project_manager">Proje Yöneticisi</SelectItem>
                        </>
                      )}
                      <SelectItem value="contractor_manager">Taşeron Yöneticisi</SelectItem>
                      <SelectItem value="isg_specialist">İSG Uzmanı</SelectItem>
                      <SelectItem value="doctor">İşyeri Hekimi</SelectItem>
                      <SelectItem value="employee">Çalışan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Şirket</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Şirket seçin..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comp-1">Ana Firma A.Ş.</SelectItem>
                      <SelectItem value="comp-2">Taşeron İnşaat Ltd.</SelectItem>
                      <SelectItem value="comp-3">Alt Taşeron Elektrik</SelectItem>
                      <SelectItem value="comp-4">Makine Taşeron A.Ş.</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                  İptal
                </Button>
                <Button onClick={() => {
                  toast({
                    title: 'Kullanıcı Eklendi',
                    description: 'Aktivasyon e-postası gönderildi.',
                  })
                  setIsAddUserOpen(false)
                }}>
                  Kullanıcı Ekle
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
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
                <p className="text-2xl font-bold mt-1">{stats.passive}</p>
              </div>
              <UserX className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Bekleyen</p>
                <p className="text-2xl font-bold mt-1 text-warning">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Kilitli</p>
                <p className="text-2xl font-bold mt-1 text-danger">{stats.locked}</p>
              </div>
              <Lock className="w-8 h-8 text-danger" />
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
                placeholder="Ad, soyad, e-posta veya kullanıcı kodu ara..." 
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
                <SelectItem value="passive">Pasif</SelectItem>
                <SelectItem value="pending_activation">Aktivasyon Bekleyen</SelectItem>
                <SelectItem value="locked">Kilitli</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Set Password Dialog */}
      <Dialog open={isSetPasswordOpen} onOpenChange={setIsSetPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kullanıcı Şifresi Belirle</DialogTitle>
            <DialogDescription>
              {selectedUserId && (() => {
                const targetUser = systemUsers.find((u) => u.id === selectedUserId)
                return targetUser ? `${targetUser.firstName} ${targetUser.lastName} için yeni şifre belirleyin` : ''
              })()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Yeni Şifre *</Label>
              <Input
                type="password"
                placeholder="En az 6 karakter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Şifre Tekrar *</Label>
              <Input
                type="password"
                placeholder="Şifreyi tekrar girin"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="p-3 rounded bg-muted text-xs text-muted-foreground">
              <p className="font-medium mb-1">Şifre Gereksinimleri:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>En az 6 karakter uzunluğunda olmalıdır</li>
                <li>Kullanıcı bu şifre ile sisteme giriş yapabilir</li>
                <li>Şifre güvenli bir şekilde saklanacaktır</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsSetPasswordOpen(false)
              setSelectedUserId('')
              setNewPassword('')
              setConfirmPassword('')
            }}>
              İptal
            </Button>
            <Button onClick={handleSetPassword}>
              <Key className="w-4 h-4 mr-2" />
              Şifreyi Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sistem Kullanıcı Listesi ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Web sayfasına giriş yapabilen kullanıcılar (saha personeli değil)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 text-sm font-medium">Kullanıcı Kodu</th>
                  <th className="text-left p-3 text-sm font-medium">Kullanıcı</th>
                  <th className="text-left p-3 text-sm font-medium">İletişim</th>
                  <th className="text-left p-3 text-sm font-medium">Şirket</th>
                  <th className="text-left p-3 text-sm font-medium">Rol</th>
                  <th className="text-left p-3 text-sm font-medium">Son Giriş</th>
                  <th className="text-left p-3 text-sm font-medium">Durum</th>
                  <th className="text-right p-3 text-sm font-medium">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const company = getCompanyById(u.companyId)
                  const lastLogin = u.lastLoginAt 
                    ? new Date(u.lastLoginAt).toLocaleDateString('tr-TR', { 
                        day: '2-digit', 
                        month: 'short', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })
                    : '-'

                  return (
                    <tr key={u.id} className="border-t border-border hover:bg-accent/50">
                      <td className="p-3">
                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                          {u.userCode}
                        </code>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">
                              {u.firstName[0]}{u.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{u.firstName} {u.lastName}</div>
                            <div className="text-xs text-muted-foreground">{u.title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            {u.email}
                          </div>
                          {u.phone && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              {u.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          {company?.name}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="gap-1">
                          <Shield className="w-3 h-3" />
                          {getRoleName(u.role)}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {lastLogin}
                      </td>
                      <td className="p-3">
                        {getStatusBadge(u.status)}
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
                              {canManageUserStatus(user, u.id) && (
                                <>
                                  <DropdownMenuItem>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Düzenle
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleToggleStatus(u.id, u.status)}
                                  >
                                    {u.status === 'active' ? (
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
                                </>
                              )}
                              {canSetPassword(user, u.id) && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUserId(u.id)
                                    setIsSetPasswordOpen(true)
                                  }}
                                >
                                  <Key className="w-4 h-4 mr-2" />
                                  Şifre Belirle
                                </DropdownMenuItem>
                              )}
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

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Kullanıcı bulunamadı</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
