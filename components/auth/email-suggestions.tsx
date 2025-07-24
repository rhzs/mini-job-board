"use client"

import React from 'react'

interface EmailSuggestionsProps {
  onSuggestionClick: (email: string) => void
}

export function EmailSuggestions({ onSuggestionClick }: EmailSuggestionsProps) {
  const suggestions = [
    'john.doe@gmail.com',
    'jane.smith@outlook.com',
    'user@yahoo.com',
    'test@hotmail.com'
  ]

  return (
    <div className="mt-2">
      <p className="text-xs text-muted-foreground mb-2">Try these sample emails:</p>
      <div className="flex flex-wrap gap-1">
        {suggestions.map((email) => (
          <button
            key={email}
            type="button"
            onClick={() => onSuggestionClick(email)}
            className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded text-muted-foreground hover:text-foreground transition-colors"
          >
            {email}
          </button>
        ))}
      </div>
    </div>
  )
} 