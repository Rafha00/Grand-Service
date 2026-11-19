import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// โหมด dev ใน Docker (docker-compose.dev.yml): รันที่พอร์ต 80 ใน container แล้วเปิดผ่าน Gateway :8081
// usePolling: Docker บน Windows ไม่ส่งสัญญาณว่าไฟล์เปลี่ยน ต้องคอยเช็คเอง
const dockerDev = process.env.DOCKER_DEV === 'true'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: dockerDev
    ? { host: true, port: 80, strictPort: true, watch: { usePolling: true, interval: 300 }, hmr: { clientPort: 8081 } }
    : undefined,
})
