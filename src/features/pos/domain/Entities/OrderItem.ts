export interface OrderItem{
    readonly id: number;
    readonly nombre: string;
    readonly cantidad: number;
    readonly precioUnitario: number;
    readonly subtotal: number;
}