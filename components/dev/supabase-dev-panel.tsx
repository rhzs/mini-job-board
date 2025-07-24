"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { supabaseLogger } from '@/lib/supabase-logger'
import { Database, Eye, EyeOff, Trash2, Play, Users, Table, Activity } from 'lucide-react'

interface QueryLog {
  id: string
  timestamp: Date
  query: string
  table: string
  operation: string
  status: 'success' | 'error'
  duration?: number
  error?: string
}

export function SupabaseDevPanel() {
  const [isVisible, setIsVisible] = useState(false)
  const [sqlQuery, setSqlQuery] = useState('')
  const [queryLogs, setQueryLogs] = useState<QueryLog[]>([])
  const [queryResult, setQueryResult] = useState<any>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking')

  // Check connection status and subscribe to logger
  useEffect(() => {
    checkConnection()
    
    // Subscribe to real-time database operations
    const unsubscribe = supabaseLogger.subscribe((operations) => {
      // Convert operations to our QueryLog format
      const convertedLogs: QueryLog[] = operations.map(op => ({
        id: op.id,
        timestamp: op.timestamp,
        query: op.query || `${op.operation} ${op.table}`,
        table: op.table,
        operation: op.operation,
        status: op.status,
        duration: op.duration,
        error: op.error
      }))
      setQueryLogs(convertedLogs)
    })
    
    // Get initial operations
    const initialOps = supabaseLogger.getOperations()
    const convertedLogs: QueryLog[] = initialOps.map(op => ({
      id: op.id,
      timestamp: op.timestamp,
      query: op.query || `${op.operation} ${op.table}`,
      table: op.table,
      operation: op.operation,
      status: op.status,
      duration: op.duration,
      error: op.error
    }))
    setQueryLogs(convertedLogs)
    
    return unsubscribe
  }, [])

  const checkConnection = async () => {
    try {
      // Check if Supabase URL and key are configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey || 
          supabaseUrl === 'https://placeholder.supabase.co' || 
          supabaseKey === 'placeholder-anon-key') {
        setConnectionStatus('disconnected')
        return
      }
      
      // Try to get the current session (most reliable and safe check)
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      // If we can get session data (even if no user is logged in), connection is working
      if (!sessionError) {
        setConnectionStatus('connected')
      } else {
        console.warn('Connection check failed:', sessionError)
        setConnectionStatus('disconnected')
      }
    } catch (error) {
      console.error('Connection check failed:', error)
      setConnectionStatus('disconnected')
    }
  }



  const executeQuery = async () => {
    if (!sqlQuery.trim()) return
    
    setIsExecuting(true)
    const startTime = Date.now()
    
    try {
      // Parse simple SELECT queries and execute them directly
      const query = sqlQuery.trim().toLowerCase()
      
      if (query.startsWith('select')) {
        // Try to extract table name for simple queries
        const tableMatch = query.match(/from\s+(\w+)/)
        const tableName = tableMatch ? tableMatch[1] : 'unknown'
        
        // For simple queries, try to execute directly
        if (query.includes('from saved_jobs')) {
          const { data, error } = await supabase.from('saved_jobs').select('*').limit(10)
          const duration = Date.now() - startTime
          
          if (error) {
            supabaseLogger.logOperation({
              query: sqlQuery,
              table: 'saved_jobs',
              operation: 'SELECT',
              status: 'error',
              duration,
              error: error.message
            })
            setQueryResult({ error: error.message })
          } else {
            supabaseLogger.logOperation({
              query: sqlQuery,
              table: 'saved_jobs',
              operation: 'SELECT',
              status: 'success',
              duration
            })
            setQueryResult({ data, count: data?.length || 0 })
          }
        } else if (query.includes('from job_postings')) {
          const { data, error } = await supabase.from('job_postings').select('*').limit(10)
          const duration = Date.now() - startTime
          
          if (error) {
            supabaseLogger.logOperation({
              query: sqlQuery,
              table: 'job_postings',
              operation: 'SELECT',
              status: 'error',
              duration,
              error: error.message
            })
            setQueryResult({ error: error.message })
          } else {
            supabaseLogger.logOperation({
              query: sqlQuery,
              table: 'job_postings',
              operation: 'SELECT',
              status: 'success',
              duration
            })
            setQueryResult({ data, count: data?.length || 0 })
          }
        } else if (query.includes('from job_applications')) {
          const { data, error } = await supabase.from('job_applications').select('*').limit(10)
          const duration = Date.now() - startTime
          
          if (error) {
            supabaseLogger.logOperation({
              query: sqlQuery,
              table: 'job_applications',
              operation: 'SELECT',
              status: 'error',
              duration,
              error: error.message
            })
            setQueryResult({ error: error.message })
          } else {
            supabaseLogger.logOperation({
              query: sqlQuery,
              table: 'job_applications',
              operation: 'SELECT',
              status: 'success',
              duration
            })
            setQueryResult({ data, count: data?.length || 0 })
          }
        } else if (query.includes('from user_preferences')) {
          const { data, error } = await supabase.from('user_preferences').select('*').limit(10)
          const duration = Date.now() - startTime
          
          if (error) {
            supabaseLogger.logOperation({
              query: sqlQuery,
              table: 'user_preferences',
              operation: 'SELECT',
              status: 'error',
              duration,
              error: error.message
            })
            setQueryResult({ error: error.message })
          } else {
            supabaseLogger.logOperation({
              query: sqlQuery,
              table: 'user_preferences',
              operation: 'SELECT',
              status: 'success',
              duration
            })
            setQueryResult({ data, count: data?.length || 0 })
          }
        } else {
          // Fallback error
          setQueryResult({ 
            error: 'For security reasons, only simple SELECT queries on known tables are supported. Try: "select * from saved_jobs limit 5" or use the Table Stats button.',
            suggestion: 'Supported tables: saved_jobs, job_postings, job_applications, user_preferences'
          })
        }
      } else {
        setQueryResult({ 
          error: 'Only SELECT queries are supported for security reasons.',
          suggestion: 'Try: "select * from saved_jobs limit 5"'
        })
      }
    } catch (error) {
      const duration = Date.now() - startTime
      supabaseLogger.logOperation({
        query: sqlQuery,
        table: 'custom',
        operation: 'SELECT',
        status: 'error',
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      setQueryResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setIsExecuting(false)
    }
  }

  const clearLogs = () => {
    supabaseLogger.clear()
    setQueryResult(null)
  }

  const getTableStats = async () => {
    try {
      const tables = ['users', 'job_postings', 'job_applications', 'saved_jobs', 'user_preferences']
      const stats = await Promise.all(
        tables.map(async (table) => {
          try {
            const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true })
            if (error) {
              return { table, count: 0, error: error.message }
            }
            return { table, count: count || 0 }
          } catch (err) {
            return { table, count: 0, error: err instanceof Error ? err.message : 'Unknown error' }
          }
        })
      )
      setQueryResult({ tableStats: stats })
    } catch (error) {
      setQueryResult({ error: 'Failed to fetch table stats: ' + (error instanceof Error ? error.message : 'Unknown error') })
    }
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
          size="sm"
        >
          <Database className="h-4 w-4 mr-2" />
          DB Panel
        </Button>
      </div>
    )
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-end"
      onClick={() => setIsVisible(false)}
    >
      <div 
        className="w-full h-2/3 bg-background border-t border-border rounded-t-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <Database className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold">Supabase Development Panel</h3>
              <Badge variant={connectionStatus === 'connected' ? 'default' : 'destructive'}>
                {connectionStatus === 'connected' ? '🟢 Connected' : connectionStatus === 'disconnected' ? '🔴 Disconnected' : '🟡 Checking...'}
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  console.log('Supabase Config Check:')
                  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
                  console.log('Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set')
                  console.log('Supabase client:', supabase)
                  checkConnection()
                }}
              >
                Debug
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={getTableStats}>
                <Table className="h-4 w-4 mr-2" />
                Table Stats
              </Button>
              <Button variant="outline" size="sm" onClick={clearLogs}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
                <EyeOff className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Left Panel - Query Executor */}
            <div className="w-1/2 p-4 border-r border-border">
              <div className="h-full flex flex-col">
                                  <div className="mb-4">
                    <h4 className="font-medium mb-2">SQL Query Executor</h4>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={sqlQuery}
                        onChange={(e) => setSqlQuery(e.target.value)}
                        placeholder="select * from saved_jobs limit 5"
                        className="flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && executeQuery()}
                      />
                      <Button 
                        onClick={executeQuery} 
                        disabled={isExecuting || !sqlQuery.trim()}
                        size="sm"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {isExecuting ? 'Running...' : 'Execute'}
                      </Button>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSqlQuery('select * from saved_jobs limit 5')}
                        className="text-xs"
                      >
                        Saved Jobs
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSqlQuery('select * from job_postings limit 5')}
                        className="text-xs"
                      >
                        Job Postings
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSqlQuery('select * from job_applications limit 5')}
                        className="text-xs"
                      >
                        Applications
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSqlQuery('select * from user_preferences limit 5')}
                        className="text-xs"
                      >
                        User Prefs
                      </Button>
                    </div>
                  </div>

                {/* Query Result */}
                <div className="flex-1 bg-muted/30 rounded-lg p-3 overflow-auto">
                  <h5 className="font-medium mb-2">Result:</h5>
                  {queryResult ? (
                    <pre className="text-sm whitespace-pre-wrap">
                      {JSON.stringify(queryResult, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-muted-foreground text-sm">No query executed yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel - Query Logs */}
            <div className="w-1/2 p-4">
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Recent Operations ({queryLogs.length})</h4>
                  <Badge variant="outline">
                    <Activity className="h-3 w-3 mr-1" />
                    Live
                  </Badge>
                </div>

                <div className="flex-1 overflow-auto space-y-2">
                  {queryLogs.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No operations logged yet</p>
                  ) : (
                    queryLogs.map((log) => (
                      <Card key={log.id} className="text-xs">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              <Badge variant={log.status === 'success' ? 'default' : 'destructive'} className="text-xs">
                                {log.operation}
                              </Badge>
                              <span className="text-muted-foreground">{log.table}</span>
                              {log.duration && (
                                <span className="text-muted-foreground">
                                  {log.duration}ms
                                </span>
                              )}
                            </div>
                            <span className="text-muted-foreground">
                              {log.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <code className="text-xs bg-muted/50 p-1 rounded block truncate">
                            {log.query}
                          </code>
                          {log.error && (
                            <p className="text-destructive text-xs mt-1">{log.error}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 