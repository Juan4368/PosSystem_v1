import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCalculatorStore } from '../useCalculatorStore'

describe('useCalculatorStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('performs basic operations', () => {
    const store = useCalculatorStore()

    store.inputNumber(5)
    expect(store.state.display).toBe('5')

    store.performOperation('+')
    store.inputNumber(3)
    store.performOperation('=')

    expect(store.state.display).toBe('8')
  })

  it('controls open state', () => {
    const store = useCalculatorStore()
    store.open()
    expect(store.isOpen).toBe(true)
    store.close()
    expect(store.isOpen).toBe(false)
  })
})
