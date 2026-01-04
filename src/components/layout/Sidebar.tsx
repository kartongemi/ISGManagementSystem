import { 
  LayoutDashboard, 
  Building2, 
  AlertTriangle, 
  ClipboardCheck, 
  AlertCircle,
  CheckSquare,
  GraduationCap,
  Stethoscope,
  FileCheck,
  Wrench,
  HardHat,
  TestTube,
  FileText,
  MessageSquare,
  BarChart3,
  Bot,
  Settings,
  Shield,
  Users,
  Building,
  Briefcase
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'

interface SidebarProps {
  currentPage: string
  onNavigate: (page: string) => void
}

const menuItems = [
  { id: 'dashboard', label: 'Gösterge Paneli', icon: LayoutDashboard, active: true, requiresRole: null },
  { id: 'organizations', label: 'Organizasyon & Projeler', icon: Building2, active: true, requiresRole: null },
  { id: 'customers', label: 'Müşteri Yönetimi', icon: Users, active: true, requiresRole: 'center_manager' },
  { id: 'projects', label: 'Proje Yönetimi', icon: Briefcase, active: true, requiresRole: 'center_manager' },
  { id: 'companies', label: 'Şirket Yönetimi', icon: Building, active: true, requiresRole: 'center_manager' },
  { id: 'system-users', label: 'Sistem Kullanıcıları', icon: Shield, active: true, requiresRole: null, allowedRoles: ['center_manager', 'project_manager'] },
  { id: 'personnel', label: 'Personel Yönetimi', icon: Users, active: true, requiresRole: null },
  { id: 'risk-management', label: 'Tehlike–Risk Yönetimi', icon: AlertTriangle, active: false, requiresRole: null },
  { id: 'inspection', label: 'Saha / Denetim & Gözlem', icon: ClipboardCheck, active: true, requiresRole: null },
  { id: 'incidents', label: 'Olay / Kaza / Ramak Kala', icon: AlertCircle, active: false, requiresRole: null },
  { id: 'capa', label: 'Aksiyon & İyileştirme', icon: CheckSquare, active: false, requiresRole: null },
  { id: 'training', label: 'Eğitim & Yetkinlik', icon: GraduationCap, active: true, requiresRole: null },
  { id: 'documents', label: 'Evrak Gereksinimleri', icon: FileText, active: true, requiresRole: null },
  { id: 'document-approval', label: 'Evrak Onay Sistemi', icon: FileCheck, active: true, requiresRole: null },
  { id: 'health', label: 'Sağlık (İşyeri Hekimi)', icon: Stethoscope, active: false, requiresRole: null },
  { id: 'ptw', label: 'İzinler / PTW', icon: FileCheck, active: false, requiresRole: null },
  { id: 'equipment', label: 'Ekipman & Kontroller', icon: Wrench, active: false, requiresRole: null },
  { id: 'ppe', label: 'KKD Yönetimi', icon: HardHat, active: false, requiresRole: null },
  { id: 'chemicals', label: 'Kimyasal & MSDS', icon: TestTube, active: false, requiresRole: null },
  { id: 'iso-documents', label: 'Doküman & ISO', icon: FileText, active: false, requiresRole: null },
  { id: 'communication', label: 'İletişim & Duyurular', icon: MessageSquare, active: false, requiresRole: null },
  { id: 'reports', label: 'Raporlama & Analitik', icon: BarChart3, active: false, requiresRole: null },
  { id: 'ai-assistant', label: 'Yapay Zeka Asistanı', icon: Bot, active: true, requiresRole: null },
  { id: 'settings', label: 'Ayarlar & Güvenlik', icon: Settings, active: false, requiresRole: null },
]

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { user } = useAuthStore()
  
  // Menü öğelerini rol bazlı filtrele
  const visibleMenuItems = menuItems.filter((item) => {
    // Eğer requiresRole varsa, sadece o rol görebilir
    if (item.requiresRole) {
      return user?.role === item.requiresRole
    }
    // Eğer allowedRoles varsa, sadece o roller görebilir
    if ('allowedRoles' in item && item.allowedRoles) {
      return item.allowedRoles.includes(user?.role || '')
    }
    // Yoksa herkes görebilir
    return true
  })
  
  return (
    <aside className="w-64 bg-card border-r border-border overflow-y-auto">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg">İSG Yönetim</h1>
            <p className="text-xs text-muted-foreground">v1.0</p>
          </div>
        </div>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-1">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => item.active && onNavigate(item.id)}
                  disabled={!item.active}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : item.active
                      ? 'text-foreground hover:bg-accent'
                      : 'text-muted-foreground cursor-not-allowed opacity-50'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {!item.active && (
                    <span className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">V2</span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
