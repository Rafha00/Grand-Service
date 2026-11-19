import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

// สร้าง Express app ที่ตั้งค่าเหมือนกันทุก service
// mounts = [[path, router], ...]  ·  names = ชื่อ service ที่อยู่ใน app นี้ (ใช้ตอบ /health)
export const createApp = (names, mounts) => {
  const app = express();

  app.use(cors({ origin: process.env.FRONT_ORIGIN || 'http://localhost:5173', credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  app.get('/health', (req, res) => res.json({ status: 'ok', services: names, time: new Date().toISOString() }));
  for (const [path, router] of mounts) app.use(path, router);

  app.use((req, res) => res.status(404).json({ success: false, message: `ไม่พบ ${req.method} ${req.path}` }));
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  });
  return app;
};
