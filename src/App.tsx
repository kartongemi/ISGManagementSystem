import { useState } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { Dashboard } from './pages/Dashboard'
import { Organizations } from './pages/Organizations'
import { SystemUserManagement } from './pages/SystemUserManagement'
import { PersonnelManagement } from './pages/PersonnelManagement'
import { CompanyManagement } from './pages/CompanyManagement'
import { CustomerManagement } from './pages/CustomerManagement'
import { ProjectManagement } from './pages/ProjectManagement'
import { TrainingCompetency } from './pages/TrainingCompetency'
import { DocumentRequirements } from './pages/DocumentRequirements'
import { DocumentApproval } from './pages/DocumentApproval'
import { AIAssistant } from './pages/AIAssistant'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { useAuthStore } from './stores/authStore'
import { LoginPage } from './pages/LoginPage'
import { supabase } from "./lib/supabase";

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const { user } = useAuthStore()

  if (!user) {
    return <LoginPage />
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'organizations':
        return <Organizations />
      case 'customers':
        return <CustomerManagement />
      case 'projects':
        return <ProjectManagement />
      case 'companies':
        return <CompanyManagement />
      case 'system-users':
        return <SystemUserManagement />
      case 'personnel':
        return <PersonnelManagement />
      case 'training':
        return <TrainingCompetency />
      case 'documents':
        return <DocumentRequirements />
      case 'document-approval':
        return <DocumentApproval />
      case 'ai-assistant':
        return <AIAssistant />
      case 'risk-management':
        return <PlaceholderPage title="Tehlike–Risk Yönetimi" />
      case 'inspection':
        return <PlaceholderPage title="Saha / Denetim & Gözlem" />
      case 'incidents':
        return <PlaceholderPage title="Olay / Kaza / Ramak Kala" />
      case 'capa':
        return <PlaceholderPage title="Aksiyon & İyileştirme (CAPA)" />
      case 'health':
        return <PlaceholderPage title="Sağlık (İşyeri Hekimi Modülü)" />
      case 'ptw':
        return <PlaceholderPage title="İzinler / Çalışma İzin Sistemi (PTW)" />
      case 'equipment':
        return <PlaceholderPage title="Ekipman & Periyodik Kontroller" />
      case 'ppe':
        return <PlaceholderPage title="KKD Yönetimi" />
      case 'chemicals':
        return <PlaceholderPage title="Kimyasal & MSDS" />
      case 'iso-documents':
        return <PlaceholderPage title="Doküman & ISO Yönetim Sistemi" />
      case 'communication':
        return <PlaceholderPage title="İletişim & Duyurular" />
      case 'reports':
        return <PlaceholderPage title="Raporlama & Analitik" />
      case 'settings':
        return <PlaceholderPage title="Ayarlar & Güvenlik" />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-secondary/30">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}

export default App
