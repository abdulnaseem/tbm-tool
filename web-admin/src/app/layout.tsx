import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '../context/AuthContext';
import { ProgrammeProvider } from '../context/ProgrammeContext';


export const metadata: Metadata = {
  title: 'Admin - The Butterfly Movement',
  description: 'Admin portal for The Butterfly Movement',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <AuthProvider>
          <ProgrammeProvider>
            {children}
          </ProgrammeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
