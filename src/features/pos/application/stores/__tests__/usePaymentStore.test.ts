import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePaymentStore } from '../usePaymentStore'
import { useOrderStore } from '../useOrderStore'

describe('usePaymentStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('assigns payments and updates totals', () => {
    const orderStore = useOrderStore()
    const store = usePaymentStore()

    store.setActiveMethod('Efectivo')
    store.assignPayment(5)

    expect(store.payments.length).toBe(1)
    expect(store.totalAssigned).toBe(5)
    expect(store.remainingAmount).toBeCloseTo(orderStore.total - 5)
  })

  it('removes payments by method', () => {
    useOrderStore()
    const store = usePaymentStore()

    store.setActiveMethod('Efectivo')
    store.assignPayment(3)
    store.setActiveMethod('Cartera')
    store.assignPayment(2)

    expect(store.payments.length).toBe(2)

    store.removePaymentsByMethod('Efectivo')
    expect(store.payments.every(p => p.method !== 'Efectivo')).toBe(true)
  })
})
