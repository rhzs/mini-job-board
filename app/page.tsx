import React from 'react'
import Header from '@/components/header'
import HeroSection from '@/components/hero-section'
import Footer from '@/components/footer'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        <HeroSection />
      </div>
      <Footer />
    </main>
  )
} 