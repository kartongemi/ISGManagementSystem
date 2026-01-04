import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { 
  GraduationCap, 
  Calendar, 
  Users, 
  FileCheck, 
  Plus, 
  Search,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { getUserEmployees } from '@/lib/permissions'
import { certificates, trainings, getEmployeeById, getTrainingById, getCompanyById } from '@/lib/mockData'

export function TrainingCompetency() {
  const [searchTerm, setSearchTerm] = useState('')
  const { user } = useAuthStore()

  if (!user) return null

  const employees = getUserEmployees(user)
  
  // Sertifikaları rol bazlı filtrele
  const userCertificates = certificates.filter((cert) => {
    const employee = getEmployeeById(cert.employeeId)
    return employee && employees.some((e) => e.id === employee.id)
  })

  const upcomingTrainings = [
    { 
      id: '1', 
      title: 'Yangın Söndürme Eğitimi', 
      date: '15 Ocak 2025',
      time: '09:00 - 17:00',
      location: 'Şantiye 1 - Eğitim Salonu',
      instructor: 'Ahmet Yılmaz',
      capacity: 50,
      registered: 45,
      status: 'upcoming'
    },
    { 
      id: '2', 
      title: 'Kapalı Alan Çalışma İzni', 
      date: '18 Ocak 2025',
      time: '09:00 - 16:00',
      location: 'Merkez Ofis',
      instructor: 'Mehmet Kaya',
      capacity: 25,
      registered: 22,
      status: 'upcoming'
    },
  ]

  // Yetkinlik matrisi hesaplama
  const competencyMatrix = employees.slice(0, 5).map((employee) => {
    const empCerts = certificates.filter((c) => c.employeeId === employee.id)
    const requiredCerts = ['İSG-A', 'İlk Yardım', 'Yangın']
    const completedCerts = empCerts.map((c) => {
      const training = getTrainingById(c.trainingId)
      return training?.name.split(' ')[0] || ''
    })
    
    return {
      employee: employee.name,
      position: employee.title,
      requiredCerts,
      completedCerts,
      completion: Math.round((completedCerts.length / requiredCerts.length) * 100)
    }
  })

  // İstatistikler
  const expiringCerts = userCertificates.filter((c) => c.status === 'expiring').length
  const totalParticipants = employees.length
  const avgCompetency = Math.round(
    competencyMatrix.reduce((acc, curr) => acc + curr.completion, 0) / competencyMatrix.length
  )

  const getStatusBadge = (status: string) => {
    if (status === 'expired') {
      return <Badge variant="destructive" className="gap-1"><AlertTriangle className="w-3 h-3" /> Süresi Doldu</Badge>
    }
    if (status === 'expiring') {
      return <Badge className="bg-warning text-warning-foreground gap-1"><Clock className="w-3 h-3" /> Yaklaşıyor</Badge>
    }
    return <Badge className="bg-success gap-1"><CheckCircle2 className="w-3 h-3" /> Geçerli</Badge>
  }

  const calculateDaysLeft = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const today = new Date()
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Eğitim & Yetkinlik Yönetimi</h1>
          <p className="text-muted-foreground mt-1">
            {user.role === 'center_manager' && 'Tüm personel eğitimleri ve yetkinlik takibi'}
            {user.role === 'project_manager' && 'Proje personelinin eğitim ve yetkinlik durumu'}
            {user.role === 'contractor_manager' && 'Şirket personelinin eğitim kayıtları'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Toplu Yükle
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Eğitim
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktif Eğitimler</p>
                <p className="text-3xl font-bold mt-2">{trainings.length}</p>
              </div>
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Personel</p>
                <p className="text-3xl font-bold mt-2">{totalParticipants}</p>
              </div>
              <Users className="w-8 h-8 text-info" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Süresi Yaklaşan</p>
                <p className="text-3xl font-bold mt-2 text-warning">{expiringCerts}</p>
              </div>
              <Clock className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Yetkinlik Oranı</p>
                <p className="text-3xl font-bold mt-2 text-success">{avgCompetency}%</p>
              </div>
              <FileCheck className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="catalog" className="space-y-6">
        <TabsList>
          <TabsTrigger value="catalog">Eğitim Kataloğu</TabsTrigger>
          <TabsTrigger value="schedule">Eğitim Planı</TabsTrigger>
          <TabsTrigger value="certificates">Sertifikalar</TabsTrigger>
          <TabsTrigger value="competency">Yetkinlik Matrisi</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Eğitim ara..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {trainings.map((training) => {
              const certCount = certificates.filter((c) => c.trainingId === training.id).length
              
              return (
                <Card key={training.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{training.name}</CardTitle>
                        <CardDescription className="mt-1">
                          Geçerlilik: {training.validityMonths} ay
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">{training.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Sertifikalı Personel
                      </span>
                      <span className="font-semibold">{certCount} kişi</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" size="sm">
                        Detaylar
                      </Button>
                      <Button className="flex-1" size="sm">
                        Plan Oluştur
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Yaklaşan Eğitimler</CardTitle>
                  <CardDescription>Planlanmış eğitim programları</CardDescription>
                </div>
                <Button>
                  <Calendar className="w-4 h-4 mr-2" />
                  Yeni Plan
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingTrainings.map((training) => (
                <div key={training.id} className="p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{training.title}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {training.date}
                            </span>
                            <span>{training.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{training.location}</p>
                          <p className="text-sm mt-1">Eğitmen: {training.instructor}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Kayıt Durumu</span>
                            <span className="font-medium">{training.registered}/{training.capacity}</span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary"
                              style={{ width: `${(training.registered / training.capacity) * 100}%` }}
                            />
                          </div>
                        </div>
                        <Button size="sm">Katılımcı Ekle</Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sertifika Takibi</CardTitle>
                  <CardDescription>Personel sertifikaları ve geçerlilik süreleri</CardDescription>
                </div>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Rapor İndir
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium">Çalışan</th>
                      <th className="text-left p-3 text-sm font-medium">Şirket</th>
                      <th className="text-left p-3 text-sm font-medium">Sertifika</th>
                      <th className="text-left p-3 text-sm font-medium">Veriliş</th>
                      <th className="text-left p-3 text-sm font-medium">Bitiş</th>
                      <th className="text-left p-3 text-sm font-medium">Kalan</th>
                      <th className="text-left p-3 text-sm font-medium">Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userCertificates.map((cert) => {
                      const employee = getEmployeeById(cert.employeeId)
                      const training = getTrainingById(cert.trainingId)
                      const company = employee ? getCompanyById(employee.companyId) : null
                      const daysLeft = calculateDaysLeft(cert.expiryDate)
                      
                      if (!employee || !training || !company) return null
                      
                      return (
                        <tr key={cert.id} className="border-t border-border hover:bg-accent/50">
                          <td className="p-3 font-medium">{employee.name}</td>
                          <td className="p-3 text-sm text-muted-foreground">{company.name}</td>
                          <td className="p-3 text-sm">{training.name}</td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {new Date(cert.issueDate).toLocaleDateString('tr-TR')}
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {new Date(cert.expiryDate).toLocaleDateString('tr-TR')}
                          </td>
                          <td className="p-3 text-sm font-medium">{daysLeft} gün</td>
                          <td className="p-3">{getStatusBadge(cert.status)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Yetkinlik Matrisi</CardTitle>
              <CardDescription>Personel bazında gerekli ve tamamlanan eğitimler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {competencyMatrix.map((item, i) => (
                  <div key={i} className="p-4 rounded-lg border border-border">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-semibold">{item.employee}</div>
                        <div className="text-sm text-muted-foreground">{item.position}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${
                          item.completion === 100 ? 'text-success' : 
                          item.completion >= 50 ? 'text-warning' : 
                          'text-danger'
                        }`}>
                          {item.completion}%
                        </div>
                        <div className="text-xs text-muted-foreground">Tamamlanma</div>
                      </div>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden mb-3">
                      <div 
                        className={`h-full ${
                          item.completion === 100 ? 'bg-success' : 
                          item.completion >= 50 ? 'bg-warning' : 
                          'bg-danger'
                        }`}
                        style={{ width: `${item.completion}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground mb-2">Gerekli Belgeler</div>
                        <div className="flex flex-wrap gap-1">
                          {item.requiredCerts.map((cert, j) => (
                            <Badge key={j} variant="outline" className="text-xs">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-2">Tamamlanan Belgeler</div>
                        <div className="flex flex-wrap gap-1">
                          {item.completedCerts.map((cert, j) => (
                            <Badge key={j} className="bg-success text-xs">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
