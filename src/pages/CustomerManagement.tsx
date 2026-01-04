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
  Mail,
  Phone,
  MapPin,
  Building2,
  Shield,
  Edit,
  Trash2,
  UserCircle
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { canManageCustomers } from '@/lib/permissions'
import { customers } from '@/lib/mockData'
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
import { Textarea } from '@/components/ui/textarea'

export function CustomerManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const [isAddContactOpen, setIsAddContactOpen] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    type: 'corporate' as 'corporate' | 'individual',
    taxNumber: '',
    phone: '',
    email: '',
    city: '',
    district: '',
    addressDetail: '',
    postalCode: '',
  })
  const [newContactData, setNewContactData] = useState({
    name: '',
    title: '',
    phone: '',
    email: '',
    isPrimary: false,
  })

  const { user } = useAuthStore()
  const { toast } = useToast()

  if (!user) return null

  // Yetki kontrolü
  if (!canManageCustomers(user)) {
    return (
      <div className="p-6">
        <Card className="border-danger">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-danger">
              <Shield className="w-8 h-8" />
              <div>
                <h2 className="text-xl font-bold">Erişim Engellendi</h2>
                <p className="text-muted-foreground mt-1">
                  Müşteri yönetimi sayfasına sadece merkez yöneticileri erişebilir.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.taxNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateCustomer = () => {
    const newCustomer = {
      id: `cust-${customers.length + 1}`,
      name: newCustomerData.name,
      type: newCustomerData.type,
      taxNumber: newCustomerData.taxNumber,
      phone: newCustomerData.phone,
      email: newCustomerData.email,
      address: {
        city: newCustomerData.city,
        district: newCustomerData.district,
        detail: newCustomerData.addressDetail,
        postalCode: newCustomerData.postalCode,
      },
      contacts: [],
      createdAt: new Date().toISOString(),
      createdBy: user.id,
      updatedAt: new Date().toISOString(),
    }

    customers.push(newCustomer)

    toast({
      title: 'Müşteri Oluşturuldu',
      description: `${newCustomer.name} başarıyla sisteme eklendi.`,
    })

    setIsAddCustomerOpen(false)
    setNewCustomerData({
      name: '',
      type: 'corporate',
      taxNumber: '',
      phone: '',
      email: '',
      city: '',
      district: '',
      addressDetail: '',
      postalCode: '',
    })
  }

  const handleAddContact = () => {
    const customer = customers.find((c) => c.id === selectedCustomerId)
    if (!customer) return

    const newContact = {
      id: `cont-${customer.contacts.length + 1}`,
      name: newContactData.name,
      title: newContactData.title,
      phone: newContactData.phone,
      email: newContactData.email,
      isPrimary: newContactData.isPrimary,
    }

    customer.contacts.push(newContact)

    toast({
      title: 'Yetkili Eklendi',
      description: `${newContact.name} müşteriye yetkili olarak eklendi.`,
    })

    setIsAddContactOpen(false)
    setNewContactData({
      name: '',
      title: '',
      phone: '',
      email: '',
      isPrimary: false,
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Müşteri Yönetimi</h1>
          <p className="text-muted-foreground mt-1">
            Proje müşterilerini ve yetkili kişileri yönetin
          </p>
        </div>
        <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Müşteri
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
              <DialogDescription>
                Sisteme yeni müşteri ekleyin. Proje oluştururken müşteri seçebilirsiniz.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2 space-y-2">
                <Label>Müşteri Adı *</Label>
                <Input
                  placeholder="Örn: İstanbul Büyükşehir Belediyesi"
                  value={newCustomerData.name}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Müşteri Tipi *</Label>
                <Select
                  value={newCustomerData.type}
                  onValueChange={(value: any) => setNewCustomerData({ ...newCustomerData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corporate">Kurumsal</SelectItem>
                    <SelectItem value="individual">Bireysel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Vergi Numarası</Label>
                <Input
                  placeholder="10 haneli vergi numarası"
                  value={newCustomerData.taxNumber}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, taxNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefon *</Label>
                <Input
                  placeholder="+90 212 XXX XX XX"
                  value={newCustomerData.phone}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>E-posta *</Label>
                <Input
                  type="email"
                  placeholder="info@musteri.com"
                  value={newCustomerData.email}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, email: e.target.value })}
                />
              </div>
              <div className="col-span-2 pt-4 border-t">
                <h3 className="font-semibold mb-3">Adres Bilgileri</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>İl *</Label>
                    <Input
                      placeholder="Örn: İstanbul"
                      value={newCustomerData.city}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>İlçe *</Label>
                    <Input
                      placeholder="Örn: Fatih"
                      value={newCustomerData.district}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, district: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Detay Adres *</Label>
                    <Textarea
                      placeholder="Mahalle, sokak, bina no, kat"
                      value={newCustomerData.addressDetail}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, addressDetail: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Posta Kodu</Label>
                    <Input
                      placeholder="Örn: 34134"
                      value={newCustomerData.postalCode}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, postalCode: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddCustomerOpen(false)}>
                İptal
              </Button>
              <Button
                onClick={handleCreateCustomer}
                disabled={!newCustomerData.name || !newCustomerData.phone || !newCustomerData.email}
              >
                Müşteri Oluştur
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Müşteri</p>
                <p className="text-3xl font-bold mt-2">{customers.length}</p>
              </div>
              <Building2 className="w-10 h-10 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Kurumsal</p>
                <p className="text-3xl font-bold mt-2">
                  {customers.filter((c) => c.type === 'corporate').length}
                </p>
              </div>
              <Building2 className="w-10 h-10 text-info" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bireysel</p>
                <p className="text-3xl font-bold mt-2">
                  {customers.filter((c) => c.type === 'individual').length}
                </p>
              </div>
              <Users className="w-10 h-10 text-secondary" />
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
              placeholder="Müşteri adı, e-posta veya vergi numarası ara..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{customer.name}</CardTitle>
                    <Badge variant={customer.type === 'corporate' ? 'default' : 'secondary'}>
                      {customer.type === 'corporate' ? 'Kurumsal' : 'Bireysel'}
                    </Badge>
                  </div>
                  {customer.taxNumber && (
                    <p className="text-xs text-muted-foreground">VKN: {customer.taxNumber}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4 text-danger" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    {customer.address.detail}, {customer.address.district}/{customer.address.city}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{customer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{customer.email}</span>
                </div>
              </div>

              {/* Contacts */}
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <UserCircle className="w-4 h-4" />
                    Yetkili Kişiler ({customer.contacts.length})
                  </h4>
                  <Dialog open={isAddContactOpen && selectedCustomerId === customer.id} onOpenChange={(open) => {
                    setIsAddContactOpen(open)
                    if (open) setSelectedCustomerId(customer.id)
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="w-3 h-3 mr-1" />
                        Ekle
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Yetkili Kişi Ekle</DialogTitle>
                        <DialogDescription>
                          {customer.name} için yetkili kişi bilgilerini girin
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Ad Soyad *</Label>
                          <Input
                            placeholder="Örn: Ahmet Kılıç"
                            value={newContactData.name}
                            onChange={(e) => setNewContactData({ ...newContactData, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Ünvan *</Label>
                          <Input
                            placeholder="Örn: Fen İşleri Müdürü"
                            value={newContactData.title}
                            onChange={(e) => setNewContactData({ ...newContactData, title: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Telefon *</Label>
                          <Input
                            placeholder="+90 5XX XXX XX XX"
                            value={newContactData.phone}
                            onChange={(e) => setNewContactData({ ...newContactData, phone: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>E-posta *</Label>
                          <Input
                            type="email"
                            placeholder="ahmet@musteri.com"
                            value={newContactData.email}
                            onChange={(e) => setNewContactData({ ...newContactData, email: e.target.value })}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="isPrimary"
                            checked={newContactData.isPrimary}
                            onChange={(e) => setNewContactData({ ...newContactData, isPrimary: e.target.checked })}
                          />
                          <Label htmlFor="isPrimary" className="cursor-pointer">
                            Birincil yetkili
                          </Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddContactOpen(false)}>
                          İptal
                        </Button>
                        <Button
                          onClick={handleAddContact}
                          disabled={!newContactData.name || !newContactData.title || !newContactData.phone || !newContactData.email}
                        >
                          Yetkili Ekle
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {customer.contacts.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Henüz yetkili eklenmemiş</p>
                ) : (
                  <div className="space-y-2">
                    {customer.contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="p-2 rounded bg-accent/50 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{contact.name}</div>
                          {contact.isPrimary && (
                            <Badge variant="default" className="text-xs h-5">Birincil</Badge>
                          )}
                        </div>
                        <div className="text-muted-foreground mt-1">{contact.title}</div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {contact.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {contact.email}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Müşteri Bulunamadı</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Arama kriterlerinize uygun müşteri bulunamadı' : 'Henüz müşteri eklenmemiş'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
