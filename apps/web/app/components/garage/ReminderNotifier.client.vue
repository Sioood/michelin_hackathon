<script setup lang="ts">
import type { Bike, GarageReminder } from '~/types/garage'

const auth = useAuthStore()
const garage = useGarage()
const canAsk = ref(false)
const dismissed = ref(false)

const dueReminders = computed(() =>
  garage.bikes.value.flatMap((bike) =>
    bike.reminders
      .filter((reminder) => reminder.severity !== 'ok')
      .map((reminder) => ({ bike, reminder })),
  ),
)
const storageKey = computed(
  () => `michelin_garage_notification_${new Date().toISOString().slice(0, 10)}`,
)

function getNotificationTitle(bike: Bike, reminder: GarageReminder): string {
  return reminder.severity === 'due'
    ? `Remplacement pneu recommandé · ${bike.name}`
    : `Pneu à surveiller · ${bike.name}`
}

function notifyDueReminders() {
  if (!import.meta.client || Notification.permission !== 'granted') {
    return
  }

  if (localStorage.getItem(storageKey.value) === 'sent') {
    return
  }

  for (const item of dueReminders.value.slice(0, 2)) {
    const notification = new Notification(getNotificationTitle(item.bike, item.reminder), {
      body: item.reminder.message,
      icon: '/pwa-icon.svg',
      tag: `garage-${item.reminder.installationId}`,
    })
    notification.onclick = () => {
      window.focus()
      void navigateTo(`/garage/${item.bike.id}`)
    }
  }

  localStorage.setItem(storageKey.value, 'sent')
}

async function enableNotifications() {
  if (!import.meta.client || !('Notification' in window)) {
    return
  }

  const permission = await Notification.requestPermission()
  canAsk.value = permission === 'default'
  notifyDueReminders()
}

onMounted(async () => {
  if (!('Notification' in window)) {
    return
  }

  canAsk.value = Notification.permission === 'default'

  if (!auth.isAuthenticated) {
    return
  }

  try {
    await garage.loadBikes()
    notifyDueReminders()
  } catch {
    // The garage page keeps the full error state; this notifier stays quiet.
  }
})
</script>

<template>
  <div
    v-if="auth.isAuthenticated && canAsk && dueReminders.length > 0 && !dismissed"
    class="fixed right-4 bottom-4 z-40 max-w-sm rounded-md border border-neutral-border-subtle bg-neutral-surface-default p-4 shadow-xl"
  >
    <div class="flex items-start gap-3">
      <Icon name="tabler:bell-ringing" class="mt-1 size-5 shrink-0 text-primary-text-default" />
      <div class="min-w-0">
        <p class="txt-label font-black">Rappels pneus</p>
        <p class="txt-sm mt-1 text-neutral-text-subtle">
          {{ dueReminders.length }} rappel{{ dueReminders.length > 1 ? 's' : '' }} à suivre dans
          votre garage.
        </p>
        <div class="mt-3 flex flex-wrap gap-2">
          <UIButton
            type="button"
            text="Activer"
            intent="primary"
            size="sm"
            @click="enableNotifications"
          />
          <UIButton
            type="button"
            icon="tabler:x"
            aria-label="Fermer"
            intent="neutral"
            variant="ghost"
            size="sm"
            @click="dismissed = true"
          />
        </div>
      </div>
    </div>
  </div>
</template>
