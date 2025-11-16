'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Upload, Download, CheckCircle2, AlertCircle, Loader } from 'lucide-react'
import Link from 'next/link'

interface ImportResult {
  success: boolean
  message: string
  importedCount?: number
  errors?: Array<{ row: number; error: string }>
}

export default function BulkImportManager() {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const downloadTemplate = async () => {
    try {
      const response = await fetch('/api/admin/products/bulk-import', {
        method: 'GET',
      })
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `products-template-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
    } catch (error) {
      alert('Failed to download template')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        alert('Please select a CSV file')
        return
      }
      setFile(selectedFile)
      setResult(null)
    }
  }

  const handleImport = async () => {
    if (!file) {
      alert('Please select a file first')
      return
    }

    setIsLoading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch('/api/admin/products/bulk-import', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: `Successfully imported ${data.importedCount} products!`,
          importedCount: data.importedCount,
        })
        setFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        setResult({
          success: false,
          message: data.message || 'Import failed',
          errors: data.errors,
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'An error occurred during import. Please try again.',
      })
    } finally {
      setIsLoading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Bulk Import Products</h2>
        <p className="text-gray-500 mt-1">Import multiple products from a CSV file</p>
      </div>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Get Started
          </CardTitle>
          <CardDescription>Download the template and fill in your product data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700 mb-3">
              <strong>CSV Format Required:</strong> name, category, price, description, image, stock, variants, discount, meta_title, meta_description
            </p>
            <Button onClick={downloadTemplate} variant="outline" className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Download CSV Template
            </Button>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Tips:</h4>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Name, Category, and Price are required fields</li>
              <li>Price should be in numbers (e.g., 15000)</li>
              <li>Stock should be a whole number</li>
              <li>Variants should be valid JSON format if included</li>
              <li>Maximum 1000 products per import</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload CSV File
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isLoading}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-gray-400" />
                <p className="font-semibold">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500">CSV files only</p>
              </div>
            </label>
          </div>

          {file && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-sm">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
              <Badge variant="outline">Selected</Badge>
            </div>
          )}

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Uploading...</span>
                <span className="text-sm text-gray-500">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          <Button
            onClick={handleImport}
            disabled={!file || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import Products
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Alert variant={result.success ? 'default' : 'destructive'}>
          <div className="flex gap-3">
            {result.success ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <AlertDescription>
                {result.message}
                {result.importedCount && (
                  <div className="mt-2 text-sm">
                    <p>✓ {result.importedCount} products successfully imported</p>
                  </div>
                )}
                {result.errors && result.errors.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="font-semibold text-sm">Errors:</p>
                    <div className="max-h-48 overflow-y-auto bg-white/20 rounded p-2">
                      {result.errors.slice(0, 5).map((err, idx) => (
                        <p key={idx} className="text-xs">
                          Row {err.row}: {err.error}
                        </p>
                      ))}
                      {result.errors.length > 5 && (
                        <p className="text-xs mt-1">
                          +{result.errors.length - 5} more errors...
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}
    </div>
  )
}
