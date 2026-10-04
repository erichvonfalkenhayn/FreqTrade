<script setup lang="ts">
import { MarginMode, TradingMode } from '@/types';
import type { Exchange, ExchangeSelection } from '@/types';
import type { SelectMenuItem } from '@nuxt/ui';

const exchangeModel = defineModel<ExchangeSelection>({ required: true });

const botStore = useBotStore();

const bitgetExchange: Exchange = {
  name: 'Bitget',
  classname: 'bitget',
  valid: true,
  supported: true,
  comment: 'Available for spot and isolated futures trading.',
  trade_modes: [
    {
      trading_mode: TradingMode.SPOT,
      margin_mode: MarginMode.NONE,
    },
    {
      trading_mode: TradingMode.FUTURES,
      margin_mode: MarginMode.ISOLATED,
    },
  ],
};

const exchanges = computed(() => {
  const exchangeList = botStore.activeBot.exchangeList;
  const hasBitget = exchangeList.some(
    (exchange) =>
      exchange.name.toLowerCase() === 'bitget' || exchange.classname?.toLowerCase() === 'bitget',
  );
  return hasBitget ? exchangeList : [...exchangeList, bitgetExchange];
});

const exchangeList = computed<SelectMenuItem[]>(() => {
  const supported = exchanges.value
    .filter((ex) => ex.valid && ex.supported)
    .sort((a, b) => a.name.localeCompare(b.name));

  const unsupported = exchanges.value
    .filter((ex) => ex.valid && !ex.supported)
    .sort((a, b) => a.name.localeCompare(b.name));

  return [
    [
      { label: 'Supported', type: 'label' },
      ...supported.map((e) => ({ value: e.classname ?? e.name, label: e.name })),
    ],
    [
      { label: 'Unsupported', type: 'label' },
      ...unsupported.map((e) => ({ value: e.classname ?? e.name, label: e.name })),
    ],
  ];
});

const tradeModesTyped = computed(() => {
  const val = exchanges.value.find(
    (ex) =>
      ex.name === exchangeModel.value.exchange || ex.classname === exchangeModel.value.exchange,
  )?.trade_modes;
  return val ?? [];
});

const tradeModes = computed(() => {
  return tradeModesTyped.value.map((tm) => {
    return {
      label: `${tm.margin_mode} ${tm.trading_mode}`,
      value: tm,
    };
  });
});

watch(
  () => [exchangeModel.value.exchange, tradeModesTyped.value],
  () => {
    const selectedMode = tradeModesTyped.value.find(
      (mode) =>
        mode.trading_mode === exchangeModel.value.trade_mode.trading_mode &&
        mode.margin_mode === exchangeModel.value.trade_mode.margin_mode,
    );
    if (!selectedMode && tradeModesTyped.value[0]) {
      exchangeModel.value.trade_mode = tradeModesTyped.value[0];
    }
  },
);

onMounted(() => {
  if (botStore.activeBot.exchangeList.length === 0) {
    botStore.activeBot.getExchangeList();
  }
});
</script>

<template>
  <div class="w-full flex">
    <USelectMenu
      id="exchange-select"
      v-model="exchangeModel.exchange"
      class="min-w-52"
      value-key="value"
      :items="exchangeList"
    >
    </USelectMenu>
    <USelectMenu
      id="tradeMode-select"
      v-model="exchangeModel.trade_mode as any"
      class="min-w-44"
      :items="tradeModes"
      value-key="value"
      :disabled="tradeModes.length < 2"
    >
    </USelectMenu>
    <UButton
      color="neutral"
      variant="outline"
      class="ms-2 no-min-w"
      icon="mdi:refresh"
      @click="botStore.activeBot.getExchangeList()"
    />
  </div>
</template>
