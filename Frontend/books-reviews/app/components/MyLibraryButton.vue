<template>
  <NuxtLink to="/my-library" class="my-library-button">
    <font-awesome-icon :icon="['fas', 'book']" />
    <span>Mi Biblioteca</span>
  </NuxtLink>
</template>

<style lang="scss" scoped>
.my-library-button {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: $secondary-color;
  color: white;
  padding: 10px 15px;
  border-radius: $border-radius;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  transition: background-color 0.3s ease;

  &:hover {
    background-color: darken($secondary-color, 10%);
  }
}
</style>