import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { BlobServiceClient } from '@azure/storage-blob'
import { v4 as uuidv4 } from 'uuid'

// Azure Blob Storage configuration
const azureConfig = {
  connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
  accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
  accountKey: process.env.AZURE_STORAGE_ACCOUNT_KEY,
  containerName: process.env.AZURE_STORAGE_CONTAINER_NAME || 'blog-images'
}

// Initialize Azure Blob Service Client
let blobServiceClient = null

const initializeAzure = () => {
  try {
    if (azureConfig.connectionString) {
      blobServiceClient = BlobServiceClient.fromConnectionString(azureConfig.connectionString)
      return true
    } else if (azureConfig.accountName && azureConfig.accountKey) {
      const connectionString = `DefaultEndpointsProtocol=https;AccountName=${azureConfig.accountName};AccountKey=${azureConfig.accountKey};EndpointSuffix=core.windows.net`
      blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
      return true
    }
    return false
  } catch (error) {
    console.error('Failed to initialize Azure Blob Service:', error)
    return false
  }
}

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Initialize Azure if not already done
    if (!blobServiceClient) {
      const initialized = initializeAzure()
      if (!initialized) {
        return NextResponse.json(
          { message: 'Azure storage not configured' },
          { status: 500 }
        )
      }
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('image')
    
    if (!file) {
      return NextResponse.json(
        { message: 'No image file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: 'Invalid file type. Only JPG, PNG, GIF, and WebP images are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { message: 'File size too large. Maximum 10MB allowed.' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const timestamp = new Date().getTime()
    const uniqueFileName = `blog-image-${timestamp}-${uuidv4().substring(0, 8)}.${fileExtension}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Get container client
    const containerClient = blobServiceClient.getContainerClient(azureConfig.containerName)
    
    // Create container if it doesn't exist
    await containerClient.createIfNotExists({
      access: 'blob' // Allow public read access to blobs
    })

    // Get blob client
    const blobClient = containerClient.getBlockBlobClient(uniqueFileName)
    
    // Upload the file
    const uploadResponse = await blobClient.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: file.type
      }
    })

    console.log('Image uploaded successfully to Azure:', uploadResponse.requestId)

    // Return the blob URL
    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully',
      url: blobClient.url,
      fileName: uniqueFileName
    }, { status: 200 })

  } catch (error) {
    console.error('Error uploading image to Azure:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to upload image' },
      { status: 500 }
    )
  }
}

// Test endpoint to check Azure connection
export async function GET() {
  try {
    const initialized = initializeAzure()
    
    if (!initialized) {
      return NextResponse.json({
        success: false,
        message: 'Azure storage not configured'
      })
    }

    // Try to get container properties as a connection test
    const containerClient = blobServiceClient.getContainerClient(azureConfig.containerName)
    await containerClient.getProperties()

    return NextResponse.json({
      success: true,
      message: 'Azure connection successful',
      containerName: azureConfig.containerName
    })

  } catch (error) {
    console.error('Azure connection test failed:', error)
    return NextResponse.json({
      success: false,
      message: error.message
    })
  }
}