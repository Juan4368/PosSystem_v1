// src/features/pos/domain/services/__tests__/CalculatorService.test.ts
import { describe, it, expect } from 'vitest'
import { CalculatorService } from '../CalculatorService'

describe('CalculatorService', () => {
  it('should input numbers correctly', () => {
    const initialState = {
      display: '0',
      previousValue: null,
      operation: null,
      waitingForNewValue: false
    }

    const result = CalculatorService.inputNumber(initialState, 5)
    
    expect(result.display).toBe('5')
    expect(result.waitingForNewValue).toBe(false)
  })

  it('should perform addition correctly', () => {
    const state = {
      display: '5',
      previousValue: null,
      operation: null,
      waitingForNewValue: false
    }

    const afterPlus = CalculatorService.performOperation(state, '+')
    const withSecondNumber = { ...afterPlus, display: '3', waitingForNewValue: false }
    const result = CalculatorService.performOperation(withSecondNumber, '=')
    
    expect(result.display).toBe('8')
  })
})
