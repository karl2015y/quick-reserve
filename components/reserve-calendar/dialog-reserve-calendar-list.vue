<template>
    <q-dialog
        ref="dialogRef"
        @hide="onDialogHide"
    >
        <reserve-calendar-list
            v-bind="props"
            @select-time-slot-list="emit('select-time-slot-list', $event)"
            @update:selected-time-slot-list="emit('update:selected-time-slot-list', $event)"
        />
    </q-dialog>
</template>

<script
    setup
    lang="ts"
>
import { useDialogPluginComponent } from 'quasar'
import type { TimeSlot } from './type';
import ReserveCalendarList from './reserve-calendar-list.vue';

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


const emit = defineEmits([
    'update:selected-time-slot-list',
    'select-time-slot-list',
    ...useDialogPluginComponent.emits

]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()


</script>

<style scoped>

</style>