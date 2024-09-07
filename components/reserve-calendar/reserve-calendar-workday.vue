<template>
    <div class="p-3">
        每週的工作日
        <div class="q-gutter-sm">
            <template
                v-for="dayItem in weekDayList"
                :key="dayItem.value"
            >
                <q-checkbox
                    v-model="modelValue.selectWorkdayList"
                    :val="dayItem.value"
                    :label="dayItem.label"
                    color="teal"
                />
            </template>

        </div>
        預設工作日排程
        <div class=" overflow-y-auto border border-solid  border-gray-300  flex-1 p-5  
        grid sm:grid-cols-2  gap-4
            ">
            <q-input
                v-model="modelValue.defaultReserveTableItem.startAt"
                label="開始時間"
                mask="##:##"
                :rules="[timeRule]"
                outlined
                hide-bottom-space
                class="basis-1/2"
            />
            <q-input
                v-model="modelValue.defaultReserveTableItem.endAt"
                label="結束時間"
                mask="##:##"
                :rules="[timeRule, endAtRule]"
                outlined
                hide-bottom-space
            />

            <q-input
                v-model.number="modelValue.defaultReserveTableItem.durationMinutes"
                label="預約時長（分鐘）"
                hint="每個預約時段的長度"
                outlined
                class="mb-2"
            />
            <q-input
                v-model.number="modelValue.defaultReserveTableItem.intervalMinutes"
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
            <div> 不能預約的時段
                <time-slot-list
                    v-model="modelValue.defaultReserveTableItem.disableTimeList"
                    :date="modelValue.defaultReserveTableItem.date"
                />
            </div>

            <br>


        </div>

    </div>
</template>

<script
    setup
    lang="ts"
>
import type { ReserveTableItem, TimeSlot } from './type';
import TimeSlotList from './time-slot-list.vue';
import { padZero } from './utile';
import { toNumber } from 'lodash-es';

const weekDayList = [
    {
        value: 7,
        label: '週日'
    }, {
        value: 1,
        label: '週一'
    }, {
        value: 2,
        label: '週二'
    }, {
        value: 3,
        label: '週三'
    }, {
        value: 4,
        label: '週四'
    }, {
        value: 5,
        label: '週五'
    }, {
        value: 6,
        label: '週六'
    }] as const
// const selectWorkdayList = ref<
//     typeof weekDayList[number]['value'][]
// >([])

// const defaultReserveTableItem = ref<ReserveTableItem>({
//     date: '1970/01/02',
//     durationMinutes: 30,
//     reservedTimeList: [],
//     disableTimeList: [
//         {
//             start: 100800000,
//             end: 104400000
//         }
//     ],
//     startAt: '09:00',
//     endAt: '18:00',
//     intervalMinutes: 0,
// })

export interface Props {
    modelValue: {
        defaultReserveTableItem: ReserveTableItem,
        selectWorkdayList: typeof weekDayList[number]['value'][]
    }
}

const props = withDefaults(defineProps<Props>(), {

});
const emit = defineEmits<{
    (e: 'update:model-value', value: Props['modelValue']): void;
}>();
const { modelValue } = useVModels(props, emit);




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
    const [startHH, startMM] = modelValue.value.defaultReserveTableItem.startAt.split(':').map(item => toNumber(item));
    const [endHH, endMM] = endAt.split(':').map(item => toNumber(item));
    const durationMinutes = modelValue.value.defaultReserveTableItem.durationMinutes;
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



</script>

<style scoped>

</style>