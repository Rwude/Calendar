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
        let time = 0;
        let endDate: number;
        switch (period.timeFrame[1]) {
            case EnumTimeFrame.Hour:
                return EnumTime.Hour * period.timeFrame[0];
            case EnumTimeFrame.Day:
                endDate = new Date(date).setDate(date.getDate() + period.timeFrame[0])
                return endDate - start;
            case EnumTimeFrame.Week:
                endDate = new Date(date).setDate(date.getDate() + 7 * period.timeFrame[0])
                return endDate - start;
            case EnumTimeFrame.Month:
                const nbDays = this.daysOfMonth(start, period.timeFrame, utc, prev);
                endDate = prev ? new Date(date).setDate(date.getDate() - nbDays) : new Date(date).setDate(date.getDate() + nbDays);
                return endDate - start;
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

    daysOfMonth(start: number, timeFrame: [number, EnumTimeFrame], utc: boolean, prev: boolean = false) {
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

    getNumberOfMinutes(timeFrame: [number, EnumTimeFrame], start: number, utc: boolean) {
        const startDate = new Date(start);
        const year = utc ? startDate.getUTCFullYear() : startDate.getFullYear();
        let days: number;
        switch (timeFrame[1]) {
            case EnumTimeFrame.Year:
                days = this.daysOfYear(year);
                break;
            case EnumTimeFrame.Month:
                days = this.daysOfMonth(start, timeFrame, utc);
                break;
            case EnumTimeFrame.Week:
                days = 7 * timeFrame[0]
                break;
            case EnumTimeFrame.Day:
                days = timeFrame[0]
                break
            case EnumTimeFrame.Hour:
                return timeFrame[0] * 60;
        }
        const endDate = new Date(startDate).setDate(startDate.getDate() + days)
        return (endDate - start) / 60000;
    }

    getMinutes(timeFrame: number) {
        return Math.floor(timeFrame / 60000);
    }
}
