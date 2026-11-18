import authRoutes from '../Routes/authRoutes.js';
import productsRoutes from '../Routes/productsRoutes.js';
import brandsRoutes from '../Routes/brandsRoutes.js';
import categoriesRoutes from '../Routes/categoriesRoutes.js';
import inventoryRoutes from '../Routes/inventoryRouts.js';
import bookingsRoutes from '../Routes/bookingsRoutes.js';
import locationsRoutes from '../Routes/locationsRoutes.js';
import notificationsRoutes from '../Routes/notificationsRoutes.js';

import authAdmin, { internal as authInternal } from '../Routes/admin/authAdminRoutes.js';
import catalogAdmin, { internal as catalogInternal } from '../Routes/admin/catalogAdminRoutes.js';
import inventoryAdmin, { internal as inventoryInternal } from '../Routes/admin/inventoryAdminRoutes.js';
import bookingAdmin, { internal as bookingInternal } from '../Routes/admin/bookingAdminRoutes.js';
import coreAdmin, { internal as coreInternal } from '../Routes/admin/coreAdminRoutes.js';

export const SERVICES = {
  auth: {
    port: 5001,
    schema: 'auth_svc',
    mounts: [['/api/auth', authRoutes], ['/api/admin', authAdmin], ['/internal/auth', authInternal]],
  },
  catalog: {
    port: 5002,
    schema: 'catalog',
    mounts: [
      ['/api/products', productsRoutes], ['/api/brands', brandsRoutes], ['/api/categories', categoriesRoutes],
      ['/api/admin', catalogAdmin], ['/internal/catalog', catalogInternal],
    ],
  },
  inventory: {
    port: 5003,
    schema: 'inventory',
    mounts: [['/api/inventory', inventoryRoutes], ['/api/admin', inventoryAdmin], ['/internal/inventory', inventoryInternal]],
  },
  booking: {
    port: 5004,
    schema: 'booking',
    mounts: [
      ['/api/bookings', bookingsRoutes], ['/api/locations', locationsRoutes], ['/api/notifications', notificationsRoutes],
      ['/api/admin', bookingAdmin], ['/internal/booking', bookingInternal],
    ],
  },
  admin: {
    port: 5005,
    schema: 'admin',
    mounts: [['/api/admin', coreAdmin], ['/internal/admin', coreInternal]],
  },
};
