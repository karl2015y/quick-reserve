import dayjs from "dayjs";
import type { ReservableSlot, ReserveCalendarProps, TimeSlot } from "./type";
import { padStart } from "lodash-es";
import { clone } from "remeda";

/**補0 */
export function padZero(num: number) {
    return padStart(num.toString(), 2, '0')
}

/** HH:mm 進位 
 * @example
 * 22:60 -> 23:00
 * 24:00 -> 00:00
 * 22:70 -> 23:10
 * 26:80 -> 03:20
 * 24:10 -> 00:10
 */
function carryTime(time: string) {
    const [hour, minute] = time.split(':').map(Number);
    const carryHour = Math.floor(minute / 60);
    const newHour = (hour + carryHour) % 24;
    const newMinute = minute % 60;
    return `${padZero(newHour)}:${padZero(newMinute)}`
}

/** HH:mm 轉換成 mm */
function timeToMinute(time: string) {
    const [hour, minute] = time.split(':').map(Number);
    return hour * 60 + minute;
}

/** TimeRange 轉換成 HH:mm ~ HH:mm */
export function timeRangeToString(time: TimeSlot, includeDate = false) {
    const dateFormate = includeDate ? 'YYYY/MM/DD HH:mm' : 'HH:mm';
    const startDay = dayjs(time.start).format('YYYY/MM/DD');
    const endDay = dayjs(time.end).format('YYYY/MM/DD');
    if (startDay !== endDay) {
        return `${dayjs(time.start).format(dateFormate)} ~ ${dayjs(time.end).format(dateFormate)}`
    }
    return `${dayjs(time.start).format(dateFormate)} ~ ${dayjs(time.end).format('HH:mm')}`
}


/**判斷該區間是否被佔用(已預約或是不顯示) */
export function isCanReserve(slot: TimeSlot, timeSlotList: TimeSlot[]) {
    return !timeSlotList.some((timeSlot) => {
        return (
            // 例如：可預約時間區間 09:00 ~ 09:30，已預約時間區間 09:15 ~ 09:45
            // 09:00 < 09:45 && 09:30 > 09:15
            // 例如：可預約時間區間 09:00 ~ 09:40，已預約時間區間 09:10 ~ 09:30
            // 09:00 < 09:30 && 09:40 > 09:10
            // 意指：可預約時間區間的開始時間小於已預約時間區間的結束時間，且可預約時間區間的結束時間大於已預約時間區間的開始時間
            slot.start < timeSlot.end && slot.end > timeSlot.start
        );
    });
}

/**初始化時段表 */
export function initTimeTable(config: ReserveCalendarProps) {
    const startAt = timeToMinute(config.startAt);
    const endAt = timeToMinute(config.endAt);
    const timeTable: ReservableSlot[] = []

    for (let i = startAt; i < endAt; i += config.durationMinutes) {
        if (timeTable.length > 0) {
            // 間隔時間
            i += config.intervalMinutes;
        }
        const startTime = `${carryTime('00:' + padZero(i))}`;
        const endTime = `${carryTime('00:' + padZero(i + config.durationMinutes))}`;
        const time: TimeSlot = {
            start: dayjs(`${config.date} ${startTime}`).valueOf(),
            end: dayjs(`${config.date} ${endTime}`).valueOf()
        }
        const reserved = !isCanReserve(time, config.reservedTimeList) // 不能被預約，意指已被預
        const disable = !isCanReserve(time, config.disableTimeList) // 不能被預約，意指已被關閉
        const selected = !isCanReserve(time, config.selectedTimeSlotList)

        if (timeToMinute(startTime) > endAt) continue;
        timeTable.push({
            time,
            reserved,
            disable,
            selected
        })

    }
    return timeTable
    // timeTable.value = updateReservedSlots(props.reserved, timeTable.value)
}



