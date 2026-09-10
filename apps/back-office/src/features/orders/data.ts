/** Public data module for orders — switches mock vs real by `USE_MOCKS`. */
import { USE_MOCKS } from '@/api/config';
import * as mock from '@/features/orders/mock';
import * as remote from '@/features/orders/api';

// Re-export the pure presentation helpers (badge variants, formatters).
export {
  statusBadgeVariant,
  paymentBadgeVariant,
  formatDateTime,
  formatPrice,
} from '@/features/orders/mock';

export const fetchOrders = USE_MOCKS ? mock.fetchOrders : remote.fetchOrders;
export const setOrderStatus = USE_MOCKS
  ? mock.setOrderStatus
  : remote.setOrderStatus;
export const deleteOrder = USE_MOCKS ? mock.deleteOrder : remote.deleteOrder;
