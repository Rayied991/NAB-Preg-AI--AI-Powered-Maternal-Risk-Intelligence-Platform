import Tesseract from 'tesseract.js';

/**
 * OCRService - Handles image and PDF text extraction using Tesseract.js
 * Detects and extracts medical data: Hemoglobin, Blood Pressure, Blood Sugar, Heart Rate
 * 
 * For PDF support: converts PDF pages to images, then processes with Tesseract.js
 */

export interface OCRExtractedData {
    hemoglobin: string | null;
    blood_pressure: string | null;
    blood_sugar: string | null;
    heart_rate: string | null;
    raw_text: string;
}

/**
 * Extract text from an image file using Tesseract.js
 * @param imageFile - The image file to extract text from
 * @returns Promise<string> - Extracted text from the image
 */
async function extractTextFromImage(imageFile: File): Promise<string> {
    return new Promise(async (resolve, reject) => {
        try {
            const imageUrl = URL.createObjectURL(imageFile);

            const result = await Tesseract.recognize(imageUrl, 'eng', {
                logger: (m: any) => {
                    console.log('OCR Progress:', m);
                },
            });

            const extractedText = result.data.text;
            URL.revokeObjectURL(imageUrl);
            resolve(extractedText);
        } catch (error) {
            console.error('Error extracting text from image:', error);
            reject(error);
        }
    });
}

/**
 * Load PDF.js from npm package with unpkg CDN for worker
 * @returns Promise<any> - The PDF.js library object
 */
async function loadPdfJs(): Promise<any> {
    try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
            'pdfjs-dist/build/pdf.worker.min.mjs',
            import.meta.url
        ).toString();

        console.log(`Loaded PDF.js version ${(pdfjsLib as any).version}`);
        return pdfjsLib;
    } catch (error) {
        console.error('Failed to load pdfjs-dist:', error);
        throw new Error('Failed to load PDF.js library');
    }
}

/**
 * Extract text from a PDF file by rendering pages to canvas
 * @param pdfFile - The PDF file to extract text from
 * @returns Promise<string> - Extracted text from the PDF
 */
async function extractTextFromPDF(pdfFile: File): Promise<string> {
    return new Promise(async (resolve, reject) => {
        try {
            // Load PDF.js from npm package with unpkg CDN for worker
            const pdfjsLib = await loadPdfJs();

            const arrayBuffer = await pdfFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            let extractedText = '';

            // Process first 5 pages (to limit processing time for multi-page PDFs)
            const pagesToProcess = Math.min(pdf.numPages, 5);

            for (let pageNum = 1; pageNum <= pagesToProcess; pageNum++) {
                try {
                    const page = await pdf.getPage(pageNum);
                    const viewport = page.getViewport({ scale: 2 }); // Scale 2 for better quality

                    // Create canvas
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');

                    if (!context) {
                        throw new Error('Could not get canvas context');
                    }

                    canvas.width = viewport.width;
                    canvas.height = viewport.height;

                    // Render page to canvas
                    const renderContext = {
                        canvasContext: context,
                        canvas: canvas,
                        viewport: viewport,
                    };

                    await page.render(renderContext).promise;

                    // Convert canvas to image data URL
                    const imageDataUrl = canvas.toDataURL('image/png');

                    // Run OCR on the rendered page
                    console.log(`Processing PDF page ${pageNum} of ${pagesToProcess}...`);
                    const result = await Tesseract.recognize(imageDataUrl, 'eng', {
                        logger: (m: any) => {
                            if (m.status === 'recognizing') {
                                console.log(`Page ${pageNum} OCR progress:`, m.progress);
                            }
                        },
                    });

                    extractedText += result.data.text + '\n';
                } catch (pageError) {
                    console.warn(`Error processing page ${pageNum}:`, pageError);
                    // Continue with next page even if one fails
                    continue;
                }
            }

            if (!extractedText.trim()) {
                throw new Error('No text could be extracted from the PDF');
            }

            resolve(extractedText);
        } catch (error) {
            console.error('Error extracting text from PDF:', error);
            reject(
                new Error(
                    'Failed to extract text from PDF. Please ensure it\'s a valid PDF file.'
                )
            );
        }
    });
}

/**
 * Parse extracted text to find medical values
 * @param text - Raw extracted text
 * @returns OCRExtractedData - Parsed medical data
 */
function parseTextForMedicalData(text: string): OCRExtractedData {
    const data: OCRExtractedData = {
        hemoglobin: null,
        blood_pressure: null,
        blood_sugar: null,
        heart_rate: null,
        raw_text: text,
    };

    // Normalize text for easier matching
    const normalizedText = text.toLowerCase();

    // Hemoglobin patterns: "Hemoglobin: 8.5", "Hb: 8.5", "Hemoglobin 8.5 g/dL"
    const hemoglobinPatterns = [
        /hemoglobin[:\s]+(\d+\.?\d*)\s*(?:g\/dL)?/gi,
        /hb[:\s]+(\d+\.?\d*)\s*(?:g\/dL)?/gi,
    ];

    for (const pattern of hemoglobinPatterns) {
        const match = text.match(pattern);
        if (match) {
            const valueMatch = match[0].match(/(\d+\.?\d*)/);
            if (valueMatch) {
                data.hemoglobin = valueMatch[1] + ' g/dL';
                break;
            }
        }
    }

    // Blood Pressure patterns: "BP: 150/95", "Blood Pressure: 150/95"
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

    // Blood Sugar patterns: "Blood Sugar: 132", "BS: 132 mg/dL"
    const bloodSugarPatterns = [
        /blood sugar[:\s]+(\d+\.?\d*)\s*(?:mg\/dL)?/gi,
        /bs[:\s]+(\d+\.?\d*)\s*(?:mg\/dL)?/gi,
        /glucose[:\s]+(\d+\.?\d*)\s*(?:mg\/dL)?/gi,
    ];

    for (const pattern of bloodSugarPatterns) {
        const match = text.match(pattern);
        if (match) {
            const valueMatch = match[0].match(/(\d+\.?\d*)/);
            if (valueMatch) {
                data.blood_sugar = valueMatch[1] + ' mg/dL';
                break;
            }
        }
    }

    // Heart Rate patterns: "Heart Rate: 110", "HR: 110 bpm"
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
 * Main OCR function - handles both images and PDFs
 * @param file - The file to extract text from (image or PDF)
 * @returns Promise<OCRExtractedData> - Extracted and parsed medical data
 */
export async function performOCR(file: File): Promise<OCRExtractedData> {
    try {
        // Validate file type
        const fileType = file.type;
        const fileName = file.name.toLowerCase();

        let extractedText = '';

        // Handle PDF files
        if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
            extractedText = await extractTextFromPDF(file);
        }
        // Handle image files
        else if (
            fileType.startsWith('image/') ||
            fileName.endsWith('.jpg') ||
            fileName.endsWith('.jpeg') ||
            fileName.endsWith('.png')
        ) {
            extractedText = await extractTextFromImage(file);
        } else {
            throw new Error('Unsupported file type. Please upload an image or PDF.');
        }

        // Parse the extracted text for medical data
        const ocrData = parseTextForMedicalData(extractedText);

        return ocrData;
    } catch (error) {
        console.error('OCR Error:', error);
        throw error;
    }
}
