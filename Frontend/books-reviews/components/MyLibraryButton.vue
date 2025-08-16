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
  background-color: var(--secondary-color, #2196F3);
  color: white;
  padding: 10px 15px;
  border-radius: var(--border-radius, 5px);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  transition: background-color 0.3s ease;

  &:hover {
    background-color: darken(var(--secondary-color, #2196F3), 10%);
  }
}
</style>