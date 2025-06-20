// src/features/pos/domain/services/PaymentService.ts
import type { Payment, PaymentMethod, PaymentMethodConfig } from '../Entities/Payment'

export class PaymentService {
  static readonly PAYMENT_METHODS: PaymentMethodConfig[] = [
    { id: 'Efectivo', label: 'Efectivo', color: 'green', icon: '💵' },
    { id: 'Transferencia', label: 'Transferencia', color: 'cyan', icon: '📱', requiresReference: true },
    { id: 'Cartera', label: 'Cartera', color: 'orange', icon: '📋' },
    { id: 'other', label: 'Otro', color: 'grey', icon: '🎫' }
  ]

  static createPayment(
    method: PaymentMethod, 
    amount: number, 
    reference?: string
  ): Payment {
    return {
      id: crypto.randomUUID(),
      method,
      amount: Math.round(amount * 100) / 100, // Redondear a 2 decimales
      timestamp: new Date(),
      reference
    }
  }

  static validatePayment(payment: Payment): string[] {
    const errors: string[] = []
    
    if (payment.amount <= 0) {
      errors.push('El monto debe ser mayor a 0')
    }
    
    if (payment.amount > 999999.99) {
      errors.push('El monto excede el límite máximo')
    }
    
    // Validar referencia si es requerida
    const methodConfig = this.getMethodConfig(payment.method)
    if (methodConfig?.requiresReference && !payment.reference) {
      errors.push(`${methodConfig.label} requiere referencia`)
    }
    
    return errors
  }

  static getMethodConfig(method: PaymentMethod): PaymentMethodConfig | undefined {
    return this.PAYMENT_METHODS.find(m => m.id === method)
  }

  static calculateTotal(payments: Payment[]): number {
    return Math.round(
      payments.reduce((sum, payment) => sum + payment.amount, 0) * 100
    ) / 100
  }

  static groupByMethod(payments: Payment[]): Map<PaymentMethod, Payment[]> {
    return payments.reduce((map, payment) => {
      const existing = map.get(payment.method) || []
      map.set(payment.method, [...existing, payment])
      return map
    }, new Map<PaymentMethod, Payment[]>())
  }
}