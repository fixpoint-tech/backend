import minioClient from '../config/minio.js';
import crypto from 'crypto';
import path from 'path';

/**
 * Upload Service for MinIO file uploads
 */

const BUCKET_NAME = 'profile-pictures';
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'localhost:9000';

/**
 * Ensure bucket exists, create if not
 */
const ensureBucketExists = async () => {
  try {
    const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
    
    if (!bucketExists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log(`✅ Bucket "${BUCKET_NAME}" created successfully`);
      
      // Set bucket policy to allow public read access
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`]
          }
        ]
      };
      
      await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
    throw new Error('Failed to initialize storage bucket');
  }
};

/**
 * Upload file to MinIO
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {string} originalName - Original filename
 * @param {string} mimeType - File MIME type
 * @returns {Promise<string>} - MinIO file URL
 */
export const uploadProfilePicture = async (fileBuffer, originalName, mimeType) => {
  try {
    // Ensure bucket exists
    await ensureBucketExists();
    
    // Generate unique filename
    const fileExtension = path.extname(originalName);
    const uniqueFileName = `${crypto.randomUUID()}${fileExtension}`;
    
    // Upload to MinIO
    await minioClient.putObject(
      BUCKET_NAME,
      uniqueFileName,
      fileBuffer,
      fileBuffer.length,
      {
        'Content-Type': mimeType,
        'x-amz-meta-original-name': originalName
      }
    );
    
    // Generate public URL
    const fileUrl = `http://${MINIO_ENDPOINT}/${BUCKET_NAME}/${uniqueFileName}`;
    
    console.log(`✅ File uploaded successfully: ${fileUrl}`);
    return fileUrl;
    
  } catch (error) {
    console.error('MinIO upload error:', error);
    throw new Error('Failed to upload file to storage');
  }
};

/**
 * Delete file from MinIO
 * @param {string} fileUrl - MinIO file URL
 */
export const deleteProfilePicture = async (fileUrl) => {
  try {
    if (!fileUrl) return;
    
    // Extract filename from URL
    const urlParts = fileUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    
    await minioClient.removeObject(BUCKET_NAME, fileName);
    console.log(`✅ File deleted successfully: ${fileName}`);
    
  } catch (error) {
    console.error('MinIO delete error:', error);
    // Don't throw error - deletion is best effort
  }
};

export default {
  uploadProfilePicture,
  deleteProfilePicture
};
