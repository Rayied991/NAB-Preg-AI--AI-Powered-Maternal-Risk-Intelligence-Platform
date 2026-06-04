/**
 * OCRService - Handles image and PDF text extraction using Mistral Pixtral via Supabase Edge Functions.
 * 
 * Includes a robust fallback to local Tesseract.js if the cloud AI fails.
 */

import { supabase } from '../lib/supabase';
import Tesseract from 'tesseract.js';

export interface OCRExtractedData {
    hemoglobin: string | null;
    blood_pressure: string | null;
    blood_sugar: string | null;
    heart_rate: string | null;
    raw_text: string;
}

/**
 * Converts an Image File to a Base64 string
 */
async function convertImageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
}

/**
 * Load PDF.js from npm package with unpkg CDN for worker
 */
async function loadPdfJs(): Promise<any> {
    try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
            'pdfjs-dist/build/pdf.worker.min.mjs',
            import.meta.url
        ).toString();
        return pdfjsLib;
    } catch (error) {
        console.error('Failed to load pdfjs-dist:', error);
        throw new Error('Failed to load PDF.js library');
    }
}

/**
 * Extract images from a PDF file by rendering pages to canvas and converting to Base64
 */
async function extractImagesFromPDF(pdfFile: File): Promise<string[]> {
    return new Promise(async (resolve, reject) => {
        try {
            const pdfjsLib = await loadPdfJs();
            const arrayBuffer = await pdfFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            
            const base64Images: string[] = [];
            // Process first 3 pages to save API tokens
            const pagesToProcess = Math.min(pdf.numPages, 3);

            for (let pageNum = 1; pageNum <= pagesToProcess; pageNum++) {
                try {
                    const page = await pdf.getPage(pageNum);
                    const viewport = page.getViewport({ scale: 2 }); 

                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');

                    if (!context) throw new Error('Could not get canvas context');

                    canvas.width = viewport.width;
                    canvas.height = viewport.height;

                    await page.render({
                        canvasContext: context,
                        canvas: canvas,
                        viewport: viewport,
                    }).promise;

                    // Convert to base64 jpeg to save payload size over png
                    base64Images.push(canvas.toDataURL('image/jpeg', 0.8));
                } catch (pageError) {
                    console.warn(`Error processing page ${pageNum}:`, pageError);
                    continue;
                }
            }

            if (base64Images.length === 0) {
                throw new Error('No images could be extracted from the PDF');
            }

            resolve(base64Images);
        } catch (error) {
            console.error('Error extracting text from PDF:', error);
            reject(new Error('Failed to parse PDF. Please ensure it is valid.'));
        }
    });
}

/**
 * Parse extracted text to find medical values (From Main Branch)
 */
