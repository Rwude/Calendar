import {Injectable} from '@angular/core';
import {EnumTime} from "./models";

@Injectable({
    providedIn: 'root'
})
export class TimeFunctionsService {

    constructor() { }

    getTimeFrameLength(timeFrame: [number, EnumTime], start: number, utc: boolean, prev: boolean = false) {
        const date = this.getDate(start, utc)
        const year = this.getYear(start, utc);
        let endDate: number;
        switch (timeFrame[1]) {
            case EnumTime.Minute:
                return 60000 * timeFrame[0]
            case EnumTime.Hour:
                return 3600000 * timeFrame[0];
            case EnumTime.Day:
                endDate = this.setDate(start, utc, date + timeFrame[0])
                return endDate - start;
            case EnumTime.Week:
                endDate = this.setDate(start, utc,date + 7 * timeFrame[0])
                return endDate - start;
            case EnumTime.Month: {
                const nbDays = this.daysOfMonth(start, timeFrame, utc, prev);
                endDate = this.setDate(start, utc, prev ? date - nbDays : date + nbDays)
                return endDate - start;
            }
            case EnumTime.Year:
                endDate = this.setYear(start, utc, prev ? year - timeFrame[0] : year + timeFrame[0]);
                return endDate - start;
        }
    }

    daysOfMonth(start: number, timeFrame: [number, EnumTime], utc: boolean, prev: boolean = false) {
        let year = this.getYear(start, utc);
        let month = this.getMonth(start, utc);
        let nbDays = 0;
        if (prev) month -= timeFrame[0];
        for (let idx = 0; idx < timeFrame[0]; idx += 1) {
            nbDays += this.getDate(new Date(year, month + 1, 0).getTime(), utc);
            if (month < 12) {
                month += 1;
            } else {
                month = 0;
                year += 1;
            }
        }

        return nbDays;
    }

    getNumberOfMinutes(timeFrame: [number, EnumTime], start: number, utc: boolean) {
        const year = this.getYear(start, utc);
        let days: number;
        switch (timeFrame[1]) {
            case EnumTime.Year: {
                const endDate = this.setYear(start, utc, year + timeFrame[0]);
                days = (endDate - start) / 86400000;
                break;
            }
            case EnumTime.Month:
                days = this.daysOfMonth(start, timeFrame, utc);
                break;
            case EnumTime.Week:
                days = 7 * timeFrame[0]
                break;
            case EnumTime.Day:
                days = timeFrame[0]
                break
            case EnumTime.Hour:
                return timeFrame[0] * 60;
            case EnumTime.Minute:
                return timeFrame[0]
        }
        const endDate = this.setDate(start, utc, this.getDate(start, utc) + days)
        return (endDate - start) / 60000;
    }

    getMilliseconds(time: EnumTime) {
        switch (time) {
            default:
                return 0;
            case EnumTime.Week:
                return 60480000
            case EnumTime.Day:
                return 8640000;
            case EnumTime.Hour:
                return 360000;
            case EnumTime.Minute:
                return 60000;
        }
    }

    setStart(start: number, startPoint: EnumTime, utc: boolean) {
        switch (startPoint) {
            case EnumTime.Year:
                return this.setMonth(start, utc, 0);
            case EnumTime.Month:
                return this.setDate(start, utc, 1);
            case EnumTime.Day:
                return this.setHour(start, utc, 0);
            case EnumTime.Week: {
                const dayOfWeek = this.getDay(start, utc);
                const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                return this.setDate(start, utc, this.getDate(start, utc) - daysToSubtract);
            }
            default:
                return this.setMinute(start, utc, 0);
        }
    }

    getYear(time: number, utc: boolean) {
        return  utc ? new Date(time).getUTCFullYear() : new Date(time).getFullYear();
    }

    getMonth(time: number, utc: boolean) {
        return  utc ? new Date(time).getUTCMonth() : new Date(time).getMonth();
    }

    getDate(time: number, utc: boolean) {
        return utc ? new Date(time).getUTCDate() : new Date(time).getDate();
    }

    getDay(time: number, utc: boolean) {
        return utc ? new Date(time).getUTCDay() : new Date(time).getDay();
    }

    getHour(time: number, utc: boolean) {
        return utc ? new Date(time).getUTCHours() : new Date(time).getHours();
    }

    getMinute(time: number, utc: boolean) {
        return utc ? new Date(time).getUTCMinutes() : new Date(time).getMinutes();
    }

    setYear(time: number, utc: boolean, value: number) {
        const date = utc ? new Date(time).setUTCFullYear(value, 0, 1) : new Date(time).setFullYear(value, 0, 1);
        return  this.setHour(date, utc, 0);
    }

    setMonth(time: number, utc: boolean, value: number) {
        const date = utc ? new Date(time).setUTCMonth(value, 1) : new Date(time).setMonth(value, 1);
        return  this.setHour(date, utc, 0);
    }

    setDate(time: number, utc: boolean, value: number) {
        const date = utc ? new Date(time).setUTCDate(value) : new Date(time).setDate(value);
        return this.setHour(date, utc, 0);
    }

    setHour(time: number, utc: boolean, value: number) {
        return utc ? new Date(time).setUTCHours(value, 0, 0, 0) : new Date(time).setHours(value, 0, 0, 0);
    }

    setMinute(time: number, utc: boolean, value: number) {
        return utc ? new Date(time).setUTCMinutes(value) : new Date(time).setMinutes(value);
    }

    getMinutes(timeFrame: number) {
        return Math.floor(timeFrame / 60000);
    }
}
