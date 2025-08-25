import "./globals.css";
import { AuthProvider } from '@/components/auth/auth-provider'

export const metadata = {
  title: "It's a Yes - Professional Wedding Planning Platform",
  description: "Wedding planning app for couples and planners",
  metadataBase: new URL(process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com' 
    : 'http://localhost:3000'
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
