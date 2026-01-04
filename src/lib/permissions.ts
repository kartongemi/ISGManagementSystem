import { User } from '@/stores/authStore'
import { projects, companies, employees, systemUsers } from './mockData'

/**
 * ⚠️ Önemli: Kullanıcılar ve Personeller Ayrımı
 * 
 * - **SystemUser (Kullanıcılar)**: Web sayfasına giriş yapabilen kişiler (userCode)
 * - **Employee (Personeller)**: Sahada çalışan kişiler (employeeCode) - Web erişimi yok
 * 
 * Her kullanıcı bir personel değildir, her personel bir kullanıcı değildir.
 * Örnek: Saha işçisi (Employee) web'e girmez, sadece evrakları yüklenir.
 * Örnek: Proje yöneticisi (SystemUser) web'e girer ama sahada çalışmaz.
 */

/**
 * Kullanıcının erişebildiği projeleri döndürür
 */
export function getUserProjects(user: User) {
  if (user.role === 'center_manager') {
    // Merkez yöneticisi tüm projeleri görür
    return projects
  }
  
  if (user.role === 'project_manager') {
    // Proje yöneticisi sadece atandığı projeleri görür
    return projects.filter((p) => user.projectIds?.includes(p.id))
  }
  
  if (user.role === 'contractor_manager') {
    // Taşeron yöneticisi şirketinin çalıştığı projeleri görür
    return projects.filter((p) => p.companyIds.includes(user.companyId))
  }
  
  // Diğer roller (İSG uzmanı, hekim, çalışan)
  return projects.filter((p) => user.projectIds?.includes(p.id) || p.companyIds.includes(user.companyId))
}

/**
 * Kullanıcının erişebildiği şirketleri döndürür
 */
export function getUserCompanies(user: User) {
  if (user.role === 'center_manager') {
    // Merkez yöneticisi tüm şirketleri görür
    return companies
  }
  
  if (user.role === 'project_manager') {
    // Proje yöneticisi atandığı projelerdeki şirketleri görür
    const userProjects = getUserProjects(user)
    const companyIds = new Set<string>()
    userProjects.forEach((p) => p.companyIds.forEach((id) => companyIds.add(id)))
    return companies.filter((c) => companyIds.has(c.id))
  }
  
  if (user.role === 'contractor_manager') {
    // Taşeron yöneticisi sadece kendi şirketini görür
    return companies.filter((c) => c.id === user.companyId)
  }
  
  // Diğer roller kendi şirketini görür
  return companies.filter((c) => c.id === user.companyId)
}

/**
 * Kullanıcının erişebildiği personelleri döndürür
 */
export function getUserEmployees(user: User) {
  if (user.role === 'center_manager') {
    // Merkez yöneticisi tüm personeli görür
    return employees
  }
  
  if (user.role === 'project_manager') {
    // Proje yöneticisi atandığı projelerdeki personeli görür
    const userProjects = getUserProjects(user)
    const projectIds = new Set(userProjects.map((p) => p.id))
    return employees.filter((e) => 
      e.assignedProjectIds.some((pid) => projectIds.has(pid))
    )
  }
  
  if (user.role === 'contractor_manager') {
    // Taşeron yöneticisi kendi şirketinin tüm personelini görür (projeye atanmamış olanlar dahil)
    return employees.filter((e) => e.companyId === user.companyId)
  }
  
  // Diğer roller kendi şirketinin personelini görür
  return employees.filter((e) => e.companyId === user.companyId)
}

/**
 * Kullanıcının belirli bir personeli atama yetkisi var mı?
 */
export function canAssignEmployee(user: User, employeeId: string) {
  // Sadece taşeron yöneticisi kendi personelini atayabilir
  if (user.role !== 'contractor_manager') return false
  
  const employee = employees.find((e) => e.id === employeeId)
  return employee?.companyId === user.companyId
}

/**
 * Kullanıcının proje oluşturma yetkisi var mı?
 */
