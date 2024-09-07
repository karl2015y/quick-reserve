<template>
    <div>
        <!-- {{ timeSlotListForDisplay }} -->
        <q-list
            bordered
            separator
        >
            <q-item
                v-for="(timeSlot, index) in timeSlotListForDisplay"
                :key="timeSlot.start"
                clickable
                v-ripple
                class="select-none"
            >
                <q-item-section>
                    <q-item-label>
                        {{ timeSlot.start }} ~ {{ timeSlot.end }}
                    </q-item-label>
                </q-item-section>
                <q-item-section side>
                    <q-btn
                        icon="delete"
                        dense
                        @click="deleteTimeSlot(index)"
                    />
                </q-item-section>
            </q-item>
            <q-item
                clickable
                v-ripple
                class="select-none"
            >
                <q-item-section>
                    <q-item-label>
                        <q-icon name="add" />
                        新增時段
                    </q-item-label>
                </q-item-section>
                <q-popup-edit
                    ref="timeSlotITemPopupEditDom"
                    v-model="timeSlotITem"
                    title="新增時段"
                    label="新增時段"
                >
                    <template #="scope">
                        <q-form @submit="scope.set()">
                            <div class="flex gap-3 flex-nowrap items-center">
                                <q-input
                                    v-model="scope.value.start"
                                    label="開始時間"
                                    mask="##:##"
                                    outlined
                                    hide-bottom-space
                                    dense
                                    autofocus
                                    :rules="[
                                        (val) => val.length > 0 ? true : '此項目為必填',
                                        timeRule
                                    ]"
                                />
                                <div>~</div>
                                <q-input
                                    v-model="scope.value.end"
                                    label="結束時間"
                                    mask="##:##"
                                    outlined
                                    hide-bottom-space
                                    dense
                                    :rules="[
                                        (val) => val.length > 0 ? true : '此項目為必填',
                                        timeRule
                                    ]"
                                />
                            </div>
                            <div class="w-full p-2 flex justify-end gap-2">
                                <q-btn
                                    label="取消"
                                    type="reset"
                                    color="primary"
                                    outline
                                    @click="resetTimeSlotItem() && scope.cancel()"
                                />
                                <q-btn
                                    label="加入"
                                    type="submit"
                                    color="primary"
                                />

                            </div>
                        </q-form>
                    </template>


                </q-popup-edit>
            </q-item>
        </q-list>

    </div>
</template>

<script
    setup
    lang="ts"
>
import dayjs from 'dayjs';
import type { TimeSlot } from './type';
import { map, pipe, sort } from 'remeda';
import { toNumber } from 'lodash-es';
import type { QPopupEdit } from 'quasar';

export interface Props {
    /** YYYY/MM/DD */
    date: string;
    modelValue: TimeSlot[]
}

const props = withDefaults(defineProps<Props>(), {
});
const emit = defineEmits<{
    (e: 'update:model-value', value: TimeSlot[]): void;
}>();
const { modelValue: timeSlotList } = useVModels(props, emit);


/** 確認是否刪除後，給 index 刪除 timeSlotList 內的值 */
function deleteTimeSlot(index: number) {
    const item = timeSlotListForDisplay.value[index];
    if (!item) return;
    $q.dialog({
        title: '確認刪除',
        message: `確定要刪除此時段（${item.start} ~ ${item.end}）嗎？`,
        ok: '確定',
        cancel: '取消'
    }).onOk(() => {
        timeSlotList.value.splice(index, 1);
    })
}

const $q = useQuasar();

const timeSlotITemPopupEditDom = ref<InstanceType<typeof QPopupEdit>>()

/**用於顯示的 timeSlotList */
const timeSlotListForDisplay = computed(() => pipe(timeSlotList.value,
    sort((a, b) => a.start - b.start),
    map(item => ({
        start: dayjs(item.start).format('HH:mm'),
        end: dayjs(item.end).format('HH:mm')
    }))
));
/** HH:mm to timestamp */
function timeToTimestamp(timeString: string) {
    return dayjs(`${props.date} ${timeString}`).valueOf();
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

const timeSlotITem = ref<{
    start: string;
    end: string;
}>({
    start: '',
    end: ''
});
function resetTimeSlotItem() {
    timeSlotITem.value = {
        start: '',
        end: ''
    }
    return true;
}
watch(timeSlotITem, async (newVal) => {
    console.log("🚀 ~ watch ~ newVal", newVal)
    await nextTick();

    if (!newVal.start || !newVal.end) return;
    const item = {
        start: timeToTimestamp(newVal.start),
        end: timeToTimestamp(newVal.end)
    }

    // 如果時間不合法，就要提醒
    if (item.start >= item.end) {
        $q.notify({
            type: 'negative',
            message: '開始時間需早於結束時間'
        });
        timeSlotITemPopupEditDom.value?.show()
        // resetTimeSlotItem();
        return;
    }

    // 如果時間重複，就要提醒
    if (timeSlotList.value.some(timeSlot => {
        return (timeSlot.start <= item.start && item.start <= timeSlot.end) ||
            (timeSlot.start <= item.end && item.end <= timeSlot.end)
    })) {
        $q.notify({
            type: 'negative',
            message: '時間重疊，無法加入'
        });
        timeSlotITemPopupEditDom.value?.show()
        // resetTimeSlotItem();
        return;
    }

    // 如果沒問題，就加入
    timeSlotList.value.push(item);
    resetTimeSlotItem()
})

</script>

<style scoped>

</style>