<template>
    <div class="flex flex-col flex-nowrap sm:max-w-2xl w-[290px] sm:w-full">
        <div class="flex flex-nowrap">
            <q-date
                v-model="date"
                flat
                square
                class=" border border-solid  border-gray-300 sm:border-r-0 "
                :events="selectedDate"
                @update:model-value="handleReserveCalenderList()"
                :options="dateFilter"
            />
            <div class="h-[400px] overflow-y-auto border border-solid  border-gray-300 flex-1 hidden sm:!block">
                <div
                    v-if="reserveCalendarListProps === 'loading'"
                    class="w-full h-full relative"
                >
                    <q-inner-loading
                        :showing="true"
                        label="搜尋可預約的時段..."
                    />
                </div>
                <div
                    v-else-if="reserveCalendarListProps === undefined"
                    class="flex justify-center items-center w-full h-full"
                >
                    <div class="text-gray">暫無可預約的時段，換個時間試試看吧</div>
                </div>
                <reserve-calendar-list
                    v-else
                    v-bind="reserveCalendarListProps"
                >
                    <template #action-section>
                        <div class="flex w-full">
                            <q-btn
                                v-if="selectedTimeSlotList.length > 0"
                                label="重選選擇"
                                color="primary"
                                outline
                                @click="handleConfirmReset()"
                            />
                            <q-btn
                                :label="nextBtnText"
                                :disable="selectedTimeSlotList.length === 0"
                                color="primary"
                                class="ml-auto"
                                @click="handleConfirmNext()"
                            />
                        </div>
                    </template>
                </reserve-calendar-list>

            </div>
        </div>

        <div
            class="flex mt-2"
            v-if="isPhone && isHydrated"
        >
            <q-btn
                v-if="selectedTimeSlotList.length > 0"
                label="重選選擇"
                color="primary"
                outline
                @click="handleConfirmReset()"
            />
            <q-btn
                :label="nextBtnText"
                :disable="selectedTimeSlotList.length === 0"
                color="primary"
                class="ml-auto"
                @click="handleConfirmNext()"
            />
        </div>

        <q-dialog
            v-if="isPhone && (reserveCalendarListProps !== 'loading')"
            v-model="dialogVisible"
            position="bottom"
            class="bg-transparent"
            transition-duration="600"
        >

            <div
                v-if="reserveCalendarListProps === undefined"
                class="flex justify-center items-center w-full h-full"
            >
                <div class="text-gray">暫無可預約的時段，換個時間試試看吧</div>
            </div>
            <reserve-calendar-list
                v-else
                v-bind="reserveCalendarListProps"
            >
                <template #action-section>
                    <div class="w-full">
                        <q-btn
                            label="關閉"
                            color="primary"
                            class="w-full"
                            @click="dialogVisible = false"
                        />
                    </div>
                </template>
            </reserve-calendar-list>
        </q-dialog>
        <q-inner-loading
            v-if="isPhone && isHydrated"
            :showing="reserveCalendarListProps === 'loading'"
            label="搜尋可預約的時段..."
            transition-show="slide-up"
            transition-hide="slide-down"
            transition-duration="600"
        />
        <!-- {{ selectedTimeSlotList }} -->

    </div>

</template>

<script
    setup
    lang="ts"
>

import { padStart } from 'lodash-es';
import { openUsingDialog } from '~/common/utils-quasar';
import ReserveCalendarList from './reserve-calendar-list.vue';
import DialogReserveCalendarList from './dialog-reserve-calendar-list.vue';
import dayjs from 'dayjs';
import type { ReserveTableItem, TimeSlot } from './type';
import { clone, pipe, sort } from 'remeda';
import { promiseTimeout } from '@vueuse/core';
import { timeRangeToString } from './utile';
const isHydrated = ref(false);
onMounted(() => {
    isHydrated.value = true;
})

const dialogVisible = ref(false);
const date = ref(dayjs().format('YYYY/MM/DD'));
watch(date, (newDate, oldValue) => {
    console.log("🚀 ~ watch ~ newDate:", newDate, oldValue)
    if (!newDate || newDate.split('/').length !== 3) {
        date.value = oldValue;
    }
})
const $q = useQuasar();
const isPhone = computed(() => $q.screen.lt.sm);
const selectedTimeSlotList = ref<TimeSlot[]>([]);
const selectedTimeSlotStringList = computed(() => {
    return pipe(selectedTimeSlotList.value,
        (timeSlotList) => clone(timeSlotList),
        (list) => sort(list, (a, b) => a.start - b.start),
        (list) => list.map((item) => timeRangeToString(item, true)),
        (list) => list.map((item, index) => `　${index + 1}. ${item}`)
    );
})
const selectedDate = computed(() => selectedTimeSlotList.value.map(item => dayjs(item.start).format('YYYY/MM/DD')));