function parseTextForMedicalData(text: string): OCRExtractedData {
    const data: OCRExtractedData = {
        hemoglobin: null,
        blood_pressure: null,
        blood_sugar: null,
        heart_rate: null,
        raw_text: text,
    };

    // Hemoglobin patterns
    const hemoglobinPatterns = [
        /hemoglobin[:\s]+(\d+\.?\d*)\s*(?:g\/dL|g\/L)?/gi,
        /hb[:\s]+(\d+\.?\d*)\s*(?:g\/dL|g\/L)?/gi,
    ];

    for (const pattern of hemoglobinPatterns) {
        const match = text.match(pattern);
        if (match) {
            const valueMatch = match[0].match(/(\d+\.?\d*)/);
            if (valueMatch) {
                // Determine if it was g/L from the original match to preserve units for the frontend auto-converter
                const isGl = match[0].toLowerCase().includes('g/l') && !match[0].toLowerCase().includes('g/dl');
                data.hemoglobin = valueMatch[1] + (isGl ? ' g/L' : ' g/dL');
                break;
            }
        }
    }

    // Blood Pressure patterns
    const bpPatterns = [
        /(?:blood pressure|bp)[:\s]+(\d+)\s*\/\s*(\d+)/gi,
        /(\d+)\s*\/\s*(\d+)\s*(?:mmHg)?/gi,
    ];

    for (const pattern of bpPatterns) {
        const match = text.match(pattern);
        if (match) {
            const systolicMatch = match[0].match(/(\d+)\s*\/\s*(\d+)/);
            if (systolicMatch) {
                data.blood_pressure = `${systolicMatch[1]}/${systolicMatch[2]}`;
                break;
            }
        }
    }

    // Blood Sugar patterns
    const bloodSugarPatterns = [
        /blood sugar[:\s]+(\d+\.?\d*)\s*(?:mg\/dL|mmol\/L)?/gi,
        /bs[:\s]+(\d+\.?\d*)\s*(?:mg\/dL|mmol\/L)?/gi,
        /glucose[:\s]+(\d+\.?\d*)\s*(?:mg\/dL|mmol\/L)?/gi,
    ];

    for (const pattern of bloodSugarPatterns) {
        const match = text.match(pattern);
        if (match) {
            const valueMatch = match[0].match(/(\d+\.?\d*)/);
            if (valueMatch) {
                const isMmol = match[0].toLowerCase().includes('mmol/l');
                data.blood_sugar = valueMatch[1] + (isMmol ? ' mmol/L' : ' mg/dL');
                break;
            }
        }
    }

    // Heart Rate patterns
    const heartRatePatterns = [
        /heart rate[:\s]+(\d+\.?\d*)\s*(?:bpm)?/gi,
        /hr[:\s]+(\d+\.?\d*)\s*(?:bpm)?/gi,
        /pulse[:\s]+(\d+\.?\d*)\s*(?:bpm)?/gi,
    ];

    for (const pattern of heartRatePatterns) {
        const match = text.match(pattern);
        if (match) {
            const valueMatch = match[0].match(/(\d+\.?\d*)/);
            if (valueMatch) {
                data.heart_rate = valueMatch[1] + ' bpm';
                break;
            }
        }
    }

    return data;
}

/**
 * Fallback Tesseract OCR function
 */
async function performTesseractFallback(base64Images: string[]): Promise<OCRExtractedData> {
    console.log("Falling back to local Tesseract.js...");
    try {
        const worker = await Tesseract.createWorker('eng');
        await worker.setParameters({
            // Use the whitelist from ocrfix.md for better accuracy
            tessedit_char_whitelist: '0123456789./mgdLBPHRFSabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ: '
        });

        let fullText = "";

        // Process all extracted pages with Tesseract
        for (let i = 0; i < base64Images.length; i++) {
            const ret = await worker.recognize(base64Images[i]);
            fullText += ret.data.text + "\n";
        }
        
        await worker.terminate();

        // Use the robust parser from the main branch
        return parseTextForMedicalData(fullText);

    } catch (error) {
        console.error("Tesseract Fallback Error:", error);
        throw new Error('Both Cloud AI and Local OCR failed to process the image.');
    }
}

/**
 * Main OCR function - handles both images and PDFs, sending them to Supabase Edge Function
 */
export async function performOCR(file: File): Promise<OCRExtractedData> {
    try {
        const fileType = file.type;
        const fileName = file.name.toLowerCase();
        let base64Images: string[] = [];

        // 1. Convert File to Base64 Image(s)
        if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
            base64Images = await extractImagesFromPDF(file);
        } else if (fileType.startsWith('image/') || fileName.match(/\.(jpg|jpeg|png)$/)) {
            const singleImage = await convertImageToBase64(file);
            base64Images.push(singleImage);
        } else {
            throw new Error('Unsupported file type. Please upload an image or PDF.');
        }

        console.log(`Sending ${base64Images.length} image(s) to Mistral API via Supabase Edge Function...`);

        // 2. Call Supabase Edge Function
        try {
            const { data, error } = await supabase.functions.invoke('mistral-ocr', {
                body: { images: base64Images }
            });

            if (error) {
                throw error;
            }

            // The Edge function should return the structured JSON data
            return data as OCRExtractedData;
        } catch (mistralError) {
            console.warn('Mistral Edge Function Error. Falling back to local OCR.', mistralError);
            return await performTesseractFallback(base64Images);
        }
        
    } catch (error) {
        console.error('OCR Error:', error);
        throw error;
    }
}
