import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  Plus, 
  Search, 
  MoreVertical,
  MapPin,
  Phone,
  Mail,
  FileText,
  Shield,
  UserPlus,
  Send
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { canManageCompanies } from '@/lib/permissions'
import { companies, systemUsers, getUsersByCompanyId } from '@/lib/mockData'
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

export function CompanyManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('')
  const [newCompanyData, setNewCompanyData] = useState({
    name: '',
    type: 'contractor' as 'main' | 'contractor' | 'subcontractor',
    phone: '',
    email: '',
    naceCode: '',
    taxNumber: '',
    city: '',
    district: '',
    addressDetail: '',
    postalCode: '',
    adminUserId: '',
  })
  const [newUserData, setNewUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    employeeCode: '',
    title: '',
    department: '',
    role: 'employee' as string,
  })
  
  const { user } = useAuthStore()
  const { toast } = useToast()

  if (!user) return null

  // Sadece merkez yöneticisi bu sayfayı görebilir
  if (!canManageCompanies(user)) {
    return (
      <div className="p-6">
        <Card className="border-danger">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-danger">
              <Shield className="w-8 h-8" />
              <div>
                <h2 className="text-xl font-bold">Erişim Engellendi</h2>
                <p className="text-muted-foreground mt-1">
                  Şirket yönetimi sayfasına sadece merkez yöneticileri erişebilir.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.naceCode?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getCompanyTypeBadge = (type: string) => {
    const types: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      main: { label: 'Ana Firma', variant: 'default' },
      contractor: { label: 'Taşeron', variant: 'secondary' },
      subcontractor: { label: 'Alt Taşeron', variant: 'outline' },
    }
    const t = types[type] || types.contractor
    return <Badge variant={t.variant}>{t.label}</Badge>
  }

  const handleCreateCompany = () => {
    // Mock company creation
    const newCompany = {
      id: `comp-${companies.length + 1}`,
      name: newCompanyData.name,
      type: newCompanyData.type,
      location: `${newCompanyData.city}, Türkiye`,
      contact: newCompanyData.email,
      phone: newCompanyData.phone,
      naceCode: newCompanyData.naceCode,
      address: {
        city: newCompanyData.city,
        district: newCompanyData.district,
        detail: newCompanyData.addressDetail,
        postalCode: newCompanyData.postalCode,
      },
      adminUserId: newCompanyData.adminUserId || undefined,
      taxNumber: newCompanyData.taxNumber,
      createdAt: new Date().toISOString(),
      createdBy: user.id,
      updatedAt: new Date().toISOString(),
    }

    companies.push(newCompany)

    toast({
      title: 'Şirket Oluşturuldu',
      description: `${newCompany.name} başarıyla sisteme eklendi.`,
    })

    setIsAddCompanyOpen(false)
    setNewCompanyData({
      name: '',
      type: 'contractor',
      phone: '',
      email: '',
      naceCode: '',
      taxNumber: '',
      city: '',
      district: '',
      addressDetail: '',
      postalCode: '',
      adminUserId: '',
    })
  }

  const handleCreateUser = () => {
    // Mock user creation
    const newUser = {
      id: `user-${systemUsers.length + 1}`,
      employeeCode: newUserData.employeeCode,
      email: newUserData.email,
      phone: newUserData.phone,
      status: 'pending_activation' as const,
      firstName: newUserData.firstName,
      lastName: newUserData.lastName,
      title: newUserData.title,
      department: newUserData.department,
      jobPosition: newUserData.title,
      companyId: selectedCompanyId,
      companyType: companies.find((c) => c.id === selectedCompanyId)?.type || 'contractor',
      role: newUserData.role as any,
      language: 'tr' as const,
      timezone: 'Europe/Istanbul',
      emailVerified: false,
      mfaEnabled: false,
      failedLoginCount: 0,
      createdAt: new Date().toISOString(),
      createdBy: user.id,
      updatedAt: new Date().toISOString(),
    }

    systemUsers.push(newUser)

    // Simüle edilmiş e-posta gönderimi
    toast({
      title: '✉️ Aktivasyon E-postası Gönderildi',
      description: (
        <div className="space-y-2">
          <p className="font-medium">
            {newUser.firstName} {newUser.lastName} kullanıcısı oluşturuldu.
          </p>
          <div className="text-xs bg-muted p-2 rounded">
            <p><strong>Kime:</strong> {newUser.email}</p>
            <p><strong>Konu:</strong> İSG Yönetim Sistemi - Hesabınız Oluşturuldu</p>
            <p className="mt-2 text-muted-foreground italic">
              Hesap aktivasyon linki e-posta adresine gönderildi.
            </p>
          </div>
        </div>
      ),
      duration: 5000,
    })

    setIsAddUserOpen(false)
    setNewUserData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      employeeCode: '',
      title: '',
      department: '',
      role: 'employee',
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Şirket Yönetimi</h1>
          <p className="text-muted-foreground mt-1">
            Tüm şirketleri yönetin, yeni şirket ekleyin ve şirket kullanıcılarını oluşturun
          </p>
        </div>
        <Dialog open={isAddCompanyOpen} onOpenChange={setIsAddCompanyOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Şirket Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yeni Şirket Ekle</DialogTitle>
              <DialogDescription>
                Sisteme yeni bir şirket ekleyin ve şirket yöneticisini atayın
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2 space-y-2">
                <Label>Şirket Ünvanı *</Label>
                <Input
                  placeholder="Örn: ABC İnşaat Ltd. Şti."
                  value={newCompanyData.name}
                  onChange={(e) => setNewCompanyData({ ...newCompanyData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Şirket Tipi *</Label>
                <Select
                  value={newCompanyData.type}
                  onValueChange={(value: any) => setNewCompanyData({ ...newCompanyData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">Ana Firma</SelectItem>
                    <SelectItem value="contractor">Taşeron</SelectItem>
                    <SelectItem value="subcontractor">Alt Taşeron</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>NACE Kodu</Label>
                <Input
                  placeholder="Örn: 41.20"
                  value={newCompanyData.naceCode}
                  onChange={(e) => setNewCompanyData({ ...newCompanyData, naceCode: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Vergi Numarası</Label>
                <Input
                  placeholder="10 haneli vergi numarası"
                  value={newCompanyData.taxNumber}
                  onChange={(e) => setNewCompanyData({ ...newCompanyData, taxNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefon *</Label>
                <Input
                  placeholder="+90 5XX XXX XX XX"
                  value={newCompanyData.phone}
                  onChange={(e) => setNewCompanyData({ ...newCompanyData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>E-posta *</Label>
                <Input
                  type="email"
                  placeholder="info@sirket.com"
                  value={newCompanyData.email}
                  onChange={(e) => setNewCompanyData({ ...newCompanyData, email: e.target.value })}
                />
              </div>
              <div className="col-span-2 pt-4 border-t">
                <h3 className="font-semibold mb-3">Adres Bilgileri</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>İl *</Label>
                    <Input
                      placeholder="Örn: İstanbul"
                      value={newCompanyData.city}
                      onChange={(e) => setNewCompanyData({ ...newCompanyData, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>İlçe *</Label>
                    <Input
                      placeholder="Örn: Beşiktaş"
                      value={newCompanyData.district}
                      onChange={(e) => setNewCompanyData({ ...newCompanyData, district: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Detay Adres *</Label>
                    <Input
                      placeholder="Mahalle, sokak, bina no, kat, daire"
                      value={newCompanyData.addressDetail}
                      onChange={(e) => setNewCompanyData({ ...newCompanyData, addressDetail: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Posta Kodu</Label>
                    <Input
                      placeholder="Örn: 34330"
                      value={newCompanyData.postalCode}
                      onChange={(e) => setNewCompanyData({ ...newCompanyData, postalCode: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="col-span-2 pt-4 border-t">
                <h3 className="font-semibold mb-3">Şirket Yöneticisi Atama (Opsiyonel)</h3>
                <div className="space-y-2">
                  <Label>Şirket Admini</Label>
                  <Select
                    value={newCompanyData.adminUserId}
                    onValueChange={(value) => setNewCompanyData({ ...newCompanyData, adminUserId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Mevcut kullanıcıdan seçin (veya boş bırakın)" />
                    </SelectTrigger>
                    <SelectContent>
                      {systemUsers
                        .filter((u) => u.status === 'active' && (u.role === 'center_manager' || u.role === 'contractor_manager'))
                        .map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.firstName} {u.lastName} ({u.email})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Şirket admini sonradan da atanabilir veya yeni kullanıcı oluşturulabilir.
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddCompanyOpen(false)}>
                İptal
              </Button>
              <Button 
                onClick={handleCreateCompany}
                disabled={!newCompanyData.name || !newCompanyData.phone || !newCompanyData.email || !newCompanyData.city}
              >
                Şirket Oluştur
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Toplam Şirket</p>
                <p className="text-2xl font-bold mt-1">{companies.length}</p>
              </div>
              <Building2 className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Ana Firma</p>
                <p className="text-2xl font-bold mt-1">
                  {companies.filter((c) => c.type === 'main').length}
                </p>
              </div>
              <Building2 className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Taşeron</p>
                <p className="text-2xl font-bold mt-1">
                  {companies.filter((c) => c.type === 'contractor').length}
                </p>
              </div>
              <Building2 className="w-8 h-8 text-info" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Alt Taşeron</p>
                <p className="text-2xl font-bold mt-1">
                  {companies.filter((c) => c.type === 'subcontractor').length}
                </p>
              </div>
              <Building2 className="w-8 h-8 text-secondary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Şirket adı veya NACE kodu ara..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Companies List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCompanies.map((company) => {
          const companyUsers = getUsersByCompanyId(company.id)
          const adminUser = systemUsers.find((u) => u.id === company.adminUserId)

          return (
            <Card key={company.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{company.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {getCompanyTypeBadge(company.type)}
                      {company.naceCode && (
                        <Badge variant="outline" className="text-xs">
                          NACE: {company.naceCode}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Detayları Görüntüle</DropdownMenuItem>
                      <DropdownMenuItem>Düzenle</DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedCompanyId(company.id)
                          setIsAddUserOpen(true)
                        }}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Yeni Kullanıcı Ekle
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {adminUser && (
                  <div className="p-2 rounded bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2 text-xs">
                      <Shield className="w-3 h-3 text-primary" />
                      <span className="text-muted-foreground">Şirket Admini:</span>
                    </div>
                    <p className="text-sm font-medium mt-1">
                      {adminUser.firstName} {adminUser.lastName}
                    </p>
                  </div>
                )}
                
                <div className="space-y-2">
                  {company.address && (
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                      <span>
                        {company.address.detail}, {company.address.district}/{company.address.city}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    {company.phone}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="w-3 h-3" />
                    {company.contact}
                  </div>
                  {company.taxNumber && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FileText className="w-3 h-3" />
                      VKN: {company.taxNumber}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Kullanıcı Sayısı:</span>
                    <span className="font-semibold ml-2">{companyUsers.length}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCompanyId(company.id)
                      setIsAddUserOpen(true)
                    }}
                  >
                    <UserPlus className="w-3 h-3 mr-1" />
                    Kullanıcı Ekle
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Şirket Kullanıcısı Ekle</DialogTitle>
            <DialogDescription>
              {selectedCompanyId && companies.find((c) => c.id === selectedCompanyId)?.name} için yeni kullanıcı oluşturun.
              Kullanıcıya aktivasyon e-postası gönderilecektir.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Ad *</Label>
              <Input
                placeholder="Örn: Ahmet"
                value={newUserData.firstName}
                onChange={(e) => setNewUserData({ ...newUserData, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Soyad *</Label>
              <Input
                placeholder="Örn: Yılmaz"
                value={newUserData.lastName}
                onChange={(e) => setNewUserData({ ...newUserData, lastName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>E-posta *</Label>
              <Input
                type="email"
                placeholder="ahmet@sirket.com"
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Telefon</Label>
              <Input
                placeholder="+90 5XX XXX XX XX"
                value={newUserData.phone}
                onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Personel Kodu *</Label>
              <Input
                placeholder="Örn: TI-004"
                value={newUserData.employeeCode}
                onChange={(e) => setNewUserData({ ...newUserData, employeeCode: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Ünvan *</Label>
              <Input
                placeholder="Örn: İnşaat Mühendisi"
                value={newUserData.title}
                onChange={(e) => setNewUserData({ ...newUserData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Departman</Label>
              <Input
                placeholder="Örn: İnşaat"
                value={newUserData.department}
                onChange={(e) => setNewUserData({ ...newUserData, department: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Rol *</Label>
              <Select
                value={newUserData.role}
                onValueChange={(value) => setNewUserData({ ...newUserData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contractor_manager">Taşeron Yöneticisi</SelectItem>
                  <SelectItem value="isg_specialist">İSG Uzmanı</SelectItem>
                  <SelectItem value="doctor">İşyeri Hekimi</SelectItem>
                  <SelectItem value="employee">Çalışan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
              İptal
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={
                !newUserData.firstName ||
                !newUserData.lastName ||
                !newUserData.email ||
                !newUserData.employeeCode ||
                !newUserData.title
              }
            >
              <Send className="w-4 h-4 mr-2" />
              Kullanıcı Oluştur & Mail Gönder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