export function canCreateProject(user: User) {
  return user.role === 'center_manager'
}

/**
 * Kullanıcının şirket oluşturma yetkisi var mı?
 */
export function canCreateCompany(user: User) {
  return user.role === 'center_manager'
}

/**
 * Kullanıcının erişebildiği sistem kullanıcılarını döndürür
 */
export function getAccessibleUsers(user: User) {
  if (user.role === 'center_manager') {
    // Merkez yöneticisi tüm kullanıcıları görür
    return systemUsers
  }
  
  if (user.role === 'project_manager') {
    // Proje yöneticisi kendi şirketindeki kullanıcıları görür
    return systemUsers.filter((u) => u.companyId === user.companyId)
  }
  
  if (user.role === 'contractor_manager') {
    // Taşeron yöneticisi sadece kendi şirketindeki kullanıcıları görür
    return systemUsers.filter((u) => u.companyId === user.companyId)
  }
  
  // Diğer roller sadece kendi kullanıcı bilgilerini görür
  return systemUsers.filter((u) => u.id === user.id)
}

/**
 * Kullanıcı oluşturma yetkisi var mı?
 */
export function canCreateUser(user: User) {
  return user.role === 'center_manager' || 
         user.role === 'project_manager' || 
         user.role === 'contractor_manager'
}

/**
 * Kullanıcıyı aktif/pasif yapma yetkisi var mı?
 */
export function canManageUserStatus(user: User, targetUserId: string) {
  const targetUser = systemUsers.find((u) => u.id === targetUserId)
  if (!targetUser) return false
  
  // Merkez yöneticisi herkesi yönetebilir
  if (user.role === 'center_manager') return true
  
  // Proje yöneticisi ve taşeron yöneticisi kendi şirketindeki kullanıcıları yönetebilir
  if ((user.role === 'project_manager' || user.role === 'contractor_manager') && 
      targetUser.companyId === user.companyId) {
    return true
  }
  
  return false
}

/**
 * Kullanıcının şirket yönetimi yetkisi var mı?
 */
export function canManageCompanies(user: User) {
  return user.role === 'center_manager'
}

/**
 * Kullanıcının evrak gereksinimi tanımlama yetkisi var mı?
 */
export function canManageDocumentRequirements(user: User) {
  return user.role === 'center_manager' || 
         user.role === 'project_manager' || 
         user.role === 'isg_specialist'
}

/**
 * Kullanıcının personel evraklarını görüntüleme yetkisi var mı?
 */
export function canViewEmployeeDocuments(user: User) {
  return user.role === 'center_manager' || 
         user.role === 'project_manager' || 
         user.role === 'isg_specialist' ||
         user.role === 'contractor_manager'
}

/**
 * Kullanıcının şifre belirleme yetkisi var mı?
 */
export function canSetPassword(user: User, targetUserId: string) {
  const targetUser = systemUsers.find((u) => u.id === targetUserId)
  if (!targetUser) return false
  
  // Ana yönetici tüm kullanıcılar için şifre belirleyebilir
  if (user.role === 'center_manager') return true
  
  // Taşeron yöneticileri sadece kendi şirket çalışanları için şifre belirleyebilir
  if (user.role === 'contractor_manager' && targetUser.companyId === user.companyId) {
    return true
  }
  
  return false
}

/**
 * Kullanıcının müşteri yönetimi yetkisi var mı?
 */
export function canManageCustomers(user: User) {
  return user.role === 'center_manager'
}

/**
 * Kullanıcının proje yönetimi yetkisi var mı?
 */
export function canManageProjects(user: User) {
  return user.role === 'center_manager'
}

/**
 * Kullanıcının evrakları onaylama yetkisi var mı?
 */
export function canApproveDocuments(user: User) {
  return user.role === 'center_manager' || 
         user.role === 'project_manager' || 
         user.role === 'isg_specialist'
}
