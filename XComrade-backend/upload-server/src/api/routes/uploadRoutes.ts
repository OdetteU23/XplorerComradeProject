import { OndeletingFile, uploadingFile } from '../controllers/uploadController';
import express from 'express';
import multer from 'multer';
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  }
});

const uploadMiddleware = multer({ storage }).single('file');

/**
 * @api {post} /api/upload/upload Upload a file
 * @apiName UploadFile
 * @apiGroup Upload
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiBody {File} file File to upload (multipart/form-data, field name: "file").
 *
 * @apiSuccess (201) {String} filename Stored filename.
 * @apiSuccess (201) {String} mime_type File MIME type.
 * @apiSuccess (201) {Number} file_size File size in bytes.
 * @apiError (400) {String} message No file uploaded.
 */
router.post('/upload', uploadMiddleware, uploadingFile);

/**
 * @api {delete} /api/upload/delete/:filename Delete an uploaded file
 * @apiName DeleteFile
 * @apiGroup Upload
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiParam {String} filename Name of the file to delete.
 *
 * @apiSuccess {String} message File deleted successfully.
 * @apiError (404) {String} message File not found.
 * @apiError (403) {String} message Unauthorized.
 */
router.delete('/delete/:filename', OndeletingFile);

export default router;
