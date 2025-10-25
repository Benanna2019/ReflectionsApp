import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Camera, Upload, X, Loader2 } from 'lucide-react'
import { useIsMobile } from '@/lib/hooks/useIsMobile'

interface PhotoUploadProps {
  onPhotoSelected: (data: {
    blob: Blob
    file: File
  }) => void
  onPhotoRemoved: () => void
}

/**
 * PhotoUpload Component
 * 
 * Handles photo selection from camera or file system
 * Compresses photos before upload
 */
export function PhotoUpload({ onPhotoSelected, onPhotoRemoved }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const { isMobile } = useIsMobile()

  /**
   * Compress image before encryption
   * Reduces file size while maintaining quality
   */
  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          // Create canvas for compression
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'))
            return
          }

          // Calculate dimensions (max 1920px width/height)
          const maxSize = 1920
          let width = img.width
          let height = img.height

          if (width > height && width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          } else if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }

          canvas.width = width
          canvas.height = height

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height)
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error('Failed to compress image'))
              }
            },
            'image/jpeg',
            0.85 // 85% quality
          )
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  /**
   * Process selected photo
   * Compress and prepare for upload
   */
  const handlePhotoSelect = async (file: File) => {
    try {
      setIsProcessing(true)
      setError(null)

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file')
      }

      // Validate file size (max 10MB before compression)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Image must be less than 10MB')
      }

      // Create preview
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)

      // Compress image
      const compressedBlob = await compressImage(file)
      console.log(`Compressed: ${file.size} -> ${compressedBlob.size} bytes`)

      // Convert to File for upload
      const compressedFile = new File([compressedBlob], file.name, {
        type: 'image/jpeg',
      })
      
      // Notify parent component
      onPhotoSelected({
        blob: compressedBlob,
        file: compressedFile,
      })

      console.log('Photo processed successfully')
    } catch (err) {
      console.error('Error processing photo:', err)
      setError(err instanceof Error ? err.message : 'Failed to process photo')
      setPreview(null)
    } finally {
      setIsProcessing(false)
    }
  }

  /**
   * Handle file input change
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handlePhotoSelect(file)
    }
  }

  /**
   * Handle camera input change
   */
  const handleCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handlePhotoSelect(file)
    }
  }

  /**
   * Remove selected photo
   */
  const handleRemovePhoto = () => {
    setPreview(null)
    setError(null)
    onPhotoRemoved()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = ''
    }
  }

  /**
   * Trigger file input click
   */
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  /**
   * Trigger camera input click
   */
  const handleCameraClick = () => {
    cameraInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      {/* Hidden camera input (mobile only) */}
      {isMobile && (
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          onChange={handleCameraChange}
          className="hidden"
          capture="environment" // Use rear camera on mobile
        />
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Photo preview or upload buttons */}
      {preview ? (
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <img
                src={preview}
                alt="Selected photo"
                className="w-full h-64 object-cover rounded-lg"
              />
              {isProcessing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleRemovePhoto}
                disabled={isProcessing}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {isMobile && (
            <Button
              variant="outline"
              className="h-32 flex flex-col gap-2"
              onClick={handleCameraClick}
              disabled={isProcessing}
            >
              <Camera className="h-8 w-8" />
              <span>Take Photo</span>
            </Button>
          )}
          <Button
            variant="outline"
            className="h-32 flex flex-col gap-2"
            onClick={handleUploadClick}
            disabled={isProcessing}
          >
            <Upload className="h-8 w-8" />
            <span>{isMobile ? 'Choose Photo' : 'Upload Photo'}</span>
          </Button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Processing status */}
      {isProcessing && (
        <div className="text-center text-sm text-muted-foreground">
          Processing photo...
        </div>
      )}
    </div>
  )
}

