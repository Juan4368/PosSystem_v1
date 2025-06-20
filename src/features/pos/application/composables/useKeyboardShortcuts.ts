// src/features/pos/application/composables/useKeyboardShortcuts.ts
import { useEventListener } from '@vueuse/core'
import { useCalculatorStore } from '../stores/useCalculatorStore'
import { usePaymentStore } from '../stores/usePaymentStore'

export function useKeyboardShortcuts() {
  const calculatorStore = useCalculatorStore()
  const paymentStore = usePaymentStore()

  useEventListener('keydown', (e: KeyboardEvent) => {
    // F12 para abrir calculadora
    if (e.key === 'F12') {
      e.preventDefault()
      if (!calculatorStore.isOpen) {
        paymentStore.loadRemainingAmount()
        calculatorStore.open()
      }
      return
    }

    // Solo si la calculadora está abierta
    if (!calculatorStore.isOpen) return

    e.preventDefault()

    // Números
    if (e.key >= '0' && e.key <= '9') {
      calculatorStore.inputNumber(parseInt(e.key))
    }
    // Operaciones
    else if (['+', '-', '*', '/', '='].includes(e.key) || e.key === 'Enter') {
      const operation = e.key === 'Enter' ? '=' : e.key
      
      if (operation === '=' && paymentStore.activeMethod) {
        paymentStore.assignPayment(parseFloat(calculatorStore.state.display))
        calculatorStore.clear()
      } else {
        calculatorStore.performOperation(operation)
      }
    }
    // Otros controles
    else if (e.key === '.' || e.key === ',') {
      calculatorStore.inputDecimal()
    }
    else if (e.key === 'c' || e.key === 'C' || e.key === 'Delete') {
      calculatorStore.clear()
    }
    else if (e.key === 'Escape') {
      calculatorStore.close()
    }
    // Métodos de pago (1-4)
    else if (e.key >= '1' && e.key <= '4') {
      const methods = ['Efectivo', 'Cartera', 'Transferencia', 'other']
      const index = parseInt(e.key) - 1

      if(index < 0 || index >= methods.length) return
      paymentStore.setActiveMethod(methods[index] as 'Efectivo' | 'Cartera' | 'Transferencia' | 'other')
    }
  })
}
