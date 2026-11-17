import { OrderStatus } from '@/lib/types';


const CLASS_BY_STATUS: Record<OrderStatus, string> = {
  [OrderStatus.CREATED]: 'badge badge-created',
  [OrderStatus.IN_DELIVERY]: 'badge badge-delivery',
  [OrderStatus.DELIVERED]: 'badge badge-done',
};


export default function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={CLASS_BY_STATUS[status] ?? 'badge'}>{status}</span>;}

