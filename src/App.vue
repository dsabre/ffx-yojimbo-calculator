<script setup>
import _                from "lodash";
import Switch           from "./components/Switch.vue";
import {onMounted, ref} from "vue";

const LOCAL_STORAGE_KEY    = 'values';
const motivations          = [
    {from: 0, to: 3, value: 0},
    {from: 4, to: 7, value: 2},
    {from: 8, to: 15, value: 4},
    {from: 16, to: 31, value: 6},
    {from: 32, to: 63, value: 8},
    {from: 64, to: 127, value: 10},
    {from: 128, to: 255, value: 12},
    {from: 256, to: 511, value: 14},
    {from: 512, to: 1023, value: 16},
    {from: 1024, to: 2047, value: 18},
    {from: 2048, to: 4095, value: 20},
    {from: 4096, to: 8191, value: 22},
    {from: 8192, to: 16383, value: 24},
    {from: 16384, to: 32767, value: 26},
    {from: 32768, to: 65535, value: 28},
    {from: 65536, to: 131070, value: 30},
    {from: 131072, to: 262143, value: 32},
    {from: 262144, to: 524287, value: 34},
    {from: 524288, to: 1048575, value: 36},
    {from: 1048576, to: 2097151, value: 38},
    {from: 2097152, to: 4194303, value: 40},
    {from: 4194304, to: 8388607, value: 42},
    {from: 8388608, to: 16777215, value: 44},
    {from: 16777216, to: 33554431, value: 46},
    {from: 33554432, to: 67108863, value: 48},
    {from: 67108864, to: 134217727, value: 50},
    {from: 134217728, to: 268435455, value: 52},
    {from: 268435456, to: 536870911, value: 54},
    {from: 536870912, to: 999999999, value: 56},
];
const affinityChanges      = [
    {label: 'Non pagato', value: -20},
    {label: 'Yojimbo muore', value: -10},
    {label: 'Yojimbo richiamato', value: -3},
    {label: 'Attacca con Daigorou', value: -1},
    {label: 'Attacca con Kozuka', value: 0},
    {label: 'Usa Wakizashi su un solo nemico', value: 1},
    {label: 'Usa Wakizashi su tutti gli avversari', value: 3},
    {label: 'Zanmato!', value: 4},
];
const guilsSettings        = {min: 0, max: _.last(motivations).to};
const actions              = [
    {from: 0, to: 31, action: 'Daigorou'},
    {from: 32, to: 47, action: 'Kozuka'},
    {from: 48, to: 63, action: 'Wakizashi (singolo)'},
    {from: 64, to: 79, action: 'Wakizashi (su tutti i nemici)'},
    {from: 80, to: 999999, action: 'Zanmato'},
];
const turboValueSetting    = 2;
const randomValueSettings  = {min: 0, max: 63};
const affinitySettings     = {initial: 50, min: 0, max: 255};
const zanmatoPaths         = [
    {
        levels:   {
            1: 0.81,
            2: 0.81,
            3: 0.81,
            4: 0.4,
            5: 0.4,
        },
        getValue: (guils, affinity, zanmatoLevel, randomValue, hasTurbo) => {
            const zanmatoLevelValue = zanmatoPaths[0].levels[zanmatoLevel];
            const motivation        = motivations.filter(m => m.from <= guils && m.to >= guils)[0].value;
            const turboValue        = !!hasTurbo ? turboValueSetting : 0;

            return _.floor(motivation * (affinity / 30) * zanmatoLevelValue + randomValue + turboValue);
        }
    },
    {
        levels:   {
            1: 1,
            2: 0.5,
            3: 0.33,
            4: 0.25,
            5: 0.2,
        },
        getValue: (guils, affinity, zanmatoLevel, randomValue, hasTurbo, guilsRemaining) => {
            guilsRemaining = guilsRemaining < 1 ? 1 : guilsRemaining;

            const zanmatoLevelValue = zanmatoPaths[1].levels[zanmatoLevel];
            const motivation        = motivations.filter(m => m.from <= guils && m.to >= guils)[0].value;
            const turboValue        = !!hasTurbo ? turboValueSetting : 0;

            return _.floor([motivation * (affinity / 30)] * [0.75 + (guils * 0.5 / guilsRemaining)] * zanmatoLevelValue + randomValue + turboValue);
        }
    }
];
const zanmatoLevelSettings = {min: parseInt(_.first(Object.keys(zanmatoPaths[0].levels))), max: parseInt(_.last(Object.keys(zanmatoPaths[0].levels)))};
const getAction            = value => actions.filter(a => a.from <= value && a.to >= value)[0].action;
const guils                = ref(guilsSettings.min);
const guilsRemaining       = ref(guilsSettings.min);
const affinity             = ref(affinitySettings.initial);
const zanmatoLevel         = ref(zanmatoLevelSettings.min);
const randomValue          = ref(_.floor(randomValueSettings.max / 2));
const hasTurbo             = ref(false);
const zanmatoPath          = ref(0);
const yojimbo              = ref(0);
const yojimboAction        = ref(null);
const reloadData           = () => {
    const guilsValue          = _.clamp(guils.value, guilsSettings.min, guilsSettings.max);
    const guilsRemainingValue = _.clamp(guilsRemaining.value, guilsSettings.min, guilsSettings.max);
    const affinityValue       = _.clamp(affinity.value, affinitySettings.min, affinitySettings.max);
    const zanmatoLevelValue   = _.clamp(zanmatoLevel.value, zanmatoLevelSettings.min, zanmatoLevelSettings.max);
    const randomValueValue    = _.clamp(randomValue.value, randomValueSettings.min, randomValueSettings.max);

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([guilsValue, affinityValue, zanmatoLevelValue, randomValueValue, hasTurbo.value, guilsRemainingValue]));

    yojimbo.value       = zanmatoPaths[zanmatoPath.value].getValue(guilsValue, affinityValue, zanmatoLevelValue, randomValueValue, hasTurbo.value, guilsRemainingValue);
    yojimboAction.value = getAction(yojimbo.value);
};
const changeZanmatoPath    = (val) => {
    zanmatoPath.value = val ? 1 : 0;
    reloadData();
};
const changeAffinity       = action => {
    affinity.value += action.value;
    affinity.value = _.clamp(affinity.value, affinitySettings.min, affinitySettings.max);
    reloadData();
}
const reset                = () => {
    guils.value          = guilsSettings.min;
    guilsRemaining.value = guilsSettings.min;
    affinity.value       = affinitySettings.initial;
    zanmatoLevel.value   = zanmatoLevelSettings.min;
    randomValue.value    = _.floor(randomValueSettings.max / 2);
    hasTurbo.value       = false;
    reloadData();
}

