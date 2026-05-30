import { performOCR, OCRExtractedData } from './ocr.service';

/**
 * UploadService - Handles file upload and OCR processing
 */

export interface UploadResult {
    ocrData: OCRExtractedData;
    fileName: string;
    uploadedAt: Date;
}

/**
 * Handle file upload and perform OCR
 * @param file - The file to upload and process
 * @returns Promise<UploadResult> - Result containing OCR data and file info
 */
export async function handleFileUpload(file: File): Promise<UploadResult> {
    try {
        // Validate file size (max 10MB)
        const maxFileSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxFileSize) {
            throw new Error('File size exceeds 10MB limit.');
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        const fileName = file.name.toLowerCase();

        const isValidType = validTypes.includes(file.type) ||
            fileName.endsWith('.jpg') ||
            fileName.endsWith('.jpeg') ||
            fileName.endsWith('.png') ||
            fileName.endsWith('.pdf');

        if (!isValidType) {
            throw new Error('Invalid file type. Please upload JPG, PNG, or PDF.');
        }

        // Perform OCR
        const ocrData = await performOCR(file);

        return {
            ocrData,
            fileName: file.name,
            uploadedAt: new Date(),
        };
    } catch (error) {
        console.error('Upload service error:', error);
        throw error;
    }
}
