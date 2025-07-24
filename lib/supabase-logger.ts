import { supabase } from './supabase'

interface DatabaseOperation {
  id: string
  timestamp: Date
  table: string
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'RPC'
  query?: string
  duration: number
  status: 'success' | 'error'
  error?: string
  rowCount?: number
}

class SupabaseLogger {
  private operations: DatabaseOperation[] = []
  private listeners: ((operations: DatabaseOperation[]) => void)[] = []

  // Subscribe to operation logs
  subscribe(listener: (operations: DatabaseOperation[]) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  // Log a database operation
  logOperation(operation: Omit<DatabaseOperation, 'id' | 'timestamp'>) {
    const newOperation: DatabaseOperation = {
      ...operation,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    }
    
    this.operations = [newOperation, ...this.operations.slice(0, 99)] // Keep last 100
    this.notifyListeners()
  }

  // Get all operations
  getOperations() {
    return this.operations
  }

  // Clear operations
  clear() {
    this.operations = []
    this.notifyListeners()
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.operations))
  }
}

export const supabaseLogger = new SupabaseLogger()

// Helper function to manually log database operations
export const logDatabaseOperation = async <T>(
  operation: () => Promise<T>,
  operationType: DatabaseOperation['operation'],
  table: string,
  query?: string
): Promise<T> => {
  const startTime = Date.now()
  
  try {
    const result = await operation()
    const duration = Date.now() - startTime
    
    // Try to extract row count from result
    let rowCount = 0
    if (result && typeof result === 'object' && 'data' in result) {
      const data = (result as any).data
      rowCount = Array.isArray(data) ? data.length : (data ? 1 : 0)
    }
    
    supabaseLogger.logOperation({
      table,
      operation: operationType,
      query: query || `${operationType} ${table}`,
      duration,
      status: result && typeof result === 'object' && 'error' in result && (result as any).error ? 'error' : 'success',
      error: result && typeof result === 'object' && 'error' in result ? (result as any).error?.message : undefined,
      rowCount
    })
    
    return result
  } catch (error) {
    const duration = Date.now() - startTime
    supabaseLogger.logOperation({
      table,
      operation: operationType,
      query: query || `${operationType} ${table}`,
      duration,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    throw error
  }
}

// Convenience functions for common operations
export const loggedSupabaseOperations = {
  select: (table: string, query?: string) => 
    (operation: () => Promise<any>) => 
      logDatabaseOperation(operation, 'SELECT', table, query),
      
  insert: (table: string, query?: string) => 
    (operation: () => Promise<any>) => 
      logDatabaseOperation(operation, 'INSERT', table, query),
      
  update: (table: string, query?: string) => 
    (operation: () => Promise<any>) => 
      logDatabaseOperation(operation, 'UPDATE', table, query),
      
  delete: (table: string, query?: string) => 
    (operation: () => Promise<any>) => 
      logDatabaseOperation(operation, 'DELETE', table, query),
}

// Development helper to quickly log all operations
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).supabaseLogger = supabaseLogger
} 