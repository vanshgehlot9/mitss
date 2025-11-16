'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { MoreVertical, Copy, Archive, RotateCcw, Edit, Eye, Trash2, Loader, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface ProductActionsProps {
  productId: string
  productName?: string
  archived?: boolean
  onDuplicate?: (newProductId: string) => void
  onArchive?: () => void
  onRestore?: () => void
  onDelete?: () => void
}

interface ActionResult {
  success: boolean
  message: string
  newProductId?: string
}

export default function ProductActions({
  productId,
  productName = 'Product',
  archived = false,
  onDuplicate,
  onArchive,
  onRestore,
  onDelete,
}: ProductActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmAction, setConfirmAction] = useState<string | null>(null)
  const [result, setResult] = useState<ActionResult | null>(null)

  const handleDuplicate = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/products/${productId}/duplicate`, {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: `Product duplicated successfully!`,
          newProductId: data.productId,
        })
        onDuplicate?.(data.productId)
        setTimeout(() => setResult(null), 3000)
      } else {
        setResult({
          success: false,
          message: data.message || 'Failed to duplicate product',
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'An error occurred while duplicating the product',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleArchive = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archive: true }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: 'Product archived successfully',
        })
        setShowConfirm(false)
        onArchive?.()
        setTimeout(() => setResult(null), 3000)
      } else {
        setResult({
          success: false,
          message: data.message || 'Failed to archive product',
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'An error occurred while archiving the product',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestore = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archive: false }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: 'Product restored successfully',
        })
        setShowConfirm(false)
        onRestore?.()
        setTimeout(() => setResult(null), 3000)
      } else {
        setResult({
          success: false,
          message: data.message || 'Failed to restore product',
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'An error occurred while restoring the product',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: 'Product deleted successfully',
        })
        setShowConfirm(false)
        onDelete?.()
        setTimeout(() => setResult(null), 3000)
      } else {
        setResult({
          success: false,
          message: data.message || 'Failed to delete product',
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'An error occurred while deleting the product',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const performAction = async () => {
    switch (confirmAction) {
      case 'duplicate':
        await handleDuplicate()
        break
      case 'archive':
        await handleArchive()
        break
      case 'restore':
        await handleRestore()
        break
      case 'delete':
        await handleDelete()
        break
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {/* View */}
          <Link href={`/products/${productId}`}>
            <DropdownMenuItem>
              <Eye className="h-4 w-4 mr-2" />
              View Product
            </DropdownMenuItem>
          </Link>

          {/* Edit */}
          <Link href={`/admin/products/${productId}/edit`}>
            <DropdownMenuItem>
              <Edit className="h-4 w-4 mr-2" />
              Edit Product
            </DropdownMenuItem>
          </Link>

          <DropdownMenuSeparator />

          {/* Duplicate */}
          <DropdownMenuItem
            onClick={() => {
              setConfirmAction('duplicate')
              setShowConfirm(true)
            }}
            disabled={isLoading}
          >
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </DropdownMenuItem>

          {/* Archive / Restore */}
          {!archived ? (
            <DropdownMenuItem
              onClick={() => {
                setConfirmAction('archive')
                setShowConfirm(true)
              }}
              disabled={isLoading}
            >
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => {
                setConfirmAction('restore')
                setShowConfirm(true)
              }}
              disabled={isLoading}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restore
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Delete */}
          <DropdownMenuItem
            onClick={() => {
              setConfirmAction('delete')
              setShowConfirm(true)
            }}
            disabled={isLoading}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction === 'duplicate' && 'Duplicate Product'}
              {confirmAction === 'archive' && 'Archive Product'}
              {confirmAction === 'restore' && 'Restore Product'}
              {confirmAction === 'delete' && 'Delete Product'}
            </DialogTitle>
            <DialogDescription>{productName}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {confirmAction === 'duplicate' && (
              <p className="text-sm text-gray-600">
                This will create a copy of this product with the name "{productName} (Copy)".
              </p>
            )}
            {confirmAction === 'archive' && (
              <p className="text-sm text-gray-600">
                This product will be hidden from the store. You can restore it later.
              </p>
            )}
            {confirmAction === 'restore' && (
              <p className="text-sm text-gray-600">
                This product will be visible in the store again.
              </p>
            )}
            {confirmAction === 'delete' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This action cannot be undone. The product will be permanently deleted.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowConfirm(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={performAction}
                disabled={isLoading}
                variant={confirmAction === 'delete' ? 'destructive' : 'default'}
              >
                {isLoading ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : confirmAction === 'duplicate' ? (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </>
                ) : confirmAction === 'archive' ? (
                  <>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </>
                ) : confirmAction === 'restore' ? (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restore
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Result Alert */}
      {result && (
        <Alert variant={result.success ? 'default' : 'destructive'} className="fixed bottom-4 right-4 w-96">
          <div className="flex gap-3">
            {result.success ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            )}
            <AlertDescription>{result.message}</AlertDescription>
          </div>
        </Alert>
      )}
    </>
  )
}
