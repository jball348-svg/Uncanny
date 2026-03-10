import * as mammoth from 'mammoth';

export const readTxtFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

export const readDocxFile = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  // We use extractRawText to get plain text without HTML wrapper
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
};