export interface Props {
    label?: string;
    /**休假日 */
    dayOffList?: string[];
    /**可選時段的參數 */
    // reserveCalendarListProps?: 'loading' | Omit<InstanceType<typeof ReserveCalendarList>['$props'],
    //     'selectedTimeSlotList' | 'onUpdate:selected-time-slot-list' | 'onSelect-time-slot-list'
    // >;
    reserveCalendarListProps?: 'loading' | ReserveTableItem
}

const props = withDefaults(defineProps<Props>(), {
    label: '選擇預約時段',
    dayOffList: () => []
});

const emit = defineEmits<{
    (e: 'select-time-slot-list', value: TimeSlot[]): void;
    // 日曆換月
    (e: 'changeMonth', value: string): void;
    // 日曆換日
    (e: 'changeDate', value: string): void;
}>();

/**
 * 選擇時段
 * @param timeSlotList 時段
 */
function handelSelectTimeSlotList(timeSlotList: TimeSlot[]) {
    emit('select-time-slot-list', clone(timeSlotList));
    selectedTimeSlotList.value = []
}

/**
 * 開啟預約日曆
 */
function handleReserveCalenderList() {
    dialogVisible.value = true;
}

watch(date, async () => {
    emit('changeDate', date.value);
}, { immediate: true })
const reserveCalendarListProps = computed(() => {
    if (!props.reserveCalendarListProps) return undefined
    if (props.reserveCalendarListProps === 'loading') return 'loading'
    return {
        // date: date.value,
        // durationMinutes: 30,
        // intervalMinutes: 0,
        // reservedTimeList: [
        //     {
        //         start: 1724308200000,
        //         end: 1724310000000
        //     },
        //     {
        //         start: 1724310000000,
        //         end: 1724311800000
        //     },
        //     {
        //         start: 1724481000000,
        //         end: 1724482800000
        //     },
        //     {
        //         start: 1724482800000,
        //         end: 1724484600000
        //     }
        // ],
        // disableTimeList: [
        //     { start: 1706751900000, end: 1706753700000 }, // 09:45 ~ 10:15
        // ],
        // startAt: '13:00',
        // endAt: '18:00',
        ...props.reserveCalendarListProps,
        selectedTimeSlotList: selectedTimeSlotList.value,
        'onUpdate:selected-time-slot-list': (value: TimeSlot[]) => {
            selectedTimeSlotList.value = clone(value)
        },
        'onSelect-time-slot-list': handelSelectTimeSlotList
    } satisfies InstanceType<typeof ReserveCalendarList>['$props']

})



const nextBtnText = computed(() => {
    // 已選擇的時段數量
    const selectedTimeSlotCount = selectedTimeSlotList.value.length;
    return selectedTimeSlotCount > 0 ? `下一步，已選 ${selectedTimeSlotCount} 個時段` : '下一步'
})


/**確認是否要全部重新選 */
function handleConfirmReset() {
    if (selectedTimeSlotList.value.length === 0) return;
    const text = `已選擇時段：<br><br>${selectedTimeSlotStringList.value.join('<br>')}<br><br>確定要重新選擇時段嗎？`;
    $q.dialog({
        title: '重新選擇時段',
        message: text,
        html: true,
        ok: '確定',

        cancel: '取消',
    }).onOk(() => {
        selectedTimeSlotList.value = [];
    })
}

/**確認是否要下一步 */
function handleConfirmNext() {
    if (selectedTimeSlotList.value.length === 0) return;
    const text = `已選擇時段：<br><br>${selectedTimeSlotStringList.value.join('<br>')}<br><br>確定要下一步嗎？`;
    $q.dialog({
        title: '確認時段',
        message: text,
        html: true,
        ok: '確定',
        cancel: '取消',
    }).onOk(() => {
        emit('select-time-slot-list', selectedTimeSlotList.value);
        selectedTimeSlotList.value = [];
    })
}

/** 休假日 */
const dayOffList = computed(() => props.dayOffList);
const currentMonthOnCalendar = ref(dayjs().format('YYYY/MM'));
/** q-date 篩選 function */
function dateFilter(date: string) {
    const now = dayjs();
    const selectDate = dayjs(date);
    const month = selectDate.format('YYYY/MM');
    if (month !== currentMonthOnCalendar.value) {
        currentMonthOnCalendar.value = month;
    }
    // 如果時間過了，則不能選

    if (selectDate.isBefore(now, 'day')) {
        return false;
    }
    // 休假日不能選
    if (dayOffList.value.includes(date)) {
        return false;
    }
    return true
}


watch(currentMonthOnCalendar, async () => {
    emit('changeMonth', currentMonthOnCalendar.value);
}, { immediate: true })

</script>

<style scoped>

</style>