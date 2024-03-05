<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
html, body, #__nuxt {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: var(--background-color);
}

html.light {
  --background-color: white;
}

html.dark {
  --background-color: #171717;

}
</style>
