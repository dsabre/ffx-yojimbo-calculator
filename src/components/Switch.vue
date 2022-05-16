<script setup>
import {ref} from "vue";

const ID_CHECKBOX = `checkbox${[Date.now(), Math.random()].join('').split('.').join('')}`;
const props       = defineProps({
    defaultValue: {type: Boolean, default: false},
    opt1:         {type: String, default: ''},
    opt2:         {type: String, default: ''},
    onChange:     {
        type: Function, default: () => {
        }
    },
});
const isChecked   = ref(props.defaultValue);
const doChange    = () => props.onChange(isChecked.value);
</script>

<template>
    <label :for="ID_CHECKBOX" class="toggler">
        <input type="checkbox" :id="ID_CHECKBOX" class="checkbox" @change="doChange" v-model="isChecked">
        <span class="ball"></span>
        <span class="opt1" v-html="props.opt1"></span>
        <span class="opt2" v-html="props.opt2"></span>
    </label>
</template>

<style scoped>
.toggler {
    @apply block border-2 border-purple-600 rounded-full cursor-pointer relative bg-gray-200;
    width: 60px;
    height: 31px;
}

.checkbox {
    @apply hidden;
}

.ball, .opt1, .opt2 {
    @apply absolute top-1/2 -translate-y-1/2;
}

.ball {
    @apply inline-block bg-purple-600 rounded-full z-10 transition-transform duration-150 ease-in-out;
    width: 23px;
    height: 23px;
    left: 2px;
}

.opt1 {
    left: 5px;
}

.opt2 {
    right: 5px;
}

.checkbox:checked + .ball {
    transform: translate(29px, -50%);
}
</style>