import type { OrderItem } from './OrderItem';
import type { Payment } from './Payment';

export interface Order
{
    readonly id: string;
    readonly items: OrderItem[];
    readonly payments: Payment[];
    readonly subtotal: number;
    readonly taxes: number;
    readonly total: number;
    readonly timesstatus: OrderStatus;
}

export type OrderStatus = 'Pendiente' 
| 'Enviado' 
| 'Entregado' 
| 'Cancelado' 
| 'Entregado Parcialmente'
| 'other'; 