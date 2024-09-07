<template>
    <q-card class="px-1">
        <q-card-section class=" flex justify-between sticky top-0 bg-white z-10 px-3 py-2">
            <div class="">請選擇時段（{{ props.durationMinutes }}分鐘<span v-if="props.intervalMinutes > 0">，休息{{
                props.intervalMinutes }}分鐘</span>）
            </div>
            <div>
                <!-- {{ props.date }} -->
                <div class="">{{ props.startAt }} ~ {{ props.endAt }}</div>
            </div>
        </q-card-section>
        <q-list separator>
            <template
                v-for="item in timeTable"
                :key="item.time.start"
            >
                <!-- <div class="bg-red m-2">
                    {{ timeRangeToString(item.time) }}
                    disable:{{ item.disable }}/ reserved:{{ item.reserved }}</div> -->
                <q-item
                    v-if="!item.disable || item.reserved"
                    class="relative"
                    v-ripple
                    borde
                    :disable="item.reserved"
                >
                    <q-item-section
                        side
                        top
                    >
                        <q-checkbox :model-value="item.reserved ? undefined : item.selected" />
                    </q-item-section>

                    <q-item-section>
                        <q-item-label>
                            <span :class="{ 'line-through': item.reserved }">
                                {{ timeRangeToString(item.time) }}
                            </span>
                            <span v-if="item.reserved">（已預約）</span>
                        </q-item-label>
                    </q-item-section>
                    <div
                        class="absolute w-full h-full "
                        @click="handleSelectTimeSlot(item.time)"
                    ></div>
                </q-item>
            </template>

        </q-list>
        <q-card-section class="sticky bottom-0 bg-white z-10">
            <slot name="action-section"></slot>
        </q-card-section>

    </q-card>

</template>

<script
    setup
    lang="ts"
>

import { isEqual, padStart } from 'lodash-es';
import dayjs from 'dayjs';
import type { ReservableSlot, ReserveCalendarProps, TimeSlot } from './type';
import { initTimeTable, timeRangeToString } from './utile';
import { clone, isDeepEqual, map, pipe, sort, uniqueWith } from 'remeda';


export interface Props {
    /**日期 YYYY/MM/DD */
    date: string;
    /**每一個預約時長最少 5 分鐘 最多24小時*/
    durationMinutes: number;
    /**已被預約的時段 */
    reservedTimeList: TimeSlot[];
    /**不能被預約的時段 */
    disableTimeList: TimeSlot[];
    /**開始時間（24小時制）HH:mm */
    startAt: string;
    /**結束時間（24小時制）HH:mm*/
    endAt: string;
    /**每個時間段間隔時間(分鐘) */
    intervalMinutes: number;

    /**已選擇的時段 */
    selectedTimeSlotList: TimeSlot[];
}

const props = withDefaults(defineProps<Props>(), {
});

const emit = defineEmits<{
    (e: 'update:selected-time-slot-list', value: TimeSlot[]): void;
    (e: 'select-time-slot-list', value: TimeSlot[]): void;
}>();

const $q = useQuasar();
// const check1 = ref(true)

/**時段表 */
const timeTable = computed(() => initTimeTable(props))



/**選擇時段 */
function handleSelectTimeSlot(timeSlot: TimeSlot) {
    const selectedTimeSlotList = clone(props.selectedTimeSlotList)

    // 如果 props.selectedTimeSlotList 中包含，則刪除
    const isSelectedIndex = selectedTimeSlotList.findIndex(item => isDeepEqual(timeSlot, item));
    if (isSelectedIndex > -1) {
        selectedTimeSlotList.splice(isSelectedIndex, 1)

    } else {
        selectedTimeSlotList.push(clone(timeSlot));
    }
    const uniqueSelectedTimeSlotList = uniqueWith(selectedTimeSlotList, isDeepEqual)
    emit('update:selected-time-slot-list', uniqueSelectedTimeSlotList);
}

</script>

<style scoped>

</style>