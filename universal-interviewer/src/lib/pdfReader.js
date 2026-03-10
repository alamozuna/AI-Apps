import * as pdfjsLib from 'pdfjs-dist';
// Explicitly setting the worker source to load from unpkg CDN since we are in Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export async function extractTextFromPDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Loop through each page
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
    }
    
    return fullText.trim();
  } catch (error) {
    console.error("Error reading PDF file:", error);
    throw new Error("No se pudo extraer texto de este archivo PDF. Por favor, intenta con un PDF diferente o verifica si está encriptado.");
  }
}
