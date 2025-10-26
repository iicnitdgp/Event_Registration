import QRCode from 'qrcode';
import { BlobServiceClient } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';

// Azure Blob Storage configuration
const azureConfig = {
  connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
  accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
  accountKey: process.env.AZURE_STORAGE_ACCOUNT_KEY,
  containerName: process.env.AZURE_STORAGE_CONTAINER_NAME || 'qr-codes'
};

// Initialize Azure Blob Service Client
let blobServiceClient = null;

const initializeAzure = () => {
  try {
    if (azureConfig.connectionString) {
      blobServiceClient = BlobServiceClient.fromConnectionString(azureConfig.connectionString);
      return true;
    } else if (azureConfig.accountName && azureConfig.accountKey) {
      const connectionString = `DefaultEndpointsProtocol=https;AccountName=${azureConfig.accountName};AccountKey=${azureConfig.accountKey};EndpointSuffix=core.windows.net`;
      blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to initialize Azure Blob Service:', error);
    return false;
  }
};

/**
 * Generate QR code and upload to Azure Blob Storage
 * @param {string} ticketUrl - The URL to encode in QR code
 * @param {string} registrationId - The registration ID for unique filename
 * @returns {Promise<string>} - The Azure blob URL of the uploaded QR code
 */
export const generateAndUploadQRCode = async (ticketUrl, registrationId) => {
  try {
    // Generate QR code as buffer
    const qrCodeBuffer = await QRCode.toBuffer(ticketUrl, {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 400,
      margin: 2
    });

    // Initialize Azure if not already done
    if (!blobServiceClient) {
      const initialized = initializeAzure();
      if (!initialized) {
        throw new Error('Azure storage not configured');
      }
    }

    // Generate unique filename
    const uniqueFileName = `qr-${registrationId}-${uuidv4().substring(0, 8)}.png`;

    // Get container client
    const containerClient = blobServiceClient.getContainerClient(azureConfig.containerName);
    
    // Create container if it doesn't exist
    await containerClient.createIfNotExists({
      access: 'blob' // Allow public read access to blobs
    });

    // Get blob client
    const blobClient = containerClient.getBlockBlobClient(uniqueFileName);
    
    // Upload the QR code
    await blobClient.uploadData(qrCodeBuffer, {
      blobHTTPHeaders: {
        blobContentType: 'image/png'
      }
    });

    console.log('QR code uploaded successfully to Azure:', blobClient.url);
    return blobClient.url;

  } catch (error) {
    console.error('Error generating/uploading QR code:', error);
    throw error;
  }
};
