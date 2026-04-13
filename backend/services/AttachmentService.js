const Attachment = require('../models/Attachment');
const cloudinary = require('../config/cloudinary');

class AttachmentService {
  static async uploadFile({ ticketId, uploadedBy, file, fileType }) {
    try {
      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataUri = `data:${file.mimetype};base64,${b64}`;

      const result = await cloudinary.uploader.upload(dataUri, {
        resource_type: 'image',
        folder: `support_tickets/${ticketId}`,
        public_id: `${Date.now()}-${file.originalname}`
      });

      const attachmentId = await Attachment.create({
        ticketId,
        uploadedBy,
        fileUrl: result.secure_url,
        publicId: result.public_id,
        fileName: file.originalname,
        fileType,
        fileSize: file.size
      });

      return attachmentId;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload file: ' + error.message);
    }
  }

  static async deleteFile(publicId) {
    await cloudinary.uploader.destroy(publicId);
  }

  static async getAttachmentsByTicketId(ticketId) {
    return Attachment.findByTicketId(ticketId);
  }
}

module.exports = AttachmentService;
