<script setup lang="ts">
const auth = useAuthStore()
const loyalty = useLoyalty()

onMounted(() => {
  if (auth.isAuthenticated) {
    void loyalty.loadOverview()
  }
})

watch(
  () => auth.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      void loyalty.loadOverview()
      return
    }

    loyalty.clear()
  },
)
</script>

<template>
  <UIButton
    v-if="auth.isAuthenticated"
    :text="$t('loyalty.header.points', { count: loyalty.balance.value })"
    intent="secondary"
    variant="subtle"
    size="sm"
    leading-icon="tabler:stars"
    to="/account/loyalty"
    class="hidden md:inline-flex"
  />
</template>
