import React from 'react'
import Header from '@/components/header'
import HeroSection from '@/components/hero-section'
import Footer from '@/components/footer'
import { SignInModal } from '@/components/auth/signin-modal'
import { SignUpModal } from '@/components/auth/signup-modal'
import { SupabaseStatus } from '@/components/auth/supabase-status'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        <HeroSection />
      </div>
      <Footer />
      
      {/* Auth Modals */}
      <SignInModal />
      <SignUpModal />
      
      {/* Dev Helper */}
      <SupabaseStatus />
    </main>
  )
} 