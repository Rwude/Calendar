import {Injectable} from '@angular/core';
import {EnumTime} from "./models";

@Injectable({
  providedIn: 'root'
})
export class TimeFunctionsService {

    constructor() { }

    getTimeFrameLength(timeFrame: [number, EnumTime], start: number, utc: boolean, prev: boolean = false) {
        const date = new Date(start)
        let year = utc ? date.getUTCFullYear() : date.getFullYear();
        let endDate: number;
        switch (timeFrame[1]) {
            case EnumTime.Minute:
                return 60000 * timeFrame[0]
            case EnumTime.Hour:
                return 3600000 * timeFrame[0];
            case EnumTime.Day:
                endDate = new Date(date).setDate(date.getDate() + timeFrame[0])
                return endDate - start;
            case EnumTime.Week:
                endDate = new Date(date).setDate(date.getDate() + 7 * timeFrame[0])
                return endDate - start;
            case EnumTime.Month:
                const nbDays = this.daysOfMonth(start, timeFrame, utc, prev);
                endDate = prev ? new Date(date).setDate(date.getDate() - nbDays) : new Date(date).setDate(date.getDate() + nbDays);
                return endDate - start;
            case EnumTime.Year:
                if (utc) {
                    endDate = prev ? new Date(date).setUTCFullYear(year - timeFrame[0]) : new Date(date).setUTCFullYear(year + timeFrame[0])
                } else {
                    endDate = prev ? new Date(date).setFullYear(year - timeFrame[0]) : new Date(date).setFullYear(year + timeFrame[0])
                }
                return endDate - start;
        }
    }

    daysOfMonth(start: number, timeFrame: [number, EnumTime], utc: boolean, prev: boolean = false) {
        const date = new Date(start)
        let year = utc ? date.getUTCFullYear() : date.getFullYear();
        let month = utc ? date.getUTCMonth() : date.getMonth();
        let nbDays = 0;
        if (prev) month -= timeFrame[0];
        for (let idx = 0; idx < timeFrame[0]; idx += 1) {
            nbDays += new Date(year, month + 1, 0).getDate();
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
        const startDate = new Date(start);
        const year = utc ? startDate.getUTCFullYear() : startDate.getFullYear();
        let days: number;
        switch (timeFrame[1]) {
            case EnumTime.Year:
                let endDate: number;
                if (utc) {
                    endDate = new Date(start).setUTCFullYear(year + timeFrame[0])
                } else {
                    endDate = new Date(start).setFullYear(year + timeFrame[0])
                }
                days = (endDate - start) / 86400000;
                break;
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
        const endDate = new Date(startDate).setDate(startDate.getDate() + days)
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

    getMinutes(timeFrame: number) {
        return Math.floor(timeFrame / 60000);
    }
}
