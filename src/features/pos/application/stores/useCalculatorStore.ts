// src/features/pos/application/stores/useCalculatorStore.ts
import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { CalculatorService, type CalculatorState } from '../../domain/services/CalculatorService'

export const useCalculatorStore = defineStore('calculator', () => {
  // State
  const state = ref<CalculatorState>({
    display: '0',
    previousValue: null,
    operation: null,
    waitingForNewValue: false
  })

  const isOpen = ref(false)

  // Getters
  const currentExpression = computed(() => {
    if (state.value.previousValue !== null && state.value.operation) {
      const symbol = state.value.operation === '*' ? '×' : 
                    state.value.operation === '/' ? '÷' : 
                    state.value.operation
      
      return state.value.waitingForNewValue 
        ? `${state.value.previousValue} ${symbol}`
        : `${state.value.previousValue} ${symbol} ${state.value.display}`
    }
    return ''
  })

  const partialResult = computed(() => {
    if (state.value.previousValue !== null && 
        state.value.operation && 
        !state.value.waitingForNewValue) {
      
      const current = parseFloat(state.value.display)
      if (!isNaN(current)) {
        return CalculatorService.performOperation(state.value, '=').display
      }
    }
    return null
  })

  // Actions
  function inputNumber(num: number) {
    state.value = CalculatorService.inputNumber(state.value, num)
  }

  function inputDecimal() {
    if (state.value.waitingForNewValue) {
      state.value = {
        ...state.value,
        display: '0.',
        waitingForNewValue: false
      }
    } else if (!state.value.display.includes('.')) {
      state.value = {
        ...state.value,
        display: state.value.display + '.'
      }
    }
  }

  function performOperation(operation: string) {
    state.value = CalculatorService.performOperation(state.value, operation)
  }

  // Agregar esta función al calculator store existente
 /*  function assignToPayment() {
  if (activePaymentType.value && calculator.display !== '0') {
    const paymentStore = usePaymentStore()
    const amount = parseFloat(calculator.display)
    
    try {
      paymentStore.assignPayment(amount)
      clearCalculator()
      
      // Auto-cargar restante si queda dinero
      setTimeout(() => {
        const remaining = paymentStore.remainingAmount
        if (remaining > 0) {
          loadAmount(remaining)
        }
      }, 100)
    } catch (error) {
      console.error('Error al asignar pago:', error)
      // Aquí podrías mostrar un toast de error
    }
  }
} */

  function clear() {
    state.value = {
      display: '0',
      previousValue: null,
      operation: null,
      waitingForNewValue: false
    }
  }

  function loadAmount(amount: number) {
    state.value = {
      ...state.value,
      display: amount.toFixed(2),
      waitingForNewValue: true
    }
  }

  function open() {
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  return {
    // State
    state: readonly(state),
    isOpen: readonly(isOpen),
    
    // Getters
    currentExpression,
    partialResult,
    
    // Actions
    inputNumber,
    inputDecimal,
    performOperation,
    clear,
    loadAmount,
    open,
    close
  }
})
