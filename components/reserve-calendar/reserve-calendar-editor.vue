<template>
    <div class="flex flex-col flex-nowrap sm:max-w-2xl w-[290px] sm:w-full">
        <div class="flex flex-nowrap">
            <q-date
                v-model="focusDate"
                flat
                square
                class=" border border-solid  border-gray-300 sm:border-r-0 "
                :events="handleMarkDayOff"
                event-color="orange"
            />
            <div class="h-[400px] overflow-y-auto border border-solid  border-gray-300  flex-1 flex flex-col p-5 flex-nowrap gap-3
            ">
                <q-toggle
                    :model-value="reserveTableItem === 'dayOff'"
                    @update:model-value="value => reserveTableItem = value ? 'dayOff' : genDefaultReserveTableItem(focusDate)"
                    label="休假日"
                />
                <template v-if="reserveTableItem !== 'dayOff' && reserveTableItem">
                    <q-input
                        v-model="reserveTableItem.startAt"
                        label="開始時間"
                        mask="##:##"
                        :rules="[timeRule]"
                        outlined
                        hide-bottom-space
                    />
                    <q-input
                        v-model="reserveTableItem.endAt"
                        label="結束時間"
                        mask="##:##"
                        :rules="[timeRule, endAtRule]"
                        outlined
                        hide-bottom-space
                    />

                    <q-input
                        v-model.number="reserveTableItem.durationMinutes"
                        label="預約時長（分鐘）"
                        hint="每個預約時段的長度"
                        outlined
                        class="mb-2"
                    />
                    <q-input
                        v-model.number="reserveTableItem.intervalMinutes"
                        label="緩衝時間（分鐘）"
                        hint="兩個預約時段的間隔時間"
                        outlined
                    />

                    <!-- <q-input
                    v-model="reserveTableItem.disableTimeList"
                    label="不能預約的時段"
                    hint="休息或是吃飯的時間"
                    outlined
                /> -->
                    不能預約的時段
                    <time-slot-list
                        v-model="reserveTableItem.disableTimeList"
                        :date="reserveTableItem.date"
                    />

                    <br>
                    已被預約的時段
                    <time-slot-list
                        v-model="reserveTableItem.reservedTimeList"
                        :date="reserveTableItem.date"
                    />
                </template>

            </div>
        </div>



    </div>
</template>

<script
    setup
    lang="ts"
>
import { toNumber } from 'lodash-es';
import type { ReserveTableItem } from './type'
import { padZero } from './utile';
import TimeSlotList from './time-slot-list.vue';
import dayjs from 'dayjs';
import { clone, isDeepEqual, omit, pipe } from 'remeda';
export interface Props {
    defaultReserveTableItem: ReserveTableItem,
    workdayList: (1 | 2 | 3 | 4 | 5 | 6 | 7)[],
    modelValue: Record<string, ReserveTableItem | 'dayOff'>
}

const props = withDefaults(defineProps<Props>(), {
});
const emit = defineEmits<{
    (e: 'update:model-value', value: Props['modelValue']): void;
}>();
const { modelValue } = useVModels(props, emit);

/** 休假日 */
const dayOffList = computed(() => {
    const dayList = [1, 2, 3, 4, 5, 6, 7] as const;
    return dayList.filter(day => !props.workdayList.includes(day))
})

function handleMarkDayOff(date: string) {
    const isRecorder = checkTheDateHadRecorded(date);
    if ( isRecorder ) {
        if(modelValue.value[date] === 'dayOff'){
            return true
        }else{
            return false
        }
    }

    const day = pipe(dayjs(date).day(), day => day === 0 ? 7 : day) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
    if (dayOffList.value.includes(day)) {
        return true
    }
    return false
}

/**限制 HH:mm */
function timeRule(timeString: string) {
    const [HH, mm] = timeString.split(':').map(item => toNumber(item));
    if (HH < 0 || HH >= 24) {
        return '小時不能超過23'
    }
    if (mm < 0 || mm >= 60) {
        return '分鐘不能超過59'
    }
    if (HH === 24 && mm !== 0) {
        return '請輸入正確的分鐘'
    }
    return true
}
/**限制結束時間
 * 結束時間不能早於開始時間
 * 開始時間扣結束時間不能小於區間時間
 */
function endAtRule(endAt: string) {
    if (reserveTableItem.value === 'dayOff' || !reserveTableItem.value) {
        return true
    }
    const [startHH, startMM] = reserveTableItem.value.startAt.split(':').map(item => toNumber(item));
    const [endHH, endMM] = endAt.split(':').map(item => toNumber(item));
    const durationMinutes = reserveTableItem.value.durationMinutes;
    const text = `結束時間不能早於開始時間 ${padZero(startHH)}:${padZero(startMM)}`
    if (endHH < startHH) {
        return text
    }
    if (endHH === startHH && endMM < startMM) {
        return text
    }
    if (endHH === startHH && endMM === startMM) {
        return '結束時間不能等於開始時間'
    }
    if (endHH === startHH && (endMM - startMM) < durationMinutes) {
        return `區間時間不能小於${durationMinutes}分鐘`
    }
    return true
}

const focusDate = ref<string>()

const reserveTableItem = computed({
    get() {
        if (!focusDate.value) return undefined;
        return modelValue.value[focusDate.value] ?? clone(props.defaultReserveTableItem)
    },
    set(newValue) {
        if (focusDate.value && newValue) {
            modelValue.value[focusDate.value] = clone(newValue)
        }
    }
})
watch(focusDate, (newDate) => {
    if (!newDate) return;
    // // 確認是不是休假日
    // if (
    //     dayOffList.value.includes(dayjs(newDate).day() + 1 as any)
    // ) {
    //     reserveTableItem.value = 'dayOff'

    // }


    // 選了新的日期且新的日期沒有被記錄過
    if (!checkTheDateHadRecorded(newDate)) {
        reserveTableItem.value = genDefaultReserveTableItem(newDate)
    }
    clearModelValue()
}, {
    immediate: true
})

/**將 modelValue 中 key 不是 focusDate 且 value裡除了date 的值跟 props.defaultReserveTableItem 一樣的刪除 */
function clearModelValue() {
    for (const key in modelValue.value) {
        if (key !== focusDate.value) {
            const item = modelValue.value[key];
            // if (item && JSON.stringify(item) === JSON.stringify(props.defaultReserveTableItem)) {
            //     delete modelValue.value[key]
            // }
            if (item !== 'dayOff') {
                if (isDeepEqual(omit(item, ['date']), omit(props.defaultReserveTableItem, ['date']))) {
                    delete modelValue.value[key]
                }
            }

        }
    }
}


function genDefaultReserveTableItem(date?: string) {
    if (!date) return undefined;
    const result = clone(props.defaultReserveTableItem);
    result.date = date;
    return result
}
function checkTheDateHadRecorded(date: string) {
    return modelValue.value[date] !== undefined
}

</script>

<style scoped>

</style>