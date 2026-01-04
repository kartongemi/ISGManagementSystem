import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  FileText, 
  Plus, 
  Shield,
  Trash2,
  Edit,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { canManageDocumentRequirements } from '@/lib/permissions'
import { getUserProjects } from '@/lib/permissions'
import { 
  documentRequirements as allDocumentRequirements,
  getDocumentRequirementsByProject,
  getEmployeesWithMissingDocuments
} from '@/lib/mockData'
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
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'

export function DocumentRequirements() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newRequirement, setNewRequirement] = useState({
    name: '',
    description: '',
    isMandatory: true,
    hasExpiryDate: false,
    validityMonths: 12,
  })
  
  const { user } = useAuthStore()
  const { toast } = useToast()

  if (!user) return null

  // Yetki kontrolü
  if (!canManageDocumentRequirements(user)) {
    return (
      <div className="p-6">
        <Card className="border-danger">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-danger">
              <Shield className="w-8 h-8" />
              <div>
                <h2 className="text-xl font-bold">Erişim Engellendi</h2>
                <p className="text-muted-foreground mt-1">
                  Evrak gereksinimi tanımlama sayfasına sadece merkez yöneticileri, proje yöneticileri ve İSG uzmanları erişebilir.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const projects = getUserProjects(user)
  const selectedProject = projects.find((p) => p.id === selectedProjectId)
  const requirements = selectedProjectId 
    ? getDocumentRequirementsByProject(selectedProjectId)
    : []
  
  const employeesWithMissing = selectedProjectId
    ? getEmployeesWithMissingDocuments(selectedProjectId)
    : []

  const handleAddRequirement = () => {
    if (!selectedProjectId || !newRequirement.name) {
      toast({
        title: 'Hata',
        description: 'Lütfen proje seçin ve evrak adını girin.',
        variant: 'destructive',
      })
      return
    }

    // Mock ekleme
    const requirement = {
      id: `req-${allDocumentRequirements.length + 1}`,
      projectId: selectedProjectId,
      name: newRequirement.name,
      description: newRequirement.description,
      isMandatory: newRequirement.isMandatory,
      hasExpiryDate: newRequirement.hasExpiryDate,
      validityMonths: newRequirement.hasExpiryDate ? newRequirement.validityMonths : undefined,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    allDocumentRequirements.push(requirement)

    toast({
      title: 'Başarılı',
      description: `"${newRequirement.name}" gereksinimi eklendi.`,
    })

    setIsAddDialogOpen(false)
    setNewRequirement({ name: '', description: '', isMandatory: true, hasExpiryDate: false, validityMonths: 12 })
  }

  const handleDeleteRequirement = (reqId: string) => {
    const index = allDocumentRequirements.findIndex((r) => r.id === reqId)
    if (index > -1) {
      const req = allDocumentRequirements[index]
      allDocumentRequirements.splice(index, 1)
      toast({
        title: 'Silindi',
        description: `"${req.name}" gereksinimi kaldırıldı.`,
      })
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Evrak Gereksinimleri</h1>
          <p className="text-muted-foreground mt-1">
            Proje bazlı evrak gereksinimlerini yönetin
          </p>
        </div>
      </div>

      {/* Proje Seçimi */}
      <Card>
        <CardHeader>
          <CardTitle>Proje Seçin</CardTitle>
          <CardDescription>
            Evrak gereksinimlerini görüntülemek ve yönetmek için bir proje seçin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger>
              <SelectValue placeholder="Proje seçin..." />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedProject && (
        <>
          {/* İstatistikler */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Toplam Gereksinim</p>
                    <p className="text-3xl font-bold mt-2">{requirements.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Zorunlu Evraklar</p>
                    <p className="text-3xl font-bold mt-2">
                      {requirements.filter((r) => r.isMandatory).length}
                    </p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Evrak Eksik Personel</p>
                    <p className="text-3xl font-bold mt-2 text-warning">
                      {employeesWithMissing.length}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-warning" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Evrak Eksikliği Uyarısı */}
          {employeesWithMissing.length > 0 && (
            <Card className="border-warning bg-warning/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  <CardTitle className="text-warning">Evrak Eksikliği Tespit Edildi</CardTitle>
                </div>
                <CardDescription>
                  {employeesWithMissing.length} personelin zorunlu evrakları eksik
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {employeesWithMissing.slice(0, 5).map((emp) => (
                    <div
                      key={emp.id}
                      className="flex items-center justify-between p-2 rounded bg-background"
                    >
                      <span className="font-medium">{emp.firstName} {emp.lastName} ({emp.employeeCode})</span>
                      <Badge variant="outline" className="text-warning">
                        Eksik Evrak
                      </Badge>
                    </div>
                  ))}
                  {employeesWithMissing.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center pt-2">
                      +{employeesWithMissing.length - 5} personel daha
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Evrak Listesi */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Evrak Gereksinimleri ({requirements.length})</CardTitle>
                  <CardDescription>
                    {selectedProject.name} projesi için gerekli evraklar
                  </CardDescription>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Yeni Gereksinim
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Yeni Evrak Gereksinimi Ekle</DialogTitle>
                      <DialogDescription>
                        Personel projeye atanırken yüklenmesi gereken evrakı tanımlayın
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Evrak Adı *</Label>
                        <Input
                          placeholder="Örn: SGK Giriş Bildirimi"
                          value={newRequirement.name}
                          onChange={(e) =>
                            setNewRequirement({ ...newRequirement, name: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Açıklama</Label>
                        <Textarea
                          placeholder="Evrak hakkında açıklama (opsiyonel)"
                          value={newRequirement.description}
                          onChange={(e) =>
                            setNewRequirement({ ...newRequirement, description: e.target.value })
                          }
                          rows={3}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Zorunlu Mu?</Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Zorunlu evraklar yüklenmeden personel projeye atanamaz
                          </p>
                        </div>
                        <Switch
                          checked={newRequirement.isMandatory}
                          onCheckedChange={(checked) =>
                            setNewRequirement({ ...newRequirement, isMandatory: checked })
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Geçerlilik Tarihi Takibi</Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Evrak için geçerlilik süresi belirlensin mi? (Örn: Eğitim sertifikaları)
                          </p>
                        </div>
                        <Switch
                          checked={newRequirement.hasExpiryDate}
                          onCheckedChange={(checked) =>
                            setNewRequirement({ ...newRequirement, hasExpiryDate: checked })
                          }
                        />
                      </div>
                      
                      {newRequirement.hasExpiryDate && (
                        <div className="space-y-2">
                          <Label>Geçerlilik Süresi (Ay) *</Label>
                          <Input
                            type="number"
                            min="1"
                            max="120"
                            placeholder="Örn: 12, 24, 36"
                            value={newRequirement.validityMonths}
                            onChange={(e) =>
                              setNewRequirement({ ...newRequirement, validityMonths: parseInt(e.target.value) || 12 })
                            }
                          />
                          <p className="text-xs text-muted-foreground">
                            Evrak yüklendikten sonra bu süre boyunca geçerli olacaktır
                          </p>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        İptal
                      </Button>
                      <Button onClick={handleAddRequirement}>Ekle</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {requirements.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Henüz evrak gereksinimi tanımlanmamış
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Yeni gereksinim eklemek için yukarıdaki butonu kullanın
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {requirements.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{req.name}</h4>
                            {req.isMandatory ? (
                              <Badge className="bg-danger text-xs">Zorunlu</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                Opsiyonel
                              </Badge>
                            )}
                            {req.hasExpiryDate && (
                              <Badge variant="outline" className="text-xs">
                                Geçerlilik: {req.validityMonths} ay
                              </Badge>
                            )}
                          </div>
                          {req.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {req.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            Oluşturuldu:{' '}
                            {new Date(req.createdAt).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRequirement(req.id)}
                        >
                          <Trash2 className="w-4 h-4 text-danger" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!selectedProject && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Proje Seçin</h3>
            <p className="text-muted-foreground">
              Evrak gereksinimlerini görüntülemek için yukarıdan bir proje seçin
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
