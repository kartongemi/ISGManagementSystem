import { create } from 'zustand'

/**
 * ⚠️ KULLANICILAR (SystemUser):
 * Web sayfasına giriş yapabilen kişiler. Her kullanıcı bir personel değildir.
 * Örnek: Proje yöneticisi, merkez yöneticisi, İSG uzmanı
 * 
 * ⚠️ PERSONELLER (Employee):
 * Sahada çalışan kişiler. Web erişimleri yok. Sadece evrakları yüklenir.
 * Örnek: İnşaat işçisi, elektrikçi, makine operatörü
 */

export type UserRole = 
  | 'center_manager'      // Ana Şirket Merkez Yöneticisi - Tüm projeler ve şirketler
  | 'project_manager'     // Ana Şirket Proje Yöneticisi - Sadece kendi projeleri
  | 'contractor_manager'  // Taşeron Yöneticisi - Kendi şirketi ve personeli
  | 'isg_specialist'      // İSG Uzmanı
  | 'doctor'              // İşyeri Hekimi
  | 'employee'            // Çalışan

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  company: string
  companyId: string
  companyType: 'main' | 'contractor'
  projectIds?: string[]  // Proje yöneticisi için atandığı projeler
}

interface AuthState {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

// Mock users for demonstration
const mockUsers: Record<string, User> = {
  // Ana Şirket Merkez Yöneticisi - Tüm erişim
  'merkez@anafirma.com': {
    id: '1',
    name: 'Ahmet Yılmaz',
    email: 'merkez@anafirma.com',
    role: 'center_manager',
    company: 'Ana Firma A.Ş.',
    companyId: 'comp-1',
    companyType: 'main',
  },
  // Ana Şirket Proje Yöneticisi - Sadece Proje 1 ve 2
  'proje@anafirma.com': {
    id: '2',
    name: 'Ayşe Demir',
    email: 'proje@anafirma.com',
    role: 'project_manager',
    company: 'Ana Firma A.Ş.',
    companyId: 'comp-1',
    companyType: 'main',
    projectIds: ['proj-1', 'proj-2'],
  },
  // Taşeron Yöneticisi - Sadece kendi şirketi
  'manager@taseron.com': {
    id: '3',
    name: 'Mehmet Kaya',
    email: 'manager@taseron.com',
    role: 'contractor_manager',
    company: 'Taşeron İnşaat Ltd.',
    companyId: 'comp-2',
    companyType: 'contractor',
  },
  // İSG Uzmanı
  'isg@anafirma.com': {
    id: '4',
    name: 'Fatma Şahin',
    email: 'isg@anafirma.com',
    role: 'isg_specialist',
    company: 'Ana Firma A.Ş.',
    companyId: 'comp-1',
    companyType: 'main',
  },
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: async (email: string, _password: string) => {
    // Mock login - accept any password
    await new Promise((resolve) => setTimeout(resolve, 500))
    const user = mockUsers[email]
    if (user) {
      set({ user })
    } else {
      throw new Error('Geçersiz kullanıcı bilgileri')
    }
  },
  logout: () => set({ user: null }),
}))
