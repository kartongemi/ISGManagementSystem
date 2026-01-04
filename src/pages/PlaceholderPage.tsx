import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Construction } from 'lucide-react'

interface PlaceholderPageProps {
  title: string
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="p-6 h-full flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardContent className="p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto">
            <Construction className="w-8 h-8 text-warning" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            <p className="text-muted-foreground">
              Bu modül V2.0 güncellemesinde eklenecektir.
            </p>
          </div>
          <Badge variant="secondary" className="mt-4">
            Yakında Gelecek
          </Badge>
        </CardContent>
      </Card>
    </div>
  )
}
