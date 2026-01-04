import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Bot, Send, Sparkles, FileText, Users, Calendar, AlertCircle } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Merhaba! İSG Yönetim Sistemi yapay zeka asistanınızım. Size personel yetkinlikleri, eğitim planlaması, belge takibi ve daha birçok konuda yardımcı olabilirim. Nasıl yardımcı olabilirim?',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const quickActions = [
    { 
      icon: Users, 
      label: 'Süresi Dolan Belgeleri Listele',
      prompt: 'Önümüzdeki 30 gün içinde süresi dolacak sertifikaları listele'
    },
    { 
      icon: Calendar, 
      label: 'Eğitim Planı Öner',
      prompt: 'Bu ay için bir eğitim planı önerisi hazırla'
    },
    { 
      icon: FileText, 
      label: 'Uyumsuzluk Raporu',
      prompt: 'Yetkinlik açığı olan personelleri ve eksik belgelerini göster'
    },
    { 
      icon: AlertCircle, 
      label: 'Kritik Durum Analizi',
      prompt: 'Kritik pozisyonlardaki yetkinlik eksikliklerini analiz et'
    },
  ]

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Mock AI response
    setTimeout(() => {
      const responses: Record<string, string> = {
        'süresi dolan': 'Önümüzdeki 30 gün içinde süresi dolacak 18 sertifika bulunmaktadır:\n\n1. Ahmet Yıldız - İSG-A Sınıfı (7 gün)\n2. Mehmet Kaya - Yüksekte Çalışma (12 gün)\n3. Ayşe Demir - İlk Yardım (15 gün)\n\nDetaylı listeyi "Eğitim & Yetkinlik > Sertifikalar" bölümünden inceleyebilirsiniz.',
        'eğitim planı': 'Ocak 2025 için önerilen eğitim planı:\n\n• 15 Ocak: Yangın Söndürme Eğitimi (45 kişi)\n• 18 Ocak: Kapalı Alan Çalışma İzni (22 kişi)\n• 22 Ocak: Acil Durum Tatbikatı (120 kişi)\n• 25 Ocak: İlk Yardım Yenileme (38 kişi)\n\nToplam 225 personel eğitim alacak.',
        'uyumsuzluk': 'Yetkinlik açığı tespit edilen personel:\n\n• Ali Çelik (Kaynak Ustası): %33 tamamlanma\n  Eksik: Yangın, İlk Yardım\n\n• Mehmet Demir (İnşaat İşçisi): %50 tamamlanma\n  Eksik: Yüksekte Çalışma\n\nToplam 12 personelde eksik belge tespit edildi.',
        'kritik': 'Kritik Durum Analizi:\n\n🔴 YÜKSEK RİSK:\n• 3 vinç operatörünün sertifikası 15 gün içinde dolacak\n• 2 elektrik mühendisinin izin belgesi güncel değil\n\n🟡 ORTA RİSK:\n• 8 personelin ilk yardım eğitimi 60 gün içinde sona erecek\n\nÖncelikli aksiyon önerileri hazırlandı.',
      }

      const responseContent = Object.keys(responses).find((key) => 
        userMessage.content.toLowerCase().includes(key)
      )

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent 
          ? responses[responseContent]
          : 'Anlayamadığım bir konu var. Şu konularda yardımcı olabilirim:\n\n• Süresi dolan belge listesi\n• Eğitim planı önerileri\n• Uyumsuzluk raporları\n• Kritik durum analizleri\n• Personel yetkinlik sorguları',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1000)
  }

  const handleQuickAction = (prompt: string) => {
    setInput(prompt)
    setTimeout(() => handleSend(), 100)
  }

  return (
    <div className="p-6 h-[calc(100vh-4rem)]">
      <div className="h-full grid lg:grid-cols-[1fr_320px] gap-6">
        <Card className="flex flex-col">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-6 h-6 text-primary" />
                  Yapay Zeka Asistanı
                </CardTitle>
                <CardDescription>Personel yetkinlik ve eğitim danışmanınız</CardDescription>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20">
                <Sparkles className="w-3 h-3 mr-1" />
                Online
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString('tr-TR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  placeholder="Mesajınızı yazın..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1"
                />
                <Button onClick={handleSend} disabled={!input.trim() || isTyping}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hızlı İşlemler</CardTitle>
              <CardDescription className="text-xs">Sık kullanılan sorgular</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((action, i) => {
                const Icon = action.icon
                return (
                  <Button
                    key={i}
                    variant="outline"
                    className="w-full justify-start h-auto py-3 px-3"
                    onClick={() => handleQuickAction(action.prompt)}
                  >
                    <Icon className="w-4 h-4 mr-3 shrink-0" />
                    <span className="text-sm text-left">{action.label}</span>
                  </Button>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Yetenekler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex gap-2">
                <div className="w-1.5 bg-primary rounded-full shrink-0" />
                <p className="text-muted-foreground">Personel yetkinlik sorgulama</p>
              </div>
              <div className="flex gap-2">
                <div className="w-1.5 bg-primary rounded-full shrink-0" />
                <p className="text-muted-foreground">Sertifika geçerlilik kontrolü</p>
              </div>
              <div className="flex gap-2">
                <div className="w-1.5 bg-primary rounded-full shrink-0" />
                <p className="text-muted-foreground">Eğitim planı önerileri</p>
              </div>
              <div className="flex gap-2">
                <div className="w-1.5 bg-primary rounded-full shrink-0" />
                <p className="text-muted-foreground">Uyumsuzluk tespit ve raporlama</p>
              </div>
              <div className="flex gap-2">
                <div className="w-1.5 bg-primary rounded-full shrink-0" />
                <p className="text-muted-foreground">Mevzuat danışmanlığı</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
