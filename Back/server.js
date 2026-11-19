import dotenv from "dotenv";
dotenv.config(); // แนะนำให้ใส่ไว้บรรทัดบนสุดเพื่อโหลดค่า .env

// รันทุก Microservice รวมกันใน server เดียว (ใช้ตอนพัฒนา: npm start)
// ตอน deploy จริงแยกเป็น container ละ service ด้วย apps/start.js (ดู docker-compose.yml)
const { SERVICES } = await import('./apps/registry.js');
const { createApp } = await import('./apps/createApp.js');

const names = Object.keys(SERVICES);
const mounts = names.flatMap((name) => SERVICES[name].mounts);

const PORT = process.env.PORT || 5000;
createApp(names, mounts).listen(PORT, () => {
    console.log(`Server is running on port ${PORT} (${names.join(', ')})`);
});
