import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  GraduationCap, 
  AlertCircle, 
  TrendingUp,
  Calendar,
  Building2,
  Award,
  Clock,
  FileText,
  AlertTriangle
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { getUserProjects } from '@/lib/permissions'
import { getEmployeesWithMissingDocuments } from '@/lib/mockData'

export function Dashboard() {
  const { user } = useAuthStore()
  
  // Evrak eksik personelleri hesapla
  let totalMissingDocs = 0
  if (user) {
    const projects = getUserProjects(user)
    projects.forEach((proj) => {
      const missing = getEmployeesWithMissingDocuments(proj.id)
      totalMissingDocs += missing.length
    })
  }

  const stats = [
    { 
      label: 'Toplam Personel', 
      value: '847', 
      change: '+12', 
      icon: Users, 
      color: 'text-info' 
    },
    { 
      label: 'Aktif Eğitimler', 
      value: '24', 
      change: '+3', 
      icon: GraduationCap, 
      color: 'text-success' 
    },
    { 
      label: 'Yaklaşan Süreler', 
      value: '18', 
      change: '', 
      icon: AlertCircle, 
      color: 'text-warning' 
    },
    { 
      label: 'Evrak Eksik Personel', 
      value: totalMissingDocs.toString(), 
      change: '', 
      icon: FileText, 
      color: 'text-danger' 
    },
    { 
      label: 'Yetkinlik Oranı', 
      value: '87%', 
      change: '+5%', 
      icon: TrendingUp, 
      color: 'text-primary' 
    },
  ]

  const expiringCertificates = [
    { name: 'Ahmet Yıldız', company: 'Ana Firma A.Ş.', certificate: 'İSG-A Sınıfı', daysLeft: 7, status: 'danger' },
    { name: 'Mehmet Kaya', company: 'Taşeron İnşaat Ltd.', certificate: 'Yüksekte Çalışma', daysLeft: 12, status: 'warning' },
    { name: 'Ayşe Demir', company: 'Ana Firma A.Ş.', certificate: 'İlk Yardım', daysLeft: 15, status: 'warning' },
    { name: 'Fatma Şahin', company: 'Taşeron İnşaat Ltd.', certificate: 'Forklift Ehliyeti', daysLeft: 22, status: 'info' },
  ]

  const upcomingTrainings = [
    { title: 'Yangın Söndürme Eğitimi', date: '15 Ocak 2025', participants: 45, location: 'Şantiye 1' },
    { title: 'Kapalı Alan Çalışma İzni', date: '18 Ocak 2025', participants: 22, location: 'Merkez' },
    { title: 'Acil Durum Tatbikatı', date: '22 Ocak 2025', participants: 120, location: 'Tüm Sahalar' },
  ]

  const companyStats = [
    { name: 'Ana Firma A.Ş.', employees: 453, compliance: 92 },
    { name: 'Taşeron İnşaat Ltd.', employees: 234, compliance: 85 },
    { name: 'Alt Taşeron Elektrik', employees: 89, compliance: 78 },
    { name: 'Diğer Taşeronlar', employees: 71, compliance: 81 },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gösterge Paneli</h1>
        <p className="text-muted-foreground mt-1">Personel yetkinlik durumu ve eğitim takibi özeti</p>
      </div>

      {/* Stats Grid */}
      {/* Evrak Eksikliği Uyarısı */}
      {totalMissingDocs > 0 && (
        <Card className="border-warning bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-warning">Evrak Eksikliği Tespit Edildi</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {totalMissingDocs} personelin zorunlu evrakları eksik. Lütfen taşeron yöneticilerine bildiriniz.
                </p>
              </div>
              <Button variant="outline" size="sm">
                Detaylar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <h3 className="text-3xl font-bold">{stat.value}</h3>
                      {stat.change && (
                        <span className="text-sm text-success font-medium">{stat.change}</span>
                      )}
                    </div>
                  </div>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Expiring Certificates */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Süresi Yaklaşan Belgeler
                </CardTitle>
                <CardDescription>30 gün içinde süresi dolacak sertifikalar</CardDescription>
              </div>
              <Button variant="outline" size="sm">Tümü</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiringCertificates.map((cert, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition-colors">
                  <div className="flex-1">
                    <div className="font-medium">{cert.name}</div>
                    <div className="text-sm text-muted-foreground">{cert.company}</div>
                    <div className="text-sm font-medium text-foreground mt-1">{cert.certificate}</div>
                  </div>
                  <Badge 
                    variant={cert.status === 'danger' ? 'destructive' : cert.status === 'warning' ? 'default' : 'secondary'}
                    className={cert.status === 'warning' ? 'bg-warning text-warning-foreground' : ''}
                  >
                    {cert.daysLeft} gün
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Trainings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Yaklaşan Eğitimler
                </CardTitle>
                <CardDescription>Planlanmış eğitim programları</CardDescription>
              </div>
              <Button variant="outline" size="sm">Takvim</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingTrainings.map((training, i) => (
                <div key={i} className="p-3 rounded-lg border border-border hover:bg-accent transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{training.title}</div>
                      <div className="text-sm text-muted-foreground mt-1 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {training.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {training.participants} kişi
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{training.location}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Company Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Şirket Bazlı Yetkinlik Durumu
          </CardTitle>
          <CardDescription>Ana firma ve taşeronların uyumluluk oranları</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {companyStats.map((company, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Award className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{company.name}</div>
                      <div className="text-sm text-muted-foreground">{company.employees} çalışan</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{company.compliance}%</div>
                    <div className="text-xs text-muted-foreground">Uyumluluk</div>
                  </div>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      company.compliance >= 90 ? 'bg-success' : 
                      company.compliance >= 80 ? 'bg-warning' : 
                      'bg-danger'
                    }`}
                    style={{ width: `${company.compliance}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
