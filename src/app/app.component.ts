import {Component} from '@angular/core';
import {EnumTime, EnumTimeFrame, EventItem, Period, Person, Section} from "./calendar/models";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  periods: Period[] = [
    {
      name: '18 Days',
      timeFrame: [18, EnumTimeFrame.Day],
      start: new Date().setHours(0,0,0,0),
      headerClickable: true,
      timeFrameHeadersId: {bigHeader: 1, smallHeader: 0},
      timeFramePeriod: [1, EnumTime.Day]
    },
    {
      name: 'Month',
      timeFrame: [1, EnumTimeFrame.Month],
      start: new Date('2024-01-01').getTime(),
      headerClickable: true,
      timeFrameHeadersId: {bigHeader: 1, smallHeader: 0},
      timeFramePeriod: [1, EnumTime.Day]
    },
    {
      name: 'Year',
      timeFrame: [1, EnumTimeFrame.Year],
      start: new Date('2024-01-01').getTime(),
      width: 100,
      headerClickable: true,
      timeFrameHeadersId: {bigHeader: 1, smallHeader: 2},
      timeFramePeriod: [1, EnumTime.Week]
    }
  ];
  headerPeriods: Period[] = [
    {
      name: 'Day',
      timeFrame: [1, EnumTimeFrame.Day],
      headerClickable: false,
      timeFramePeriod: [1, EnumTime.Hour]
    },
    {
      name: 'Month',
      timeFrame: [1, EnumTimeFrame.Month],
      headerClickable: true,
      timeFrameHeadersId: {bigHeader: 1, smallHeader: 0},
      timeFramePeriod: [1, EnumTime.Day]
    },
    {
      name: 'Week',
      timeFrame: [1, EnumTimeFrame.Week],
      headerClickable: true,
      timeFrameHeadersId: {bigHeader: 1, smallHeader: 0},
      timeFramePeriod: [1, EnumTime.Day]
    },
  ];
  sections: Section[] = [
    {
      id: 0,
      name: 'Section 1',
      personIds: []
    },
    {
      id: 1,
      name: 'Section 2',
      personIds: []
    },
    {
      id: 2,
      name: 'Section 3',
      personIds: []
    },
    {
      id: 3,
      name: 'Section 4',
      personIds: []
    },
    {
      id: 4,
      name: 'Section 5',
      personIds: []
    }
  ];
  persons: Person[] = [];
  eventItems: EventItem[] = [
    {
      id: 0,
      name: 'Event 1',
      showedName: 'E1',
      start: Date.now(),
      end: Date.now() + 18000000,
      color: 'white',
      backgroundColor: 'blue',
      personId: 2
    },
    {
      id: 1,
      name: 'Event 2',
      showedName: 'E2',
      start: Date.now() + 123456789,
      end: Date.now() + 123456789 + 86400000,
      color: 'black',
      backgroundColor: 'aqua',
      personId: 1
    },
    {
      id: 2,
      name: 'Event 3',
      showedName: 'E3',
      start: Date.now() + 123456789+ 86400000 + 60000 * 2,
      end: Date.now() + 123456789 + 86400000 + 6000000,
      color: 'white',
      backgroundColor: 'black',
      personId: 1
    },
    {
      id: 3,
      name: 'Event 4',
      showedName: 'E4',
      start: Date.now(),
      end: Date.now() + 18000000,
      color: 'white',
      backgroundColor: 'blue',
      personId: 0
    }
  ];

  constructor() {
    for (let idx = 0; idx <= 15; idx += 1) {
      const sectionId = Math.floor(Math.random() * 6) - 1;
      if (sectionId !== -1) this.sections[sectionId].personIds.push(idx)
      this.persons.push({
        id: idx,
        name: 'Person' + (idx + 1).toString(),
        shortName: 'P' + (idx + 1).toString(),
        sectionId: sectionId
      })
    }
    const colors: string[] = ['black', 'blue', 'red', 'darkmagenta', 'violet', 'green', 'violet', 'aqua', 'yellow', 'orange']
      for (let idx = 4; idx <= 100; idx += 1) {
          const personId = Math.floor(Math.random() * 15);
          const colorIndex = Math.floor(Math.random() * 10);
          const backgroundColor = colors[colorIndex];
          const color = colorIndex <= 5 ? 'white' : 'black'
          let start = new Date().setHours(0,0,0,0);
          start += Math.floor(Math.random() * 14) * EnumTime.Day;
          start += (Math.floor(Math.random() * 24) - 12) * EnumTime.Hour;
          let end = start;
          end += Math.floor(Math.random() * 2) * EnumTime.Day;
          end += (Math.floor(Math.random() * 24) - 12) * EnumTime.Hour;
          this.eventItems.push({
              id: idx,
              name: 'Event' + (idx + 1).toString(),
              showedName: 'E' + (idx + 1).toString(),
              personId: personId,
              color: color,
              backgroundColor: backgroundColor,
              start: start,
              end: end
          });
      }
  }
}
