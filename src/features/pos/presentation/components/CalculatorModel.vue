<script setup lang="ts">
import { computed } from 'vue'
import { PaymentService } from '../../domain/services/PaymentService'
import type { PaymentMethod } from '../../domain/Entities/Payment'
import { useCalculatorStore } from '../../application/stores/useCalculatorStore'
import { usePaymentStore } from '../../application/stores/usePaymentStore'
import { useOrderStore } from '../../application/stores/useOrderStore'

// Stores
const calculatorStore = useCalculatorStore()
const paymentStore = usePaymentStore()
const orderStore = useOrderStore()

// Payment methods
const paymentMethods = PaymentService.PAYMENT_METHODS

// Computeds
const activeMethodLabel = computed(() => {
  return paymentMethods.find(m => m.id === paymentStore.activeMethod)?.label
})

const remainingAmount = computed(() => {
  return Math.max(0, orderStore.total - paymentStore.totalAssigned)
})

const assignButtonLabel = computed(() => {
  if (!paymentStore.activeMethod) return '💰 Asignar'
  
  const amount = parseFloat(calculatorStore.state.display)
  return `💰 Asignar $${amount.toFixed(2)} → ${activeMethodLabel.value}`
})

// Functions
function handleEquals() {
  if (paymentStore.activeMethod) {
    handleAssign()
  } else {
    calculatorStore.performOperation('=')
  }
}

function handleAssign() {
  const amount = parseFloat(calculatorStore.state.display)
  paymentStore.assignPayment(amount)
  calculatorStore.clear()
  
  // Auto-cargar restante si queda dinero
  const remaining = orderStore.total - paymentStore.totalAssigned
  if (remaining > 0) {
    setTimeout(() => {
      calculatorStore.loadAmount(remaining)
    }, 100)
  }
}
</script>

<template>
  <q-dialog 
    v-model="calculatorStore.isOpen" 
    persistent
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="calculator-modal bg-grey-9 text-white">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Calculadora de Pagos</div>
        <q-space />
        <q-btn 
          icon="close" 
          flat 
          round 
          dense 
          @click="calculatorStore.close()"
        />
      </q-card-section>

      <q-card-section>
        <!-- Payment Methods -->
        <div class="row q-gutter-sm q-mb-md">
          <q-btn
            v-for="(method, index) in paymentMethods"
            :key="method.id"
            :class="[
              method.color,
              { 'ring-yellow': paymentStore.activeMethod === method.id }
            ]"
            :label="`${index + 1}. ${method.label}`"
            size="sm"
            @click="paymentStore.setActiveMethod(method.id as PaymentMethod)"
          />
        </div>

        <!-- Calculator Display -->
        <q-card flat class="bg-grey-10 q-mb-md">
          <q-card-section>
            <!-- Expression -->
            <div class="text-right text-caption text-grey-5 q-mb-xs">
              {{ calculatorStore.currentExpression }}
            </div>
            
            <!-- Main Display -->
            <div class="text-right text-h4 text-green">
              ${{ parseFloat(calculatorStore.state.display).toFixed(2) }}
            </div>

            <!-- Partial Result -->
            <div v-if="calculatorStore.partialResult" class="text-right text-yellow q-mt-xs">
              = ${{ parseFloat(calculatorStore.partialResult).toFixed(2) }}
            </div>

            <!-- Active Method -->
            <div v-if="paymentStore.activeMethod" class="text-center text-cyan q-mt-sm">
              → {{ activeMethodLabel }}
            </div>
          </q-card-section>
        </q-card>

        <!-- Quick Amounts -->
        <div class="row q-gutter-sm q-mb-md">
          <q-btn 
            color="green" 
            :label="`T - Total $${orderStore.total.toFixed(2)}`"
            @click="calculatorStore.loadAmount(orderStore.total)"
          />
          <q-btn 
            color="blue" 
            :label="`H - 1/2 $${(orderStore.total/2).toFixed(2)}`"
            @click="calculatorStore.loadAmount(orderStore.total/2)"
          />
          <q-btn 
            :color="remainingAmount > 0 ? 'orange' : 'green'"
            :label="`R - ${remainingAmount > 0 ? 'Restante' : 'Completo'} $${remainingAmount.toFixed(2)}`"
            @click="calculatorStore.loadAmount(remainingAmount)"
          />
        </div>

        <!-- Calculator Buttons -->
        <div class="calculator-grid">
          <!-- Primera fila -->
          <q-btn color="red" label="C" @click="calculatorStore.clear()" />
          <q-btn color="blue" label="÷" @click="calculatorStore.performOperation('/')" />
          <q-btn color="blue" label="×" @click="calculatorStore.performOperation('*')" />
          <q-btn color="blue" label="-" @click="calculatorStore.performOperation('-')" />
          
          <!-- Números -->
          <q-btn 
            v-for="num in [7,8,9]" 
            :key="num"
            color="grey-7" 
            :label="num" 
            @click="calculatorStore.inputNumber(num)" 
          />
          <q-btn 
            color="blue" 
            label="+" 
            class="row-span-2"
            @click="calculatorStore.performOperation('+')" 
          />
          
          <q-btn 
            v-for="num in [4,5,6]" 
            :key="num"
            color="grey-7" 
            :label="num" 
            @click="calculatorStore.inputNumber(num)" 
          />
          
          <q-btn 
            v-for="num in [1,2,3]" 
            :key="num"
            color="grey-7" 
            :label="num" 
            @click="calculatorStore.inputNumber(num)" 
          />
          <q-btn 
            color="green" 
            label="=" 
            class="row-span-2"
            @click="handleEquals" 
          />
          
          <q-btn 
            color="grey-7" 
            label="0" 
            class="col-span-2"
            @click="calculatorStore.inputNumber(0)" 
          />
          <q-btn color="grey-7" label="." @click="calculatorStore.inputDecimal()" />
        </div>

        <!-- Assign Button -->
        <q-btn
          :disable="!paymentStore.activeMethod || calculatorStore.state.display === '0'"
          :color="paymentStore.activeMethod ? 'yellow-8' : 'grey-6'"
          :label="assignButtonLabel"
          class="full-width q-mt-md"
          @click="handleAssign"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.calculator-grid {
  display: grid;