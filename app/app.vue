<script setup>
const route = useRoute()
const isReportLayout = computed(() => route.meta.layout === 'report')

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'zh-Hant'
  }
})
</script>

<template>
  <UApp>
    <template v-if="!isReportLayout">
      <UHeader>
        <template #left>
          <NuxtLink to="/">
            <AppLogo class="h-6 w-auto shrink-0" />
          </NuxtLink>
          <TemplateMenu />
        </template>

        <template #right>
          <UColorModeButton />
          <UButton
            to="https://github.com/nuxt-ui-templates/starter"
            target="_blank"
            icon="i-simple-icons-github"
            aria-label="GitHub"
            color="neutral"
            variant="ghost"
          />
        </template>
      </UHeader>
    </template>

    <UMain :class="isReportLayout ? 'p-0 min-h-screen' : ''">
      <NuxtPage />
    </UMain>

    <template v-if="!isReportLayout">
      <USeparator icon="i-simple-icons-nuxtdotjs" />
      <UFooter>
        <template #left>
          <p class="text-sm text-muted">
            豐業專業驗樓報告系統 • © {{ new Date().getFullYear() }}
          </p>
        </template>
      </UFooter>
    </template>
  </UApp>
</template>
