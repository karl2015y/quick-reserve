<template>
    <div class="p-5">
        <!-- <reserve-calendar
            @select-time-slot-list="handleReserveCalenderList"
            :day-off-list="dayOffList"
            @change-month="handleChangeMonth"
            :reserve-calendar-list-props="reserveCalendarListProps"
            @change-date="handleChangeDate"
        /> -->
        <reserve-calendar-workday v-model="defaultWorkdaySetting" />

        <reserve-calendar-editor
            v-model="workdayMap"
            :default-reserve-table-item="defaultWorkdaySetting.defaultReserveTableItem"
            :workday-list="defaultWorkdaySetting.selectWorkdayList"
        />

        {{ workdayMap }}

    </div>

</template>


<script
    setup
    lang="ts"
>
import { promiseTimeout } from '@vueuse/core';
import ReserveCalendar from '~/components/reserve-calendar/index.vue';
import type { ReserveTableItem, TimeSlot } from '~/components/reserve-calendar/type';
import ReserveCalendarEditor from '~/components/reserve-calendar/reserve-calendar-editor.vue';
import ReserveCalendarWorkday from '~/components/reserve-calendar/reserve-calendar-workday.vue';


// const selectWorkdayList = ref<
//     typeof weekDayList[number]['value'][]
// >([])

// const defaultReserveTableItem = ref<ReserveTableItem>()
const defaultWorkdaySetting = ref<InstanceType<typeof ReserveCalendarWorkday>['$props']['modelValue']>({
    selectWorkdayList: [1, 2, 3, 4, 5],
    defaultReserveTableItem: {
        date: '1970/01/02',
        durationMinutes: 30,
        reservedTimeList: [],
        disableTimeList: [
            {
                start: 100800000,
                end: 104400000
            }
        ],
        startAt: '09:00',
        endAt: '18:00',
        intervalMinutes: 0,
    }
})


// // 休假日
// const dayOffList = ref<string[]>([]);
// async function handleChangeMonth(currentMonthOnCalendar: string) {
//     await promiseTimeout(1000);
//     dayOffList.value = [`${currentMonthOnCalendar}/28`, `${currentMonthOnCalendar}/29`]
// }

// // 時段表
// const reserveCalendarMap = ref<Record<string, ReserveTableItem>>
//     ({
//         '2024/08/27': {
//             date: '2024/08/27',
//             durationMinutes: 30,
//             reservedTimeList: [
//                 {
//                     start: 1724738267000,
//                     end: 1724741867000
//                 }
//             ],
//             disableTimeList: [
//                 {
//                     start: 1724731200000,
//                     end: 1724734800000
//                 }
//             ],
//             startAt: '06:00',
//             endAt: '18:00',
//             intervalMinutes: 0,
//         },
//         '2024/08/30': {
//             date: '2024/08/30',
//             durationMinutes: 35,
//             reservedTimeList: [],
//             disableTimeList: [],
//             startAt: '10:00',
//             endAt: '17:00',
//             intervalMinutes: 5,
//         },
//         '2024/08/31': {
//             date: '2024/08/31',
//             durationMinutes: 50,
//             reservedTimeList: [],
//             disableTimeList: [],
//             startAt: '08:00',
//             endAt: '20:00',
//             intervalMinutes: 10,
//         },
//     });


// // 時段參數
// const reserveCalendarListProps = ref<ReserveTableItem | 'loading'>();
// async function handleChangeDate(date: string) {
//     reserveCalendarListProps.value = 'loading';
//     await promiseTimeout(1000);
//     const item = reserveCalendarMap.value[date];
//     reserveCalendarListProps.value = item;
//     // reserveCalendarListProps.value = {
//     //     date,
//     //     durationMinutes: 30,
//     //     reservedTimeList: [],
//     //     disableTimeList: [],
//     //     startAt: '09:00',
//     //     endAt: '18:00',
//     //     intervalMinutes: 30,
//     // } satisfies Props['reserveCalendarListProps'];

// }



// function handleReserveCalenderList(timeSlotList: TimeSlot[]) {
//     console.log('handleReserveCalenderList', timeSlotList);
// }


/**工作日設定 */
const workdayMap = ref<Record<string, ReserveTableItem | 'dayOff'>>({})


</script>
