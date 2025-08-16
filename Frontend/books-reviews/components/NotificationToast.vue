<template>
  <transition name="fade">
    <div v-if="message" :class="['notification-toast', type]">
      {{ message }}
    </div>
  </transition>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
  message: {
    type: String,
    default: null
  },
  type: {
    type: String,
    default: 'success' // 'success', 'error', 'info'
  }
});
</script>

<style lang="scss" scoped>
.notification-toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 15px 25px;
  border-radius: var(--border-radius, 5px);
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  color: white;
  z-index: 1001;
  font-weight: bold;

  &.success {
    background-color: var(--success-color, #8BC34A);
  }
  &.error {
    background-color: var(--danger-color, #f44336);
  }
  &.info {
    background-color: var(--secondary-color, #2196F3);
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s, transform 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>