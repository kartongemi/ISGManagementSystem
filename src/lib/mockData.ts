// Mock data for the application

export interface Company {
  id: string
  name: string
  type: 'main' | 'contractor' | 'subcontractor'
  location: string
  contact: string
  phone: string
  // Genişletilmiş alanlar
  naceCode?: string          // NACE kodu
  address?: {
    city: string             // İl
    district: string         // İlçe
    detail: string           // Detay adres
    postalCode?: string      // Posta kodu
  }
  adminUserId?: string       // Şirket yöneticisi (admin)
  taxNumber?: string         // Vergi numarası
  createdAt: string
  createdBy?: string
  updatedAt: string
}

// Müşteri Yönetimi
export interface Customer {
  id: string
  name: string
  type: 'corporate' | 'individual'
  taxNumber?: string
  phone: string
  email: string
  address: {
    city: string
    district: string
    detail: string
    postalCode?: string
  }
  contacts: CustomerContact[]  // Yetkili kişiler
  createdAt: string
  createdBy: string
  updatedAt: string
}

export interface CustomerContact {
  id: string
  name: string
  title: string
  phone: string
  email: string
  isPrimary: boolean
}

// Genişletilmiş Proje
export interface Project {
  id: string
  name: string
  projectCode: string        // Proje kodu (otomatik)
  customerId?: string        // Müşteri
  projectManagerId?: string  // Proje yöneticisi
  type: string               // Proje türü (konut, fabrika, vb.)
  description: string
  address: {
    city: string
    district: string
    detail: string
  }
  status: 'planning' | 'waiting' | 'ongoing' | 'completed'
  dates: {
    planningStart?: string
    actualStart?: string
    plannedEnd?: string
    actualEnd?: string
  }
  companyIds: string[]       // Şirketler bu projede çalışıyor
  createdAt: string
  createdBy: string
  updatedAt: string
}

// Personel: Sahada çalışan kişiler (web erişimi yok)
export interface Employee {
  id: string
  employeeCode: string       // Personel kodu (otomatik)
  firstName: string
  lastName: string
  title: string              // İnşaat Ustası, Elektrikçi, vb.
  companyId: string
  department: string
  phone?: string
  email?: string             // Kişisel email (web girişi için değil)
  status: 'active' | 'inactive'
  assignedProjectIds: string[]  // Atandığı projeler
  projectExitDates?: Record<string, string>  // Projeden çıkış tarihleri { projectId: exitDate }
  projectExitReasons?: Record<string, string> // Çıkış nedenleri { projectId: reason }
  hireDate?: string          // İşe giriş tarihi
  birthDate?: string         // Doğum tarihi
  nationalId?: string        // TC Kimlik No
  bloodType?: string         // Kan grubu
  emergencyContact?: {
    name: string
    phone: string
    relation: string
  }
  createdAt: string
  createdBy?: string
  updatedAt: string
}

export interface Training {
  id: string
  name: string
  category: string
  validityMonths: number
}

export interface Certificate {
  id: string
  employeeId: string
  trainingId: string
  issueDate: string
  expiryDate: string
  status: 'valid' | 'expiring' | 'expired'
}

// Evrak Yönetimi (Güncellenmiş - Geçerlilik tarihi eklendi)
export interface DocumentRequirement {
  id: string
  projectId: string
  name: string
  description?: string
  isMandatory: boolean
  hasExpiryDate: boolean      // Geçerlilik tarihi takibi var mı?
  validityMonths?: number     // Geçerlilik süresi (ay)
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface EmployeeDocument {
  id: string
  employeeId: string
  projectId: string
  requirementId: string
  fileName: string
  fileUrl: string       // Mock URL
  uploadedBy: string
  uploadedAt: string
  expiryDate?: string   // Geçerlilik bitiş tarihi (varsa)
  status: 'pending' | 'approved' | 'rejected'
  reviewedBy?: string
  reviewedAt?: string
  rejectionReason?: string
  notes?: string
}

export type UserRole = 
  | 'center_manager'      // Ana Şirket Merkez Yöneticisi
  | 'project_manager'     // Ana Şirket Proje Yöneticisi
  | 'contractor_manager'  // Taşeron Yöneticisi
  | 'isg_specialist'      // İSG Uzmanı
  | 'doctor'              // İşyeri Hekimi
  | 'employee'            // Çalışan

export type UserStatus = 'active' | 'passive' | 'locked' | 'pending_activation'

// Kullanıcı: Web sayfasına giriş yapabilen kişiler
export interface SystemUser {
  id: string
  userCode: string              // Kullanıcı kodu (otomatik)
  email: string
  username?: string
  phone?: string
  status: UserStatus
  password?: string             // Şifre (mock için)
  
  // Profil
  firstName: string
  lastName: string
  title: string                 // İş unvanı (Proje Müdürü, İSG Uzmanı, vb.)
  department: string
  jobPosition: string
  photoUrl?: string
  
  // Organizasyon
  companyId: string
  companyType: 'main' | 'contractor' | 'subcontractor'
  defaultProjectId?: string
  projectIds?: string[]         // Proje yöneticisi için
  
