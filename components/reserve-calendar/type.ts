import type { Props } from "./reserve-calendar-list.vue";

/**時間區間 */
export interface TimeSlot {
    /**開始時間 */
    start: number;
    /**結束時間 */
    end: number;
}

/**時段表格式 */
export interface ReservableSlot {
    /**時段 */
    time: TimeSlot;
    /**是否已被預約 */
    reserved: boolean;
    /**是否該時段不能被預約 */
    disable: boolean;
    /**已被選擇 */
    selected: boolean;

}

export type ReserveCalendarProps = Props

/**預約表 */
export interface ReserveTableItem {
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
}