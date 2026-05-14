import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Notes App',
  description: 'Aplicación de notas con Next.js y PGLite'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  )
}