  // Yetki
  role: UserRole
  
  // Dil ve zaman
  language: 'tr' | 'en'
  timezone: string
  
  // Güvenlik
  emailVerified: boolean
  mfaEnabled: boolean
  lastLoginAt?: string
  failedLoginCount: number
  lockedUntil?: string
  
  // Tarihler
  createdAt: string
  createdBy?: string
  updatedAt: string
  updatedBy?: string
}

// Simple counters for auto-generation
let employeeCodeCounter = 100   // Personel kodları
let userCodeCounter = 20        // Kullanıcı kodları
let projectCodeCounter = 5

export function generateEmployeeCode(companyId: string): string {
  const company = companies.find((c) => c.id === companyId)
  employeeCodeCounter++
  
  if (!company) return `PER-${String(employeeCodeCounter).padStart(4, '0')}`
  
  const prefix = company.type === 'main' ? 'AF-PER' : 
                 company.type === 'contractor' ? 'TS-PER' : 'AT-PER'
  
  return `${prefix}-${String(employeeCodeCounter).padStart(3, '0')}`
}

export function generateUserCode(companyId: string): string {
  const company = companies.find((c) => c.id === companyId)
  userCodeCounter++
  
  if (!company) return `USR-${String(userCodeCounter).padStart(3, '0')}`
  
  const prefix = company.type === 'main' ? 'AF' : 
                 company.type === 'contractor' ? 'TS' : 'AT'
  
  return `${prefix}-${String(userCodeCounter).padStart(3, '0')}`
}

export function generateProjectCode(): string {
  projectCodeCounter++
  return `PRJ-${String(projectCodeCounter).padStart(4, '0')}`
}

// Default data generators
function getDefaultCustomers(): Customer[] {
  return [
    {
      id: 'cust-1',
      name: 'İstanbul Büyükşehir Belediyesi',
      type: 'corporate',
      taxNumber: '1234567890',
      phone: '+90 212 449 49 49',
      email: 'info@ibb.istanbul',
      address: {
        city: 'İstanbul',
        district: 'Fatih',
        detail: 'Saraçhane, Atatürk Bulvarı No: 1',
        postalCode: '34134',
      },
      contacts: [
        {
          id: 'cont-1',
          name: 'Ahmet Kılıç',
          title: 'Fen İşleri Müdürü',
          phone: '+90 212 449 50 50',
          email: 'ahmet.kilic@ibb.istanbul',
          isPrimary: true,
        },
        {
          id: 'cont-2',
          name: 'Ayşe Yılmaz',
          title: 'Proje Sorumlusu',
          phone: '+90 212 449 50 51',
          email: 'ayse.yilmaz@ibb.istanbul',
          isPrimary: false,
        },
      ],
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'user-1',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'cust-2',
      name: 'ABC Gayrimenkul A.Ş.',
      type: 'corporate',
      taxNumber: '9876543210',
      phone: '+90 216 555 44 33',
      email: 'info@abcgayrimenkul.com',
      address: {
        city: 'İstanbul',
        district: 'Kadıköy',
        detail: 'Kozyatağı Mahallesi, İş Kulesi No: 12',
        postalCode: '34742',
      },
      contacts: [
        {
          id: 'cont-3',
          name: 'Mehmet Öztürk',
          title: 'Genel Müdür',
          phone: '+90 532 123 45 67',
          email: 'mehmet.ozturk@abcgayrimenkul.com',
          isPrimary: true,
        },
      ],
      createdAt: '2024-02-15T00:00:00Z',
      createdBy: 'user-1',
      updatedAt: '2024-02-15T00:00:00Z',
    },
  ]
}

function getDefaultCompanies(): Company[] {
  return [
    {
      id: 'comp-1',
      name: 'Ana Firma A.Ş.',
      type: 'main',
      location: 'İstanbul, Türkiye',
      contact: 'info@anafirma.com',
      phone: '+90 212 555 10 00',
      naceCode: '41.20',
      address: {
        city: 'İstanbul',
        district: 'Beşiktaş',
        detail: 'Levent Mahallesi, İş Kuleleri Blok No: 1 Kat: 15',
        postalCode: '34330',
      },
      adminUserId: 'user-1',
      taxNumber: '1234567890',
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'system',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'comp-2',
      name: 'Taşeron İnşaat Ltd.',
      type: 'contractor',
      location: 'Ankara, Türkiye',
      contact: 'info@taseron.com',
      phone: '+90 312 444 20 00',
      naceCode: '43.99',
      address: {
        city: 'Ankara',
        district: 'Çankaya',
        detail: 'Kızılay Mahallesi, İnşaat Caddesi No: 45',
        postalCode: '06420',
      },
      adminUserId: 'user-4',
      taxNumber: '9876543210',
      createdAt: '2024-02-01T00:00:00Z',
      createdBy: 'user-1',
      updatedAt: '2024-02-01T00:00:00Z',
    },
    {
      id: 'comp-3',
      name: 'Alt Taşeron Elektrik',
      type: 'subcontractor',
      location: 'İzmir, Türkiye',
      contact: 'info@elektrik.com',
      phone: '+90 232 333 30 00',
      naceCode: '43.21',
      address: {
        city: 'İzmir',
        district: 'Konak',
        detail: 'Alsancak Mahallesi, Elektrik Sokak No: 12',
        postalCode: '35220',
      },
      adminUserId: 'user-6',
      taxNumber: '1357924680',
      createdAt: '2024-03-01T00:00:00Z',
      createdBy: 'user-1',
      updatedAt: '2024-03-01T00:00:00Z',
    },
    {
      id: 'comp-4',
      name: 'Makine Taşeron A.Ş.',
      type: 'contractor',
      location: 'Bursa, Türkiye',
      contact: 'info@makine.com',
      phone: '+90 224 222 40 00',
      naceCode: '28.99',
      address: {
        city: 'Bursa',
        district: 'Osmangazi',
        detail: 'Organize Sanayi Bölgesi, 5. Cadde No: 78',
        postalCode: '16150',
      },
      taxNumber: '2468013579',
      createdAt: '2024-04-01T00:00:00Z',
      createdBy: 'user-1',
      updatedAt: '2024-04-01T00:00:00Z',
    },
  ]
}

function getDefaultProjects(): Project[] {
  return [
    {
      id: 'proj-1',
      name: 'Şantiye 1 - Konut Projesi',
      projectCode: 'PRJ-0001',
      customerId: 'cust-2',
      projectManagerId: 'user-2',
      type: 'Konut İnşaatı',
      description: '250 konutluk modern yaşam kompleksi projesi',
      address: {
        city: 'İstanbul',
        district: 'Kadıköy',
        detail: 'Göztepe Mahallesi, Proje Alanı',
      },
      status: 'ongoing',
      dates: {
        planningStart: '2024-01-01',
        actualStart: '2024-02-15',
        plannedEnd: '2025-12-31',
      },
      companyIds: ['comp-1', 'comp-2', 'comp-3'],
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'user-1',
      updatedAt: '2024-02-15T00:00:00Z',
    },
    {
      id: 'proj-2',
      name: 'Fabrika İnşaatı',
      projectCode: 'PRJ-0002',
      customerId: 'cust-1',
      projectManagerId: 'user-2',
      type: 'Endüstriyel Tesis',
      description: 'Otomotiv yan sanayi fabrikası inşaatı',
      address: {
        city: 'Kocaeli',
        district: 'Gebze',
        detail: 'Organize Sanayi Bölgesi 4. Cadde',
      },
      status: 'ongoing',
      dates: {
        planningStart: '2024-03-01',
        actualStart: '2024-04-10',
        plannedEnd: '2026-03-31',
      },
      companyIds: ['comp-1', 'comp-2'],
      createdAt: '2024-03-01T00:00:00Z',
      createdBy: 'user-1',
      updatedAt: '2024-04-10T00:00:00Z',
    },
    {
      id: 'proj-3',
      name: 'AVM Yenileme',
      projectCode: 'PRJ-0003',
      type: 'Renovasyon',
      description: 'Mevcut AVM binasının yenileme ve genişletme projesi',
      address: {
        city: 'Ankara',
        district: 'Çankaya',
        detail: 'Kızılay Meydanı',
      },
      status: 'ongoing',
      dates: {
        planningStart: '2024-06-01',
        actualStart: '2024-07-15',
        plannedEnd: '2025-06-30',
      },
      companyIds: ['comp-1', 'comp-4'],
      createdAt: '2024-06-01T00:00:00Z',
      createdBy: 'user-1',
      updatedAt: '2024-07-15T00:00:00Z',
    },
    {
      id: 'proj-4',
      name: 'Altyapı Projesi',
      projectCode: 'PRJ-0004',
      customerId: 'cust-1',
      type: 'Altyapı',
      description: 'Elektrik ve su altyapısı yenileme projesi',
      address: {
        city: 'İzmir',
        district: 'Bornova',
        detail: 'Şehir merkezi çevre yolları',
      },
      status: 'planning',
      dates: {
        planningStart: '2025-01-01',
        plannedEnd: '2025-12-31',
      },
      companyIds: ['comp-1', 'comp-3'],
      createdAt: '2024-12-01T00:00:00Z',
      createdBy: 'user-1',
      updatedAt: '2024-12-01T00:00:00Z',
    },
  ]
}

function getDefaultEmployees(): Employee[] {
  return [
    // Ana Firma Personeli
    {
      id: 'emp-1',
      employeeCode: 'AF-PER-101',
      firstName: 'Ahmet',
      lastName: 'Yıldız',
      title: 'İnşaat Ustası',
      companyId: 'comp-1',
      department: 'İnşaat',
      phone: '+90 532 100 10 01',
      status: 'active',
      assignedProjectIds: ['proj-1', 'proj-2'],
      hireDate: '2023-01-15',
      createdAt: '2023-01-15T00:00:00Z',
      updatedAt: '2023-01-15T00:00:00Z',
    },
    {
      id: 'emp-2',
      employeeCode: 'AF-PER-102',
      firstName: 'Zeynep',
      lastName: 'Aydın',
      title: 'Saha Mühendisi',
      companyId: 'comp-1',
      department: 'Mühendislik',
      phone: '+90 532 100 10 02',
      status: 'active',
      assignedProjectIds: ['proj-2'],
      hireDate: '2023-02-01',
      createdAt: '2023-02-01T00:00:00Z',
      updatedAt: '2023-02-01T00:00:00Z',
    },
    
    // Taşeron İnşaat Personeli
    {
      id: 'emp-3',
      employeeCode: 'TS-PER-201',
      firstName: 'Mehmet',
      lastName: 'Kaya',
      title: 'Elektrik Teknisyeni',
      companyId: 'comp-2',
      department: 'Elektrik',
      phone: '+90 532 200 20 01',
      status: 'active',
      assignedProjectIds: ['proj-1'],
      hireDate: '2023-03-10',
      createdAt: '2023-03-10T00:00:00Z',
      updatedAt: '2023-03-10T00:00:00Z',
    },
    {
      id: 'emp-4',
      employeeCode: 'TS-PER-202',
      firstName: 'Fatma',
      lastName: 'Şahin',
      title: 'Vinç Operatörü',
      companyId: 'comp-2',
      department: 'Operasyon',
      phone: '+90 532 200 20 02',
      status: 'active',
      assignedProjectIds: ['proj-1', 'proj-2'],
      hireDate: '2023-03-15',
      createdAt: '2023-03-15T00:00:00Z',
      updatedAt: '2023-03-15T00:00:00Z',
    },
    {
      id: 'emp-5',
      employeeCode: 'TS-PER-203',
      firstName: 'Can',
      lastName: 'Öztürk',
      title: 'İnşaat İşçisi',
      companyId: 'comp-2',
      department: 'İnşaat',
      phone: '+90 532 200 20 03',
      status: 'active',
      assignedProjectIds: [],  // Havuzda bekliyor
      hireDate: '2024-01-05',
      createdAt: '2024-01-05T00:00:00Z',
      updatedAt: '2024-01-05T00:00:00Z',
    },
    {
      id: 'emp-6',
      employeeCode: 'TS-PER-204',
      firstName: 'Elif',
      lastName: 'Yılmaz',
      title: 'Güvenlik Görevlisi',
      companyId: 'comp-2',
      department: 'Güvenlik',
      phone: '+90 532 200 20 04',
      status: 'active',
      assignedProjectIds: [],  // Havuzda bekliyor
      hireDate: '2024-01-10',
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-10T00:00:00Z',
    },
    
    // Alt Taşeron Personeli
    {
      id: 'emp-7',
      employeeCode: 'AT-PER-301',
      firstName: 'Ali',
      lastName: 'Çelik',
      title: 'Kaynak Ustası',
      companyId: 'comp-3',
      department: 'İmalat',
      phone: '+90 532 300 30 01',
      status: 'active',
      assignedProjectIds: ['proj-1'],
      hireDate: '2023-04-01',
      createdAt: '2023-04-01T00:00:00Z',
      updatedAt: '2023-04-01T00:00:00Z',
    },
    {
      id: 'emp-8',
      employeeCode: 'AT-PER-302',
      firstName: 'Hasan',
      lastName: 'Demir',
      title: 'Elektrikçi',
      companyId: 'comp-3',
      department: 'Elektrik',
      phone: '+90 532 300 30 02',
      status: 'active',
      assignedProjectIds: ['proj-4'],
      hireDate: '2023-04-15',
      createdAt: '2023-04-15T00:00:00Z',
      updatedAt: '2023-04-15T00:00:00Z',
    },
    
    // Makine Taşeron Personeli
    {
      id: 'emp-9',
      employeeCode: 'TS-PER-401',
      firstName: 'Murat',
      lastName: 'Arslan',
      title: 'Makine Operatörü',
      companyId: 'comp-4',
      department: 'Makine',
      phone: '+90 532 400 40 01',
      status: 'active',
      assignedProjectIds: ['proj-3'],
      hireDate: '2023-05-01',
      createdAt: '2023-05-01T00:00:00Z',
      updatedAt: '2023-05-01T00:00:00Z',
    },
    {
      id: 'emp-10',
      employeeCode: 'TS-PER-205',
      firstName: 'Ayşe',
      lastName: 'Koç',
      title: 'Temizlik Görevlisi',
      companyId: 'comp-2',
      department: 'Destek Hizmetleri',
      phone: '+90 532 200 20 05',
      status: 'active',
      assignedProjectIds: [],  // Havuzda
      hireDate: '2024-02-01',
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-02-01T00:00:00Z',
    },
  ]
}

function getDefaultTrainings(): Training[] {
  return [
    { id: 'train-1', name: 'İSG-A Sınıfı', category: 'İSG', validityMonths: 36 },
    { id: 'train-2', name: 'Yüksekte Çalışma', category: 'İSG', validityMonths: 24 },
    { id: 'train-3', name: 'İlk Yardım', category: 'Sağlık', validityMonths: 12 },
    { id: 'train-4', name: 'Yangın Söndürme', category: 'Acil Durum', validityMonths: 12 },
    { id: 'train-5', name: 'Forklift Ehliyeti', category: 'Operasyon', validityMonths: 24 },
    { id: 'train-6', name: 'Vinç Operatörlüğü', category: 'Operasyon', validityMonths: 36 },
    { id: 'train-7', name: 'Kaynak Eğitimi', category: 'Teknik', validityMonths: 24 },
    { id: 'train-8', name: 'Elektrik İşleri', category: 'Teknik', validityMonths: 24 },
  ]
}

function getDefaultCertificates(): Certificate[] {
  return [
    {
      id: 'cert-1',
      employeeId: 'emp-1',
      trainingId: 'train-1',
      issueDate: '2022-01-10',
      expiryDate: '2025-01-10',
      status: 'expiring',
    },
    {
      id: 'cert-2',
      employeeId: 'emp-4',
      trainingId: 'train-2',
      issueDate: '2023-01-20',
      expiryDate: '2025-01-20',
      status: 'expiring',
    },
    {
      id: 'cert-3',
      employeeId: 'emp-2',
      trainingId: 'train-3',
      issueDate: '2024-02-01',
      expiryDate: '2025-02-01',
      status: 'expiring',
    },
    {
      id: 'cert-4',
      employeeId: 'emp-5',
      trainingId: 'train-6',
      issueDate: '2023-06-15',
      expiryDate: '2026-06-15',
      status: 'valid',
    },
    {
      id: 'cert-5',
      employeeId: 'emp-3',
      trainingId: 'train-1',
      issueDate: '2023-09-01',
      expiryDate: '2026-09-01',
      status: 'valid',
    },
    {
      id: 'cert-6',
      employeeId: 'emp-8',
      trainingId: 'train-7',
      issueDate: '2024-03-10',
      expiryDate: '2026-03-10',
      status: 'valid',
    },
    {
      id: 'cert-7',
      employeeId: 'emp-4',
      trainingId: 'train-8',
      issueDate: '2024-05-20',
      expiryDate: '2026-05-20',
      status: 'valid',
    },
  ]
}

function getDefaultSystemUsers(): SystemUser[] {
  return [
    {
      id: 'user-1',
      userCode: 'AF-001',
      email: 'merkez@anafirma.com',
      username: 'ayilmaz',
      phone: '+90 532 111 11 11',
      status: 'active',
      password: 'demo123',
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      title: 'Genel Müdür',
      department: 'Yönetim',
      jobPosition: 'Merkez Yöneticisi',
      companyId: 'comp-1',
      companyType: 'main',
      role: 'center_manager',
      language: 'tr',
      timezone: 'Europe/Istanbul',
      emailVerified: true,
      mfaEnabled: false,
      lastLoginAt: '2025-01-02T10:30:00Z',
      failedLoginCount: 0,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2025-01-02T10:30:00Z',
    },
    {
      id: 'user-2',
      userCode: 'AF-002',
      email: 'proje@anafirma.com',
      username: 'ademir',
      phone: '+90 532 222 22 22',
      status: 'active',
      password: 'demo123',
      firstName: 'Ayşe',
      lastName: 'Demir',
      title: 'Proje Müdürü',
      department: 'Proje Yönetimi',
      jobPosition: 'Proje Yöneticisi',
      companyId: 'comp-1',
      companyType: 'main',
      defaultProjectId: 'proj-1',
      projectIds: ['proj-1', 'proj-2'],
      role: 'project_manager',
      language: 'tr',
      timezone: 'Europe/Istanbul',
      emailVerified: true,
      mfaEnabled: false,
      lastLoginAt: '2025-01-02T09:15:00Z',
      failedLoginCount: 0,
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2025-01-02T09:15:00Z',
    },
    {
      id: 'user-3',
      userCode: 'AF-003',
      email: 'isg@anafirma.com',
      username: 'fsahin',
      phone: '+90 532 333 33 33',
      status: 'active',
      password: 'demo123',
      firstName: 'Fatma',
      lastName: 'Şahin',
      title: 'İSG Uzmanı',
      department: 'İSG',
      jobPosition: 'A Sınıfı İSG Uzmanı',
      companyId: 'comp-1',
      companyType: 'main',
      projectIds: ['proj-1', 'proj-2'],
      role: 'isg_specialist',
      language: 'tr',
      timezone: 'Europe/Istanbul',
      emailVerified: true,
      mfaEnabled: false,
      lastLoginAt: '2025-01-02T08:00:00Z',
      failedLoginCount: 0,
      createdAt: '2024-01-20T00:00:00Z',
      updatedAt: '2025-01-02T08:00:00Z',
    },
    {
      id: 'user-4',
      userCode: 'TS-001',
      email: 'manager@taseron.com',
      username: 'mkaya',
      phone: '+90 532 444 44 44',
      status: 'active',
      password: 'demo123',
      firstName: 'Mehmet',
      lastName: 'Kaya',
      title: 'Şirket Yöneticisi',
      department: 'Yönetim',
      jobPosition: 'Taşeron Yöneticisi',
      companyId: 'comp-2',
      companyType: 'contractor',
      role: 'contractor_manager',
      language: 'tr',
      timezone: 'Europe/Istanbul',
      emailVerified: true,
      mfaEnabled: false,
      lastLoginAt: '2025-01-02T07:45:00Z',
      failedLoginCount: 0,
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2025-01-02T07:45:00Z',
    },
    {
      id: 'user-5',
      userCode: 'TS-002',
      email: 'isg@taseron.com',
      username: 'cozturk',
      phone: '+90 532 555 55 55',
      status: 'active',
      password: 'demo123',
      firstName: 'Can',
      lastName: 'Öztürk',
      title: 'İSG Uzmanı',
      department: 'İSG',
      jobPosition: 'B Sınıfı İSG Uzmanı',
      companyId: 'comp-2',
      companyType: 'contractor',
      role: 'isg_specialist',
      language: 'tr',
      timezone: 'Europe/Istanbul',
      emailVerified: true,
      mfaEnabled: false,
      lastLoginAt: '2025-01-01T16:20:00Z',
      failedLoginCount: 0,
      createdAt: '2024-02-05T00:00:00Z',
      updatedAt: '2025-01-01T16:20:00Z',
    },
    {
      id: 'user-6',
      userCode: 'AT-001',
      email: 'manager@elektrik.com',
      username: 'acelik',
      phone: '+90 532 666 66 66',
      status: 'active',
      password: 'demo123',
      firstName: 'Ali',
      lastName: 'Çelik',
      title: 'Şirket Yöneticisi',
      department: 'Yönetim',
      jobPosition: 'Taşeron Yöneticisi',
      companyId: 'comp-3',
      companyType: 'subcontractor',
      role: 'contractor_manager',
      language: 'tr',
      timezone: 'Europe/Istanbul',
      emailVerified: true,
      mfaEnabled: false,
      lastLoginAt: '2024-12-30T14:00:00Z',
      failedLoginCount: 0,
      createdAt: '2024-03-01T00:00:00Z',
      updatedAt: '2024-12-30T14:00:00Z',
    },
    {
      id: 'user-7',
      userCode: 'AF-004',
      email: 'hekim@anafirma.com',
      username: 'zyilmaz',
      phone: '+90 532 777 77 77',
      status: 'active',
      password: 'demo123',
      firstName: 'Zeynep',
      lastName: 'Yılmaz',
      title: 'İşyeri Hekimi',
      department: 'Sağlık',
      jobPosition: 'Uzman Doktor',
      companyId: 'comp-1',
      companyType: 'main',
      role: 'doctor',
      language: 'tr',
      timezone: 'Europe/Istanbul',
      emailVerified: true,
      mfaEnabled: true,
      lastLoginAt: '2025-01-02T08:30:00Z',
      failedLoginCount: 0,
      createdAt: '2024-01-25T00:00:00Z',
      updatedAt: '2025-01-02T08:30:00Z',
    },
    {
      id: 'user-8',
      userCode: 'TS-003',
      email: 'eski@taseron.com',
      username: 'earslan',
      phone: '+90 532 888 88 88',
      status: 'passive',
      firstName: 'Elif',
      lastName: 'Arslan',
      title: 'Proje Koordinatörü',
      department: 'Proje Yönetimi',
      jobPosition: 'Koordinatör',
      companyId: 'comp-2',
      companyType: 'contractor',
      role: 'employee',
      language: 'tr',
      timezone: 'Europe/Istanbul',
      emailVerified: true,
      mfaEnabled: false,
      lastLoginAt: '2024-11-15T10:00:00Z',
      failedLoginCount: 0,
      createdAt: '2024-02-10T00:00:00Z',
      updatedAt: '2024-12-01T00:00:00Z',
      updatedBy: 'user-4',
    },
    {
      id: 'user-9',
      userCode: 'TS-004',
      email: 'yeni@makine.com',
      phone: '+90 532 999 99 99',
      status: 'pending_activation',
      firstName: 'Hasan',
      lastName: 'Demir',
      title: 'Saha Mühendisi',
      department: 'Saha',
      jobPosition: 'Makine Mühendisi',
      companyId: 'comp-4',
      companyType: 'contractor',
      role: 'employee',
      language: 'tr',
      timezone: 'Europe/Istanbul',
      emailVerified: false,
      mfaEnabled: false,
      failedLoginCount: 0,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      createdBy: 'user-1',
    },
  ]
}

function getDefaultDocumentRequirements(): DocumentRequirement[] {
  return [
    {
      id: 'req-1',
      projectId: 'proj-1',
      name: 'Kimlik Fotokopisi',
      description: 'Nüfus cüzdanı veya kimlik kartı fotokopisi',
      isMandatory: true,
      hasExpiryDate: false,
      createdBy: 'user-2',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
    },
    {
      id: 'req-2',
      projectId: 'proj-1',
      name: 'SGK Giriş Bildirimi',
      description: 'İşe giriş bildirgesinin onaylı fotokopisi',
      isMandatory: true,
      hasExpiryDate: false,
      createdBy: 'user-2',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
    },
    {
      id: 'req-3',
      projectId: 'proj-1',
      name: 'İşe Giriş Muayene Raporu',
      description: 'İşyeri hekimi tarafından düzenlenmiş muayene raporu',
      isMandatory: true,
      hasExpiryDate: true,
      validityMonths: 12,
      createdBy: 'user-3',
      createdAt: '2024-01-20T00:00:00Z',
      updatedAt: '2024-01-20T00:00:00Z',
    },
    {
      id: 'req-4',
      projectId: 'proj-1',
      name: 'İSG Temel Eğitim Sertifikası',
      description: 'İş Sağlığı ve Güvenliği temel eğitim belgesi',
      isMandatory: true,
      hasExpiryDate: true,
      validityMonths: 36,
      createdBy: 'user-3',
      createdAt: '2024-01-20T00:00:00Z',
      updatedAt: '2024-01-20T00:00:00Z',
    },
    {
      id: 'req-5',
      projectId: 'proj-1',
      name: 'Meslek Belgeleri',
      description: 'İş için gerekli yetkinlik belgeleri (varsa)',
      isMandatory: false,
      hasExpiryDate: true,
      validityMonths: 24,
      createdBy: 'user-2',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
    },
    {
      id: 'req-6',
      projectId: 'proj-2',
      name: 'Kimlik Fotokopisi',
      description: 'Nüfus cüzdanı veya kimlik kartı fotokopisi',
      isMandatory: true,
      hasExpiryDate: false,
      createdBy: 'user-2',
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-02-01T00:00:00Z',
    },
    {
      id: 'req-7',
      projectId: 'proj-2',
      name: 'SGK Giriş Bildirimi',
      isMandatory: true,
      hasExpiryDate: false,
      createdBy: 'user-2',
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-02-01T00:00:00Z',
    },
    {
      id: 'req-8',
      projectId: 'proj-2',
      name: 'İşe Giriş Muayene Raporu',
      isMandatory: true,
      hasExpiryDate: true,
      validityMonths: 12,
      createdBy: 'user-3',
      createdAt: '2024-02-05T00:00:00Z',
      updatedAt: '2024-02-05T00:00:00Z',
    },
  ]
}

function getDefaultEmployeeDocuments(): EmployeeDocument[] {
  return [
    {
      id: 'doc-1',
      employeeId: 'emp-4',
      projectId: 'proj-1',
      requirementId: 'req-1',
      fileName: 'mehmet_kaya_kimlik.pdf',
      fileUrl: '/mock/files/mehmet_kaya_kimlik.pdf',
      uploadedBy: 'user-4',
      uploadedAt: '2024-03-01T10:00:00Z',
      status: 'approved',
      reviewedBy: 'user-2',
      reviewedAt: '2024-03-02T09:00:00Z',
    },
    {
      id: 'doc-2',
      employeeId: 'emp-4',
      projectId: 'proj-1',
      requirementId: 'req-2',
      fileName: 'mehmet_kaya_sgk.pdf',
      fileUrl: '/mock/files/mehmet_kaya_sgk.pdf',
      uploadedBy: 'user-4',
      uploadedAt: '2024-03-01T10:05:00Z',
      status: 'approved',
      reviewedBy: 'user-2',
      reviewedAt: '2024-03-02T09:05:00Z',
    },
    {
      id: 'doc-3',
      employeeId: 'emp-4',
      projectId: 'proj-1',
      requirementId: 'req-3',
      fileName: 'mehmet_kaya_muayene.pdf',
      fileUrl: '/mock/files/mehmet_kaya_muayene.pdf',
      uploadedBy: 'user-4',
      uploadedAt: '2024-03-01T10:10:00Z',
      expiryDate: '2025-03-01',
      status: 'approved',
      reviewedBy: 'user-3',
      reviewedAt: '2024-03-02T10:00:00Z',
    },
    {
      id: 'doc-4',
      employeeId: 'emp-4',
      projectId: 'proj-1',
      requirementId: 'req-4',
      fileName: 'mehmet_kaya_isg.pdf',
      fileUrl: '/mock/files/mehmet_kaya_isg.pdf',
      uploadedBy: 'user-4',
      uploadedAt: '2024-03-01T10:15:00Z',
      expiryDate: '2027-03-01',
      status: 'approved',
      reviewedBy: 'user-3',
      reviewedAt: '2024-03-02T10:15:00Z',
    },
    {
      id: 'doc-5',
      employeeId: 'emp-5',
      projectId: 'proj-1',
      requirementId: 'req-1',
      fileName: 'fatma_sahin_kimlik.pdf',
      fileUrl: '/mock/files/fatma_sahin_kimlik.pdf',
      uploadedBy: 'user-4',
      uploadedAt: '2024-03-05T09:00:00Z',
      status: 'approved',
      reviewedBy: 'user-2',
      reviewedAt: '2024-03-06T08:00:00Z',
    },
    {
      id: 'doc-6',
      employeeId: 'emp-5',
      projectId: 'proj-1',
      requirementId: 'req-2',
      fileName: 'fatma_sahin_sgk.pdf',
      fileUrl: '/mock/files/fatma_sahin_sgk.pdf',
      uploadedBy: 'user-4',
      uploadedAt: '2024-03-05T09:05:00Z',
      status: 'pending',
    },
    {
      id: 'doc-7',
      employeeId: 'emp-5',
      projectId: 'proj-1',
      requirementId: 'req-3',
      fileName: 'fatma_sahin_muayene.pdf',
      fileUrl: '/mock/files/fatma_sahin_muayene.pdf',
      uploadedBy: 'user-4',
      uploadedAt: '2024-03-05T09:10:00Z',
      status: 'rejected',
      reviewedBy: 'user-3',
      reviewedAt: '2024-03-06T09:00:00Z',
      rejectionReason: 'Muayene raporu eksik bilgiler içeriyor. Lütfen güncellenmiş rapor yükleyin.',
    },
  ]
}

// Mock data exports - Reset on every page reload
export const customers: Customer[] = getDefaultCustomers()
export const companies: Company[] = getDefaultCompanies()
export const projects: Project[] = getDefaultProjects()
export const employees: Employee[] = getDefaultEmployees()
export const trainings: Training[] = getDefaultTrainings()
export const certificates: Certificate[] = getDefaultCertificates()
export const systemUsers: SystemUser[] = getDefaultSystemUsers()
export const documentRequirements: DocumentRequirement[] = getDefaultDocumentRequirements()
export const employeeDocuments: EmployeeDocument[] = getDefaultEmployeeDocuments()

// Getter functions for consistency
export function getCustomers() { return customers }
export function getCompanies() { return companies }
export function getProjects() { return projects }
export function getEmployees() { return employees }
export function getTrainings() { return trainings }
export function getCertificates() { return certificates }
export function getSystemUsers() { return systemUsers }
export function getDocumentRequirements() { return documentRequirements }
export function getEmployeeDocuments_All() { return employeeDocuments }

// Helper functions
export function getCompanyById(id: string) {
  return companies.find((c) => c.id === id)
}

export function getProjectById(id: string) {
  return projects.find((p) => p.id === id)
}

export function getEmployeeById(id: string) {
  return employees.find((e) => e.id === id)
}

export function getTrainingById(id: string) {
  return trainings.find((t) => t.id === id)
}

export function getCustomerById(id: string) {
  return customers.find((c) => c.id === id)
}

export function getEmployeesByCompanyId(companyId: string) {
  return employees.filter((e) => e.companyId === companyId)
}

export function getProjectsByCompanyId(companyId: string) {
  return projects.filter((p) => p.companyIds.includes(companyId))
}

export function getCertificatesByEmployeeId(employeeId: string) {
  return certificates.filter((c) => c.employeeId === employeeId)
}

export function getEmployeesByProjectId(projectId: string) {
  return employees.filter((e) => e.assignedProjectIds.includes(projectId))
}

export function getCompaniesByProjectId(projectId: string) {
  const project = getProjectById(projectId)
  if (!project) return []
  return companies.filter((c) => project.companyIds.includes(c.id))
}

export function getUserById(id: string) {
  return systemUsers.find((u) => u.id === id)
}

export function getUserByEmail(email: string) {
  return systemUsers.find((u) => u.email === email)
}

export function getUsersByCompanyId(companyId: string) {
  return systemUsers.filter((u) => u.companyId === companyId)
}

export function getDocumentRequirementsByProject(projectId: string) {
  return documentRequirements.filter((r) => r.projectId === projectId)
}

export function getEmployeeDocuments(employeeId: string, projectId: string) {
  return employeeDocuments.filter(
    (d) => d.employeeId === employeeId && d.projectId === projectId
  )
}

export function getMissingDocuments(employeeId: string, projectId: string) {
  const requirements = getDocumentRequirementsByProject(projectId).filter(
    (r) => r.isMandatory
  )
  const employeeDocs = getEmployeeDocuments(employeeId, projectId)
  const uploadedRequirementIds = new Set(
    employeeDocs.map((d) => d.requirementId)
  )
  return requirements.filter((r) => !uploadedRequirementIds.has(r.id))
}

export function getEmployeesWithMissingDocuments(projectId: string) {
  const projectEmployees = getEmployeesByProjectId(projectId)
  return projectEmployees.filter((emp) => {
    const missing = getMissingDocuments(emp.id, projectId)
    return missing.length > 0
  })
}

export function getPendingDocumentsByProject(projectId: string) {
  return employeeDocuments.filter(
    (d) => d.projectId === projectId && d.status === 'pending'
  )
}

export function getRejectedDocumentsByCompany(companyId: string) {
  const companyEmployees = getEmployeesByCompanyId(companyId)
  const employeeIds = new Set(companyEmployees.map((e) => e.id))
  
  return employeeDocuments.filter(
    (d) => employeeIds.has(d.employeeId) && d.status === 'rejected'
  )
}
