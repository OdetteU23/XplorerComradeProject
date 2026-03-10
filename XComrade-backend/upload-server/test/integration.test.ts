import request from 'supertest';
import express from 'express';
import fs from 'fs';
import path from 'path';
import uploadRoutes from '../src/api/routes/uploadRoutes';

const UPLOADS_DIR = path.resolve(__dirname, '../uploads');

beforeAll(() => {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
});

afterEach(() => {
  // Clean up any files written to uploads during tests
  if (fs.existsSync(UPLOADS_DIR)) {
    fs.readdirSync(UPLOADS_DIR).forEach((file) => {
      try {
        fs.unlinkSync(path.join(UPLOADS_DIR, file));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_) {
        // ignore errors for already-deleted files
      }
    });
  }
});

/**
 * Build an Express app with optional user context injected into res.locals.
 * This simulates what the real auth middleware would set.
 */
function createApp(userLevelId?: number, userId?: number) {
  const app = express();
  app.use(express.json());
  if (userLevelId !== undefined || userId !== undefined) {
    app.use((_req, res, next) => {
      if (userLevelId !== undefined) res.locals.user_level_id = userLevelId;
      if (userId !== undefined) res.locals.user_id = userId;
      next();
    });
  }
  app.use('/api/upload', uploadRoutes);
  return app;
}

// ---------------------------------------------------------------------------
// POST /api/upload/upload
// ---------------------------------------------------------------------------
describe('POST /api/upload/upload', () => {
  it('returns 400 when no file is attached', async () => {
    const app = createApp();
    const res = await request(app).post('/api/upload/upload').expect(400);
    expect(res.body.message).toBe('No file uploaded');
  });

  it('returns 200 and file metadata when a valid file is uploaded', async () => {
    const app = createApp();
    const res = await request(app)
      .post('/api/upload/upload')
      .attach('file', Buffer.from('fake image data'), 'test-image.jpg')
      .expect(200);

    expect(res.body.message).toBe('File uploaded successfully');
    expect(res.body.data).toBeDefined();
    expect(res.body.data.filename).toBeDefined();
    expect(res.body.data.media_type).toBeDefined();
    expect(typeof res.body.data.filesize).toBe('number');
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/upload/delete/:filename
// ---------------------------------------------------------------------------
describe('DELETE /api/upload/delete/:filename', () => {
  it('returns 403 when a level-2 user tries to delete another user\'s file', async () => {
    // user_id = 1; filename suffix after last _ = 99 → permission denied
    const app = createApp(2, 1);
    const res = await request(app)
      .delete('/api/upload/delete/file-12345678_99.jpg')
      .expect(403);
    expect(res.body.message).toContain('permission');
  });

  it('returns 404 when the requested file does not exist on disk', async () => {
    // admin (level 1) bypasses the per-user check
    const app = createApp(1, 1);
    const res = await request(app)
      .delete('/api/upload/delete/nonexistent-file.jpg')
      .expect(404);
    expect(res.body.message).toBe('File not found');
  });

  it('returns 200 when an admin deletes an existing file', async () => {
    const filename = 'admin-delete-test.jpg';
    fs.writeFileSync(path.join(UPLOADS_DIR, filename), 'fake content');

    const app = createApp(1, 1);
    const res = await request(app)
      .delete(`/api/upload/delete/${filename}`)
      .expect(200);
    expect(res.body.message).toBe('File deleted successfully');
  });

  it('returns 200 when a user deletes their own file (id suffix matches)', async () => {
    // Controller: filename.split('_').pop()?.split('.')[0] must equal user_id.toString()
    // 'file-12345_1.jpg' → '1'  matches  user_id = 1
    const filename = 'file-12345_1.jpg';
    fs.writeFileSync(path.join(UPLOADS_DIR, filename), 'fake content');

    const app = createApp(2, 1);
    const res = await request(app)
      .delete(`/api/upload/delete/${filename}`)
      .expect(200);
    expect(res.body.message).toBe('File deleted successfully');
  });
});