onMounted(() => {
    let localStorageData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (localStorageData) {
        localStorageData = JSON.parse(localStorageData);

        guils.value          = localStorageData[0];
        affinity.value       = localStorageData[1];
        zanmatoLevel.value   = localStorageData[2];
        randomValue.value    = localStorageData[3];
        hasTurbo.value       = localStorageData[4];
        guilsRemaining.value = localStorageData[5];
    }

    reloadData();
});

</script>

<template>
    <div class="bg-black/50 sm:h-screen sm:flex sm:items-center sm:justify-center">
        <div class="bg-black/50 sm:w-max p-3 shadow-lg sm:border sm:border-black/50 text-gray-200 sm:rounded">
            <div class="space-y-3">
                <h1 class="text-2xl text-center">Yojimbo calculator</h1>

                <div class="flex justify-between items-center space-x-3">
                    <div class="w-min sm:w-max">Sconfiggere nemici forti</div>
                    <div>
                        <Switch :default-value="!!zanmatoPath" :on-change="changeZanmatoPath"/>
                    </div>
                    <div class="w-min sm:w-max">Addestrarmi come invocatrice/Potenziarmi sterminando mostri</div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="space-y-2">
                        <div>
                            <label for="guils">Guil pagati</label>
                            <input type="number" id="guils" placeholder="Guil pagati"
                                   v-model="guils" :min="guilsSettings.min" :max="guilsSettings.max"
                                   @change="reloadData" @keyup="reloadData"
                                   class="block p-2 text-black rounded w-full"
                            >
                        </div>
                        <div>
                            <label for="guilsRemaining">Guil rimanenti</label>
                            <input type="number" id="guilsRemaining" placeholder="Guil rimanenti"
                                   v-model="guilsRemaining" :min="guilsSettings.min" :max="guilsSettings.max"
                                   @change="reloadData" @keyup="reloadData"
                                   :disabled="zanmatoPath === 0"
                                   class="block p-2 text-black rounded w-full"
                            >
                        </div>
                        <div>
                            <label for="affinity">Affinità</label>
                            <input type="number" id="affinity" placeholder="Affinità"
                                   v-model="affinity" :min="affinitySettings.min" :max="affinitySettings.max"
                                   @change="reloadData" @keyup="reloadData"
                                   class="block p-2 text-black rounded w-full"
                            >
                        </div>
                        <div>
                            <label for="zanmatoLevel">Livello Zanmato</label>
                            <input type="number" id="zanmatoLevel" placeholder="Livello Zanmato"
                                   v-model="zanmatoLevel" :min="zanmatoLevelSettings.min"
                                   :max="zanmatoLevelSettings.max"
                                   @change="reloadData" @keyup="reloadData"
                                   class="block p-2 text-black rounded w-full"
                            >
                        </div>
                        <div>
                            <label for="randomValue">Valore random</label>
                            <input type="number" id="randomValue" placeholder="Valore random"
                                   v-model="randomValue" :min="randomValueSettings.min"
                                   :max="randomValueSettings.max"
                                   @change="reloadData" @keyup="reloadData"
                                   class="block p-2 text-black rounded w-full"
                            >
                        </div>
                        <div class="space-x-1">
                            <input type="checkbox" id="hasTurbo" @change="reloadData" v-model="hasTurbo">
                            <label for="hasTurbo" class="cursor-pointer">Barra turbo piena</label>
                        </div>
                        <div>
                            <button @click="reset"
                                    class="block w-full text-gray-100 p-2 rounded bg-orange-600 hover:bg-orange-700"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                    <div class="flex flex-col">
                        <div class="text-center space-y-4 mb-4 mt-4 sm:mt-0">
                            <hr class="sm:hidden">
                            <div>
                                <div>Valore:</div>
                                <div class="text-4xl text-orange-400">{{ yojimbo }}</div>
                            </div>
                            <div>
                                <div>Azione:</div>
                                <div class="text-xl text-orange-400">{{ yojimboAction }}</div>
                            </div>
                        </div>
                        <div class="space-y-1 order-first sm:order-last">
                            <hr class="sm:hidden">
                            <h2 class="text-xl">Modificatori affinità</h2>
                            <button v-for="action in affinityChanges"
                                    class="block w-full text-gray-100 p-2 rounded bg-purple-500 hover:bg-purple-600"
                                    @click="changeAffinity(action)"
                            >
                                {{ action.label }} ({{ action.value > 0 ? '+' : '' }}{{ action.value }})
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
</style>