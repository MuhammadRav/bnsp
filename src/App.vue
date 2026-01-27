<script setup>
import { onMounted } from 'vue';
import { useInventoryStore } from './stores/inventoryStore';

const store = useInventoryStore();

onMounted(() => {
  store.fetchAllData(); // Load data dari database saat aplikasi mulai
});
</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>