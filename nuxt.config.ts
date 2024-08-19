// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  // css: ['@/assets/custom.scss'],
  devtools: { enabled: true },
  modules: [
    "nuxt-quasar-ui",
    "@unocss/nuxt",
    '@vueuse/nuxt',
  ],
  quasar: {
    plugins: [
      'BottomSheet',
      'Dialog',
      'Loading',
      'LoadingBar',
      'Notify',
    ],
    extras: {
      font: 'roboto-font',
    },
    components: {
      defaults: {
        QBtn: {
          unelevated: true,
        },
      },
    },
  },
  unocss: {
    nuxtLayers: true,
  },
})