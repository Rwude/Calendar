import { Injectable } from '@angular/core';
import {EnumTime, EnumTimeFrame, Period} from "./models";

@Injectable({
  providedIn: 'root'
})
export class TimeFunctionsService {

    constructor() { }

    getTimeFrameLength(period: Period, start: number, utc: boolean, prev: boolean = false) {
        const date = new Date(start)
        let year = utc ? date.getUTCFullYear() : date.getFullYear();
        let month = utc ? date.getUTCMonth() : date.getMonth();
        let time = 0;
        switch (period.timeFrame[1]) {
            case EnumTimeFrame.Hour:
                return EnumTime.Hour * period.timeFrame[0];
            case EnumTimeFrame.Day:
                return EnumTime.Day * period.timeFrame[0];
            case EnumTimeFrame.Week:
                return EnumTime.Day * 7 * period.timeFrame[0];
            case EnumTimeFrame.Month:
                if (prev) month -= period.timeFrame[0];
                for (let idx = 0; idx < period.timeFrame[0]; idx += 1) {
                    time += new Date(year, month + 1, 0).getDate() * EnumTime.Day;
                    if (month < 12) {
                        month += 1;
                    } else {
                        month = 0;
                        year += 1;
                    }
                }
                return time
            case EnumTimeFrame.Year:
                if (prev) year -= period.timeFrame[0];
                for (let idx = 0; idx < period.timeFrame[0]; idx += 1) {
                    time += this.daysOfYear(year) * EnumTime.Day;
                    year += 1
                }
                return time
        }
    }

    daysOfYear(year: number){
        return this.isLeapYear(year) ? 366 : 365;
    }

    isLeapYear(year: number) {
        return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
    }

    getNumberOfMinutes(timeFrame: [number, EnumTimeFrame], start: number, utc: boolean) {
        const startDate = new Date(start);
        const year = utc ? startDate.getUTCFullYear() : startDate.getFullYear();
        const month = utc ? startDate.getUTCMonth() : startDate.getMonth();
        let days: number;
        switch (timeFrame[1]) {
            case EnumTimeFrame.Year:
                days = this.daysOfYear(year);
                break;
            case EnumTimeFrame.Month:
                days = new Date(year, month + 1, 0).getDate();
                break;
            case EnumTimeFrame.Week:
                days = 7
                break;
            case EnumTimeFrame.Day:
                days = 1
                break
            case EnumTimeFrame.Hour:
                return timeFrame[0] * 60;
        }
        return timeFrame[0] * days * 24 * 60;
    }

    getMinutes(timeFrame: number) {
        return Math.floor(timeFrame / 60000);
    }
}
