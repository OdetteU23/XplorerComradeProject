//Upload controllers
import fs from 'fs';
import { UploadMessage } from '../../utils/types/localTypes';
import { Request, Response, NextFunction } from 'express';
//import { chatMessages } from '@xplorercomrade/types-server';
//import { error } from 'console';
import CustomError from '../../classes/CustomErrors';

const UPLOAD_DIR = './uploads';

const uploadingFile = (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const response: UploadMessage = {
            message: 'File uploaded successfully',
            data: {
                filename: req.file.filename,
                media_type: req.file.mimetype,
                filesize: req.file.size,
                screenshots: []
            }
        };
        res.status(200).json(response);
    } catch (err) {
        next(
            err instanceof CustomError
                ? err
                : new CustomError((err as Error).message, 500)
        );
    }
};
const OndeletingFile = async(req: Request<{ filename: string }>, res: Response, next: NextFunction) => {
  try{
    const { filename } = req.params;
    if (!filename) {
        return res.status(400).json({ message: 'Filename is required' });
    }

    if (res.locals.user_level_id !== 1) {
      const fileKäyttjäID = filename.split('_').pop()?.split('.')[0];
      if (!fileKäyttjäID || fileKäyttjäID !== res.locals.user_id.toString()) {
        return res.status(403).json({ message: 'You do not have permission to delete this file' });
      }
    }

    const filePath = `${UPLOAD_DIR}/${filename}`;
    const thumbPath = `${UPLOAD_DIR}/${filename}-thumb.png`;

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found' });
    }

    // Delete the thumbnail if it exists
    if (fs.existsSync(thumbPath)) {
        fs.unlink(thumbPath, (err) => {
            if (err) {
                console.error('Error deleting thumbnail:', err);
            }
        });
    }

    // Delete the main file
    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error deleting file' });
            }
            res.status(200).json({ message: 'File deleted successfully' });
        });
    }
   } catch (err) {
    next(
      err instanceof CustomError
        ? err
        : new CustomError((err as Error).message, 500)
    )
    console.error('Error in OndeletingFile controller:', err);
    return res.status(500).json({ message: 'Internal server error' });
}
};

const DeletingCache = (tiedostot: string[]) => {
   tiedostot.forEach((tiedosto) => {
    try {
      if (fs.existsSync(tiedosto)) {
        fs.unlinkSync(tiedosto);
      }
      } catch (err) {
        console.error(`Error deleting the file ${tiedosto}:`, err);
      }
    });
};

export { uploadingFile, OndeletingFile, DeletingCache };

