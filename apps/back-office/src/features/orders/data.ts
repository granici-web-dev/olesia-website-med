/** Public data module for orders — switches mock vs real by `USE_MOCKS`. */
import { USE_MOCKS } from '@/api/config';
import * as mock from '@/features/orders/mock';
import * as remote from '@/features/orders/api';

// Orders are worked within days of arriving, so the year is noise in the list.
export {
  formatShortDateTime as formatDateTime,
  formatPrice,
} from '@/lib/format';
export {
  statusBadgeVariant,
  paymentBadgeVariant,
} from '@/features/orders/format';

export const fetchOrders = USE_MOCKS ? mock.fetchOrders : remote.fetchOrders;
export const setOrderStatus = USE_MOCKS
  ? mock.setOrderStatus
  : remote.setOrderStatus;
export const deleteOrder = USE_MOCKS ? mock.deleteOrder : remote.deleteOrder;
