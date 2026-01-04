import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Badge } from '@/components/ui/badge'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()

  const demoUsers = [
    {
      email: 'merkez@anafirma.com',
      role: 'Merkez Yöneticisi',
      description: 'Tüm projeler, şirketler ve personeller',
      variant: 'default' as const,
    },
    {
      email: 'proje@anafirma.com',
      role: 'Proje Yöneticisi',
      description: 'Sadece atandığı projeler',
      variant: 'secondary' as const,
    },
    {
      email: 'manager@taseron.com',
      role: 'Taşeron Yöneticisi',
      description: 'Kendi şirketi ve personel atama',
      variant: 'outline' as const,
    },
    {
      email: 'isg@anafirma.com',
      role: 'İSG Uzmanı',
      description: 'Güvenlik ve uyumluluk',
      variant: 'secondary' as const,
    },
  ]

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
    } catch (err) {
      setError('Geçersiz kullanıcı bilgileri. Lütfen demo kullanıcılardan birini seçin.')
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword('demo')
    setTimeout(() => {
      login(demoEmail, 'demo').catch(() => {
        setError('Giriş başarısız oldu')
      })
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8">
        {/* Login Form */}
        <Card className="shadow-xl">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl">İSG Yönetim Sistemi</CardTitle>
                <CardDescription>Personel Yetkinlik ve Eğitim Takibi</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@sirket.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                  <p className="text-sm text-danger">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground text-center mb-3">
                Demo için herhangi bir şifre ile giriş yapabilirsiniz
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Users */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Demo Kullanıcılar</h2>
            <p className="text-muted-foreground text-sm">
              Farklı yetki seviyelerini test etmek için demo hesaplara hızlı giriş yapın
            </p>
          </div>

          <div className="space-y-3">
            {demoUsers.map((user) => (
              <Card
                key={user.email}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => quickLogin(user.email)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={user.variant}>{user.role}</Badge>
                      </div>
                      <p className="font-medium text-sm mb-1">{user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.description}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Giriş
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-2">Rol Özellikleri:</h3>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li className="flex gap-2">
                  <span className="shrink-0">•</span>
                  <span><strong>Merkez Yöneticisi:</strong> Tüm projeler, şirketler ve personelleri görüntüler</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0">•</span>
                  <span><strong>Proje Yöneticisi:</strong> Sadece atandığı projeleri ve o projelerdeki taşeronları görür</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0">•</span>
                  <span><strong>Taşeron Yöneticisi:</strong> Kendi şirketinin çalıştığı projeleri görür ve personel havuzundan atama yapabilir</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0">•</span>
                  <span><strong>İSG Uzmanı:</strong> Güvenlik ve uyumluluk kontrolü yapar</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
