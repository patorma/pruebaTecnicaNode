<template>
  <div class="star-rating">
    <font-awesome-icon
      v-for="star in 5"
      :key="star"
      :icon="['fas', 'star']"
      :class="{ 'filled': star <= modelValue }"
      @click="setRating(star)"
      class="star"
    />
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  editable: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue']);

const setRating = (star) => {
  if (props.editable) {
    emit('update:modelValue', star);
  }
};
</script>

<style lang="scss" scoped>
/* Estilos ya definidos en main.scss, solo aquí por si se necesita algún ajuste local */
.star-rating {
  display: flex;
  justify-content: center;
  margin: 15px 0;

  .star {
    font-size: 2em;
    cursor: pointer;
    color: $star-color-empty; // Usa variables CSS si main.scss no se aplica
    transition: color 0.2s;

    &.filled {
      color: $star-color-filled;
    }

    &:hover {
      color: $star-color-filled;
    }
  }
}
</style>