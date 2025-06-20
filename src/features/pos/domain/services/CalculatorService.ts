// src/features/pos/domain/services/CalculatorService.ts
export interface CalculatorState {
  display: string
  previousValue: number | null
  operation: string | null
  waitingForNewValue: boolean
}

export class CalculatorService {
  static inputNumber(state: CalculatorState, num: number): CalculatorState {
    if (state.waitingForNewValue) {
      return {
        ...state,
        display: String(num),
        waitingForNewValue: false
      }
    }
    
    return {
      ...state,
      display: state.display === '0' ? String(num) : state.display + num
    }
  }

  static performOperation(
    state: CalculatorState, 
    operation: string
  ): CalculatorState {
    const inputValue = parseFloat(state.display)

    if (state.previousValue !== null && state.operation && !state.waitingForNewValue) {
      const result = this.calculate(state.previousValue, inputValue, state.operation)
      
      if (operation === '=') {
        return {
          display: String(result),
          previousValue: null,
          operation: null,
          waitingForNewValue: true
        }
      }

      return {
        display: String(result),
        previousValue: result,
        operation,
        waitingForNewValue: true
      }
    }

    if (operation === '=') return state

    return {
      ...state,
      previousValue: inputValue,
      operation,
      waitingForNewValue: true
    }
  }

  private static calculate(first: number, second: number, op: string): number {
    switch (op) {
      case '+': return first + second
      case '-': return first - second
      case '*': return first * second
      case '/': return second !== 0 ? first / second : first
      default: return second
    }
  }
}
