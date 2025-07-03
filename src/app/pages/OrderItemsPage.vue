<template>
  <q-page class="q-pa-md">
    <q-table
      flat
      bordered
      :rows="items"
      :columns="columns"
      row-key="id"
      hide-bottom
      :rows-per-page-options="[0]"
    />
    <div class="text-right q-mt-md">
      <div>Subtotal: ${{ subtotal.toFixed(2) }}</div>
      <div>Impuestos: ${{ taxes.toFixed(2) }}</div>
      <div class="text-weight-bold">Total: ${{ total.toFixed(2) }}</div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useOrderStore } from '../../features/pos/application/stores/useOrderStore'

const orderStore = useOrderStore()

const items = orderStore.items
const subtotal = orderStore.subtotal
const taxes = orderStore.taxes
const total = orderStore.total

const columns = [
  { name: 'name', label: 'Nombre', field: 'name', align: 'left' },
  {
    name: 'price',
    label: 'Precio',
    field: 'price',
    align: 'right',
    format: (val: number) => val.toFixed(2)
  },
  { name: 'quantity', label: 'Cantidad', field: 'quantity', align: 'right' },
  {
    name: 'total',
    label: 'Total',
    field: 'total',
    align: 'right',
    format: (val: number) => val.toFixed(2)
  }
]
</script>
