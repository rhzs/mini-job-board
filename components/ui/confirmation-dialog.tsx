"use client"

import React from 'react'
import { Modal } from './modal'
import { Button } from './button'
import { AlertTriangle } from 'lucide-react'

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive' | 'warning'
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default'
}: ConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'destructive':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white'
        }
      case 'warning':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-yellow-600" />,
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white'
        }
      default:
        return {
          icon: <AlertTriangle className="h-6 w-6 text-blue-600" />,
          confirmButton: 'bg-indeed-blue hover:bg-indeed-blue-dark text-white'
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {styles.icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-foreground mb-2">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            {message}
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              {cancelText}
            </Button>
            <Button className={styles.confirmButton} onClick={handleConfirm}>
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
} 