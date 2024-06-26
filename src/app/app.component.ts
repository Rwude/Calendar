import {Component} from '@angular/core';
import {Child, EnumTime, EventItem, Group, Period} from "./calendar/models";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
    changePersons: boolean = false;
    periods: Period[] = [
        {
            name: '18 Days',
            timeFrame: [18, EnumTime.Day],
            startPoint: EnumTime.Day,
            headerClickable: true,
            timeFrameHeadersId: {bigHeader: 1, smallHeader: 0},
            timeFramePeriod: [1, EnumTime.Day]
        },
        {
            name: 'Month',
            timeFrame: [1, EnumTime.Month],
            startPoint: EnumTime.Month,
            headerClickable: true,
            timeFrameHeadersId: {bigHeader: 1, smallHeader: 0},
            timeFramePeriod: [1, EnumTime.Day]
        },
        {
            name: 'Year',
            timeFrame: [1, EnumTime.Year],
            startPoint: EnumTime.Year,
            width: 100,
            headerClickable: true,
            timeFrameHeadersId: {bigHeader: 1, smallHeader: 2},
            timeFramePeriod: [1, EnumTime.Week]
        }
    ];
    headerPeriods: Period[] = [
        {
            name: 'Day',
            timeFrame: [1, EnumTime.Day],
            headerClickable: false,
            timeFramePeriod: [1, EnumTime.Hour]
        },
        {
            name: 'Month',
            timeFrame: [1, EnumTime.Month],
            headerClickable: true,
            timeFrameHeadersId: {bigHeader: 1, smallHeader: 0},
            timeFramePeriod: [1, EnumTime.Day]
        },
        {
            name: 'Week',
            timeFrame: [1, EnumTime.Week],
            headerClickable: true,
            timeFrameHeadersId: {bigHeader: 1, smallHeader: 0},
            timeFramePeriod: [1, EnumTime.Day]
        },
    ];
    sections: Group[] = [
        {
            id: 0,
            name: 'Group 1',
            childIds: []
        },
        {
            id: 1,
            name: 'Group 2',
            childIds: []
        },
        {
            id: 2,
            name: 'Group 3',
            childIds: []
        },
        {
            id: 3,
            name: 'Group 4',
            childIds: []
        },
        {
            id: 4,
            name: 'Group 5',
            childIds: []
        }
    ];
    persons: Child[] = [];
    eventItems: EventItem[] = [
        {
            id: 0,
            name: 'Event 1',
            showedName: 'E1',
            start: new Date().setHours(0, 0, 0, 0),
            end: new Date().setHours(0, 0, 0, 0) + 3600000,
            color: 'white',
            backgroundColor: 'blue',
            childId: 2
        },
        {
            id: 1,
            name: 'Event 2',
            showedName: 'E2',
            start: Date.now() + 123456789,
            end: Date.now() + 123456789 + 86400000,
            color: 'black',
            backgroundColor: 'aqua',
            childId: 1
        },
        {
            id: 2,
            name: 'Event 3',
            showedName: 'E3',
            start: Date.now() + 123456789 + 86400000 + 60000 * 2,
            end: Date.now() + 123456789 + 86400000 + 6000000,
            color: 'white',
            backgroundColor: 'black',
            childId: 1
        },
        {
            id: 3,
            name: 'Event 4',
            showedName: 'E4',
            start: Date.now(),
            end: Date.now() + 18000000,
            color: 'white',
            backgroundColor: 'blue',
            childId: 0
        }
    ];

    constructor() {
        for (let idx = 0; idx <= 15; idx += 1) {
            const sectionId = Math.floor(Math.random() * 6) - 1;
            if (sectionId !== -1) this.sections[sectionId].childIds.push(idx)
            this.persons.push({
                id: idx,
                name: 'Child' + (idx + 1).toString(),
                shortName: 'C' + (idx + 1).toString(),
                groupId: sectionId
            })
        }
        const colors: string[] = ['black', 'blue', 'red', 'darkmagenta', 'violet', 'green', 'violet', 'aqua', 'yellow', 'orange'];
        const dragPrecisions: [number, EnumTime][] = [[1, EnumTime.Hour], [30, EnumTime.Minute], [1, EnumTime.Day], [2, EnumTime.Day], [1, EnumTime.Minute]];
        for (let idx = 4; idx <= 100; idx += 1) {
            const personId = Math.floor(Math.random() * 15);
            const colorIndex = Math.floor(Math.random() * 10);
            const backgroundColor = colors[colorIndex];
            const color = colorIndex <= 5 ? 'white' : 'black'
            let start = new Date().setHours(0, 0, 0, 0);
            start += Math.floor(Math.random() * 18) * (3600000 * 24);
            start += (Math.floor(Math.random() * 24) - 12) * 3600000;
            let end = start;
            end += Math.floor(Math.random() * 48) * 3600000;
            const dragPrecision = dragPrecisions[idx % 5]
            const importance: number = (idx + 1) % 5 === 0 ? 0 : 1;
            this.eventItems.push({
                id: idx,
                name: 'Event ' + (idx + 1).toString(),
                showedName: 'E' + (idx + 1).toString(),
                childId: personId,
                color: color,
                backgroundColor: backgroundColor,
                start: start,
                end: end,
                dragPrecision: dragPrecision,
                importance: importance
            });
        }
    }
}
