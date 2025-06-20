// src/features/pos/application/stores/useOrderStore.ts
import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'

export interface OrderItem {
  readonly id: string
  readonly name: string
  readonly quantity: number
  readonly price: number
  readonly total: number
}

export const useOrderStore = defineStore('order', () => {
  // ========================================
  // 📊 STATE
  // ========================================
  
  const items = ref<OrderItem[]>([
    { id: '1', name: 'Coca Cola 600ml', quantity: 2, price: 2.50, total: 5.00 },
    { id: '2', name: 'Pan Integral', quantity: 1, price: 3.20, total: 3.20 },
    { id: '3', name: 'Leche Deslactosada', quantity: 1, price: 4.80, total: 4.80 }
  ])
  
  const taxRate = ref(0.10) // 10% impuestos
  
  // ========================================
  // 🧮 COMPUTED (GETTERS)
  // ========================================
  
  const subtotal = computed(() => {
    return Math.round(
      items.value.reduce((sum, item) => sum + item.total, 0) * 100
    ) / 100
  })
  
  const taxes = computed(() => {
    return Math.round(subtotal.value * taxRate.value * 100) / 100
  })
  
  const total = computed(() => {
    return Math.round((subtotal.value + taxes.value) * 100) / 100
  })
  
  const itemCount = computed(() => items.value.length)
  
  const isEmpty = computed(() => items.value.length === 0)
  
  // ========================================
  // ⚡ ACTIONS
  // ========================================
  
  function addItem(item: Omit<OrderItem, 'id'>) {
    const newItem: OrderItem = {
      ...item,
      id: crypto.randomUUID()
    }
    items.value.push(newItem)
  }
  
  function removeItem(itemId: string) {
    const index = items.value.findIndex(item => item.id === itemId)
    if (index >= 0) {
      items.value.splice(index, 1)
    }
  }
  
  function updateItemQuantity(itemId: string, quantity: number) {
    const item = items.value.find(item => item.id === itemId)
    if (item && quantity > 0) {
      const updatedItem = {
        ...item,
        quantity,
        total: Math.round(item.price * quantity * 100) / 100
      }
      
      const index = items.value.findIndex(item => item.id === itemId)
      items.value[index] = updatedItem
    }
  }
  
  function clearOrder() {
    items.value = []
  }
  
  function setTaxRate(rate: number) {
    if (rate >= 0 && rate <= 1) {
      taxRate.value = rate
    }
  }
  
  // ========================================
  // 📤 RETURN (PUBLIC API)
  // ========================================
  
  return {
    // State (readonly)
    items: readonly(items),
    taxRate: readonly(taxRate),
    
    // Getters
    subtotal,
    taxes,
    total,
    itemCount,
    isEmpty,
    
    // Actions
    addItem,
    removeItem,
    updateItemQuantity,
    clearOrder,
    setTaxRate
  }
})
