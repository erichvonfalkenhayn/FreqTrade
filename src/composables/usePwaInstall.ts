import { computed, onBeforeUnmount, onMounted, shallowRef } from 'vue';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePwaInstall() {
  const deferredPrompt = shallowRef<BeforeInstallPromptEvent>();
  const isInstalled = shallowRef(false);
  const canInstall = computed(() => deferredPrompt.value !== undefined && !isInstalled.value);

  function onBeforeInstallPrompt(event: Event) {
    const installEvent = event as BeforeInstallPromptEvent;
    if (typeof installEvent.prompt !== 'function') {
      return;
    }
    event.preventDefault();
    deferredPrompt.value = installEvent;
  }

  function onAppInstalled() {
    isInstalled.value = true;
    deferredPrompt.value = undefined;
  }

  async function install() {
    const installEvent = deferredPrompt.value;
    if (!installEvent) {
      return;
    }

    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === 'accepted') {
      isInstalled.value = true;
    }
    deferredPrompt.value = undefined;
  }

  onMounted(() => {
    isInstalled.value = window.matchMedia('(display-mode: standalone)').matches;
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.removeEventListener('appinstalled', onAppInstalled);
  });

  return { canInstall, install };
}
