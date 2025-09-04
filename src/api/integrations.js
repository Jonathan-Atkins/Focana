export const Core = {
  async InvokeLLM() {
    throw new Error('LLM integration not available offline');
  },
  async SendEmail() {
    throw new Error('Email integration not available offline');
  },
  async UploadFile() {
    throw new Error('File upload not available offline');
  },
  async GenerateImage() {
    throw new Error('Image generation not available offline');
  },
  async ExtractDataFromUploadedFile() {
    throw new Error('File processing not available offline');
  }
};

export const InvokeLLM = Core.InvokeLLM;
export const SendEmail = Core.SendEmail;
export const UploadFile = Core.UploadFile;
export const GenerateImage = Core.GenerateImage;
export const ExtractDataFromUploadedFile = Core.ExtractDataFromUploadedFile;
