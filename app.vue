<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script lang="ts">
import * as dayjs from 'dayjs'
import 'dayjs/locale/zh-tw' // import locale
dayjs.locale('zh-tw') // use locale
</script>