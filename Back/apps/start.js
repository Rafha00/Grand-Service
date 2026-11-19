import dotenv from 'dotenv';
dotenv.config();

const { SERVICES } = await import('./registry.js');
const { createApp } = await import('./createApp.js');

const name = process.argv[2] || process.env.SERVICE;
const service = SERVICES[name];
if (!service) {
  console.error(`ไม่รู้จัก service "${name}" (มี: ${Object.keys(SERVICES).join(', ')})`);
  process.exit(1);
}

const port = Number(process.env.PORT) || service.port;
createApp([name], service.mounts).listen(port, () => {
  console.log(`[${name}] service พร้อมที่ port ${port} (database schema: ${service.schema})`);
});
