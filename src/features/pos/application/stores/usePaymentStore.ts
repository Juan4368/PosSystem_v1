// src/features/pos/application/stores/usePaymentStore.ts
import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { PaymentService } from '../../domain/services/PaymentService'
import type { Payment, PaymentMethod } from '../../domain/Entities/Payment'
import { useOrderStore } from './useOrderStore'

export const usePaymentStore = defineStore('payment', () => {
  // ========================================
  // 📊 STATE
  // ========================================
  
  const payments = ref<Payment[]>([])
  const activeMethod = ref<PaymentMethod | null>(null)
  const reference = ref<string>('')
  
  // ========================================
  // 🧮 COMPUTED (GETTERS)
  // ========================================
  
  const paymentMethods = computed(() => PaymentService.PAYMENT_METHODS)
  
  const totalAssigned = computed(() => PaymentService.calculateTotal(payments.value))
  
  const paymentsByMethod = computed(() => {
    const grouped = PaymentService.groupByMethod(payments.value)
    const result: Record<PaymentMethod, number> = {
      Efectivo: 0,
      Cartera: 0,
      Transferencia: 0,
      other: 0,
    }
    
    for (const [method, methodPayments] of grouped) {
      result[method] = PaymentService.calculateTotal(methodPayments)
    }
    
    return result
  })
  
  const activeMethodConfig = computed(() => {
    return activeMethod.value ? PaymentService.getMethodConfig(activeMethod.value) : null
  })
  
  const requiresReference = computed(() => {
    return activeMethodConfig.value?.requiresReference ?? false
  })
  
  const remainingAmount = computed(() => {
    const orderStore = useOrderStore()
    return Math.max(0, orderStore.total - totalAssigned.value)
  })
  
  const isPaymentComplete = computed(() => remainingAmount.value === 0)
  
  const canAssignPayment = computed(() => {
    return activeMethod.value !== null && 
           (!requiresReference.value || reference.value.trim().length > 0)
  })
  
  // Resumen para mostrar en UI
  const paymentSummary = computed(() => {
    return Object.entries(paymentsByMethod.value)
      .filter(([, amount]) => amount > 0)
      .map(([methodKey, amount]) => ({
        method: methodKey as PaymentMethod,
        config: PaymentService.getMethodConfig(methodKey as PaymentMethod)!,
        amount,
        payments: payments.value.filter(p => p.method === methodKey)
      }))
  })
  
  // ========================================
  // ⚡ ACTIONS
  // ========================================
  
  function setActiveMethod(method: PaymentMethod | null) {
    activeMethod.value = method
    reference.value = '' // Limpiar referencia al cambiar método
  }
  
  function setReference(ref: string) {
    reference.value = ref
  }
  
  function assignPayment(amount: number, customReference?: string) {
    if (!activeMethod.value) {
      throw new Error('No hay método de pago seleccionado')
    }
    
    if (amount <= 0) {
      throw new Error('El monto debe ser mayor a 0')
    }
    
    if (amount > remainingAmount.value) {
      throw new Error('El monto excede lo que falta por pagar')
    }
    
    // ✅ Versión corregida - pasar reference desde la creación
    const finalReference = customReference || reference.value || undefined
    const payment = PaymentService.createPayment(
      activeMethod.value, 
      amount,
      finalReference
    )
    
    // Validar el pago
    const errors = PaymentService.validatePayment(payment)
    if (errors.length > 0) {
      throw new Error(errors.join(', '))
    }
    
    payments.value.push(payment)
    reference.value = '' // Limpiar referencia después de asignar
    
    // Si se completó el pago, limpiar método activo
    if (isPaymentComplete.value) {
      activeMethod.value = null
    }
  }
  
  function removePayment(paymentId: string) {
    const index = payments.value.findIndex(p => p.id === paymentId)
    if (index >= 0) {
      payments.value.splice(index, 1)
    }
  }
  
  function removePaymentsByMethod(method: PaymentMethod) {
    payments.value = payments.value.filter(p => p.method !== method)
  }
  
  function clearAllPayments() {
    payments.value = []
    activeMethod.value = null
    reference.value = ''
  }
  
  function loadRemainingAmount() {
    return remainingAmount.value
  }
  
  // Función de conveniencia para asignar el monto restante completo
  function assignRemainingAmount() {
    if (remainingAmount.value > 0 && activeMethod.value) {
      assignPayment(remainingAmount.value)
    }
  }
  
  // Auto-asignar montos comunes
  function assignHalfAmount() {
    const orderStore = useOrderStore()
    const halfAmount = Math.round((orderStore.total / 2) * 100) / 100
    if (halfAmount > 0 && activeMethod.value) {
      assignPayment(Math.min(halfAmount, remainingAmount.value))
    }
  }
  
  function assignQuarterAmount() {
    const orderStore = useOrderStore()
    const quarterAmount = Math.round((orderStore.total / 4) * 100) / 100
    if (quarterAmount > 0 && activeMethod.value) {
      assignPayment(Math.min(quarterAmount, remainingAmount.value))
    }
  }
  
  // ========================================
  // 📤 RETURN (PUBLIC API)
  // ========================================
  
  return {
    // State (readonly)
    payments: readonly(payments),
    activeMethod: readonly(activeMethod),
    reference: readonly(reference),
    
    // Getters
    paymentMethods,
    totalAssigned,
    paymentsByMethod,
    activeMethodConfig,
    requiresReference,
    remainingAmount,
    isPaymentComplete,
    canAssignPayment,
    paymentSummary,
    
    // Actions
    setActiveMethod,
    setReference,
    assignPayment,
    removePayment,
    removePaymentsByMethod,
    clearAllPayments,
    loadRemainingAmount,
    assignRemainingAmount,
    assignHalfAmount,
    assignQuarterAmount
  }
})