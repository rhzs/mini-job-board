"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import HeaderWrapper from '@/components/header-wrapper'
import Footer from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Building2, Mail, Globe, MapPin, Users } from 'lucide-react'
import { useTenant } from '@/lib/tenant-context'
import { useAuth } from '@/lib/auth-context'
import { CompanyFormData } from '@/lib/database.types'

export default function CreateCompanyPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { createCompany } = useTenant()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    description: '',
    email_domain: '',
    auto_approve_domain: false,
    location: '',
    industry: '',
    size: '',
    website: ''
  })

  const handleInputChange = (field: keyof CompanyFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    try {
      const company = await createCompany(formData)
      if (company) {
        // Redirect to home (which will now show employer dashboard)
        router.push('/')
      }
    } catch (error) {
      console.error('Error creating company:', error)
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    router.push('/')
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderWrapper />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="p-3 bg-indeed-blue/10 rounded-lg">
                <Building2 className="h-8 w-8 text-indeed-blue" />
              </div>
            </div>
            <h1 className="text-3xl font-bold">Create Your Company</h1>
            <p className="text-muted-foreground">
              Set up your organization to start posting jobs and managing your team
            </p>
          </div>

          {/* Form */}
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Fill in the details about your company. This information will be visible to job seekers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Company Name *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your company name"
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                {/* Email Domain */}
                <div className="space-y-2">
                  <label htmlFor="email_domain" className="text-sm font-medium">
                    Email Domain *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email_domain"
                      value={formData.email_domain}
                      onChange={(e) => handleInputChange('email_domain', e.target.value)}
                      placeholder="company.com"
                      className="pl-9"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Users with this email domain can automatically join your company
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Tell us about your company..."
                    className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    rows={4}
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label htmlFor="location" className="text-sm font-medium">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Singapore"
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Industry */}
                <div className="space-y-2">
                  <label htmlFor="industry" className="text-sm font-medium">
                    Industry
                  </label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    placeholder="Technology, Finance, Healthcare, etc."
                  />
                </div>

                {/* Company Size */}
                <div className="space-y-2">
                  <label htmlFor="size" className="text-sm font-medium">
                    Company Size
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <select
                      id="size"
                      value={formData.size}
                      onChange={(e) => handleInputChange('size', e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Select company size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501-1000">501-1000 employees</option>
                      <option value="1001-5000">1001-5000 employees</option>
                      <option value="5001+">5001+ employees</option>
                    </select>
                  </div>
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <label htmlFor="website" className="text-sm font-medium">
                    Website
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://company.com"
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Auto-approve checkbox */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="auto_approve"
                    checked={formData.auto_approve_domain}
                    onChange={(e) => handleInputChange('auto_approve_domain', e.target.checked)}
                    className="rounded border-gray-300 text-indeed-blue focus:ring-indeed-blue"
                  />
                  <label htmlFor="auto_approve" className="text-sm">
                    Automatically approve users with matching email domain
                  </label>
                </div>

                {/* Submit button */}
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !formData.name || !formData.email_domain}
                    className="bg-indeed-blue hover:bg-indeed-blue-dark"
                  >
                    {isLoading ? 'Creating...' : 'Create Company'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
} 