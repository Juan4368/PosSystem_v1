import { describe, it, expect } from 'vitest'
import { PaymentService } from '../PaymentService'
import type { Payment } from '../../Entities/Payment'

describe('PaymentService', () => {
  it('creates a payment rounding amount', () => {
    const payment = PaymentService.createPayment('Efectivo', 10.555, 'ref')

    expect(payment.method).toBe('Efectivo')
    expect(payment.amount).toBe(10.56)
    expect(typeof payment.id).toBe('string')
    expect(payment.timestamp).toBeInstanceOf(Date)
    expect(payment.reference).toBe('ref')
  })

  it('validates payment rules', () => {
    const base: Payment = {
      id: '1',
      method: 'Transferencia',
      amount: -5,
      timestamp: new Date()
    }
    const errors1 = PaymentService.validatePayment(base)
    expect(errors1).toContain('El monto debe ser mayor a 0')

    const high: Payment = { ...base, amount: 1000000 }
    const errors2 = PaymentService.validatePayment(high)
    expect(errors2).toContain('El monto excede el límite máximo')

    const missingRef: Payment = { ...base, amount: 10 }
    const errors3 = PaymentService.validatePayment(missingRef)
    expect(errors3).toContain('Transferencia requiere referencia')
  })

  it('groups payments by method', () => {
    const p1 = PaymentService.createPayment('Efectivo', 5)
    const p2 = PaymentService.createPayment('Cartera', 2)
    const p3 = PaymentService.createPayment('Efectivo', 3)

    const grouped = PaymentService.groupByMethod([p1, p2, p3])
    expect(grouped.get('Efectivo')!.length).toBe(2)
    expect(grouped.get('Cartera')!.length).toBe(1)
  })
})
