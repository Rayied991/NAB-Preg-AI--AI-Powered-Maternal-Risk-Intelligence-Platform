The ocr is currently implemted however it does not extract the texts correctly specifically from a messy handwritten document. 

How to Fix / Improve Your OCR (Step-by-Step)
1. Pre-processing is the Most Important Fix
Before sending the image to Tesseract, you must preprocess it. Add this code:

import cv2
import numpy as np
from PIL import Image
import pytesseract

def preprocess_for_ocr(image_path):
    # Read image
    img = cv2.imread(image_path)
    
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Denoise
    denoised = cv2.fastNlMeansDenoising(gray)
    
    # Increase contrast
    contrast = cv2.convertScaleAbs(denoised, alpha=1.5, beta=0)
    
    # Binarization (Otsu's thresholding)
    _, binary = cv2.threshold(contrast, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    # Optional: Slight dilation to make text thicker
    kernel = np.ones((1,1), np.uint8)
    dilated = cv2.dilate(binary, kernel, iterations=1)
    
    # Save or return processed image
    cv2.imwrite("processed_for_ocr.png", dilated)
    return "processed_for_ocr.png"

Then use it like this:
processed_img = preprocess_for_ocr("your_handwritten_prescription.jpg")
text = pytesseract.image_to_string(processed_img, config='--psm 6')

2. Best Tesseract Config for Handwritten Medical Text
custom_config = r'--oem 3 --psm 6 -c tessedit_char_whitelist=0123456789./mgdLBPHRFSabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
text = pytesseract.image_to_string(processed_img, config=custom_config)

--psm 6: Assume a single uniform block of text
Whitelist: Restrict to common characters in prescriptions