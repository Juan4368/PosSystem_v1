export interface Payment {
    readonly id: string;
    readonly method: PaymentMethod;
    readonly amount: number;
    readonly timestamp: Date;
    readonly reference?: string;

}

export type PaymentMethod = 'Efectivo'| 'Cartera' | 'Transferencia' | 'other';

export interface PaymentMethodConfig {
  readonly id: PaymentMethod
  readonly label: string
  readonly color: string
  readonly icon: string
  readonly requiresReference?: boolean
}