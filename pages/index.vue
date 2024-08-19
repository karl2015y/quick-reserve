<template>
    <q-page class="q-pl-lg pb-6">
        <p class="text-h6 q-pt-md">Plugin Showcase</p>
        <q-list>
            <q-item
                v-for="(button, idx) in buttons"
                :key="idx"
            >
                <q-btn
                    color="primary"
                    v-bind="button"
                />
            </q-item>
            <q-item>
                <q-toggle
                    :model-value="dark.isActive"
                    checked-icon="dark_mode"
                    unchecked-icon="light_mode"
                    size="3rem"
                    @update:model-value="(val) => dark.set(val)"
                />
            </q-item>
        </q-list>
        <p class="text-h6 q-pt-md">Directive Showcase</p>
        <q-list
            bordered
            separator
            style="max-width: 318px"
        >
            <q-item
                v-ripple
                clickable
            >
                <q-item-section>Ripple</q-item-section>
            </q-item>
        </q-list>
        <p class="text-h6 q-pt-md">UnoCss Showcase</p>
        <div>
            <div class="bg-red-500 text-white p-3 w-xs"> text</div>
        </div>

        <p class="text-h6 q-pt-md">Lodash & Remeda Showcase</p>

        <q-list
            bordered
            separator
            style="max-width: 318px"
        >
            <q-item>
                <q-item-section>Remeda</q-item-section>
                <q-item-section>{{ l_join(['a', 'b', 'c'], '/') }}</q-item-section>
            </q-item>

            <q-item>
                <q-item-section>Lodash</q-item-section>
                <q-item-section>{{ r_join(['a', 'b', 'c'], '/') }}</q-item-section>
            </q-item>
        </q-list>


        <p class="text-h6 q-pt-md">VueUse Showcase</p>
        <q-list
            bordered
            separator
            style="max-width: 318px"
        >
            <q-item ref="target">
                <q-item-section>MouseEvent</q-item-section>
                <q-item-section>x:{{ x }}, y:{{ y }}</q-item-section>
            </q-item>
        </q-list>

    </q-page>
</template>


<script
    setup
    lang="ts"
>
import { useQuasar } from 'quasar';
import type { QBtnProps, QNotifyOptions } from 'quasar';
import { join as l_join, sample } from 'lodash-es';
import { join as r_join } from 'remeda';
import { useMouseInElement } from '@vueuse/core'

const { dialog, bottomSheet, loading, loadingBar, notify, dark, screen } =
    useQuasar();

loadingBar.setDefaults({
    color: 'green',
    size: '15px',
    position: 'bottom',
});



const target = ref(null)
const { x, y } = useMouseInElement(target)

const showBottomsheet = () =>
    bottomSheet({
        message: 'Bottom Sheet',
        actions: [
            {
                label: 'Drive',
                img: 'https://cdn.quasar.dev/img/logo_drive_128px.png',
                id: 'drive',
            },
            {
                label: 'Keep',
                img: 'https://cdn.quasar.dev/img/logo_keep_128px.png',
                id: 'keep',
            },
            {
                label: 'Google Hangouts',
                img: 'https://cdn.quasar.dev/img/logo_hangouts_128px.png',
                id: 'calendar',
            },
            {
                label: 'Calendar',
                img: 'https://cdn.quasar.dev/img/logo_calendar_128px.png',
                id: 'calendar',
            },
        ],
    });



type Position = Exclude<QNotifyOptions['position'], undefined>;

const buttons: QBtnProps[] = [
    {
        label: 'Bottomsheet',
        onClick: () => showBottomsheet(),
    },
    {
        label: 'Loading',
        onClick: () => {
            loading.show();
            setTimeout(() => {
                loading.hide();
            }, 1000);
        },
    },
    {
        label: 'LoadingBar',
        onClick: () => {
            loadingBar.start();
            setTimeout(() => {
                loadingBar.stop();
            }, 1000);
        },
    },
    {
        label: 'Dialog',
        onClick: () => dialog({ message: 'Hello World' }),
    },
    {
        label: 'Notify',
        onClick: () =>
            notify({
                message: 'Hello World',
                position: sample([
                    'left',
                    'right',
                    'center',
                    'bottom',
                    'top',
                ]),
            }),
    },
];
</script>
