import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import {
    BigTimeFrameHeader, Child,
    EnumTime, EventItem, Group,
    Period,
    SmallTimeFrameHeader,
    TimeFrameHeader,
    TreeData
} from "../models";
import {TimeFunctionsService} from "../time-functions.service";

@Component({
  selector: 'cern-time-scheduler',
  templateUrl: './time-scheduler.component.html',
  styleUrls: ['./time-scheduler.component.scss']
})
export class TimeSchedulerComponent implements OnInit, AfterViewInit, OnDestroy{
    @ViewChild('calendarContent') calendarContent!: ElementRef<HTMLDivElement>;
    @ViewChild('scrollMain') scrollMain!: ElementRef<HTMLDivElement>;
    @ViewChild('scrollHorizontal') scrollHorizontal!: ElementRef<HTMLDivElement>;

    @Input() persons!: Child[];
    @Input() groups: Group[] = [];
    @Input() periods!: Period[];
    @Input() hiddenPeriods: Period[] = [];
    @Input() eventItems: EventItem[] = [];
    @Input() utc: boolean = false;
    @Input() changePersons: boolean = true;
    @Input() dayShort: string[] = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    @Input() monthShort: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    timeFrameHeaders?: TimeFrameHeader;
    start: number | undefined = undefined;
    currentPeriod?: Period;
    showPersons: boolean = true;
    numberRows: number = 0;
    currentMinute: number = 0;
    rowsData: {row: number, height: number, color: string, childId?: number, groupId?: number}[] = [];
    calendarWidth: number = 0;
    cellWidth: number = 0;
    minuteWidth: number = 0;
    maxHeight: number = 0;
    currentPosition: [number, number] | undefined = undefined;
    startAndEnd: {start: number, end: number} = {start: 0, end: 0};

    private resizeObserver!: ResizeObserver;
    private intervalId: any;

    treeData: TreeData[]  = [];


    constructor(
        private cdr: ChangeDetectorRef,
        private timeFunctions: TimeFunctionsService
        ) {
    }

    ngOnInit() {
        this.currentPeriod = this.periods[0];
        this.start = this.currentPeriod.start;
        this.startAndEnd = {start: this.start!, end: this.start! + this.timeFunctions.getTimeFrameLength(this.currentPeriod.timeFrame, this.start!, this.utc)}
        this.treeData = this.getTreeData();
        this.numberRows = this.getVisibleTreeData();
        this.rowsData = this.getRowsData();
        this.timeFrameHeaders = this.getTimeFrameHeaders(this.currentPeriod);
        this.startFiveMinuteInterval();
    }

    startFiveMinuteInterval(): void {
        this.performAction()
        this.intervalId = setInterval(() => {
            this.performAction();
        }, 1000);
    }

    performAction(): void {
        const currentTime = new Date();
        const minute = currentTime.setSeconds(0, 0);
        const diffFromStart = minute - this.start!;
        this.currentMinute = diffFromStart / 60000;
    }

    ngAfterViewInit() {
        this.setupResizeObserver();
        this.calculateWidth(this.calendarContent.nativeElement.clientWidth);
        this.maxHeight = this.calendarContent.nativeElement.clientHeight + this.calendarContent.nativeElement.scrollTop;
        this.calendarContent.nativeElement.addEventListener('scroll', () => {
            this.hoverCorrectTreeNode()
            this.scrollHorizontal.nativeElement.scrollTop = this.calendarContent.nativeElement.scrollTop;
            this.calendarContent.nativeElement.scrollTop = this.scrollHorizontal.nativeElement.scrollTop;
            this.maxHeight = this.calendarContent.nativeElement.clientHeight + this.calendarContent.nativeElement.scrollTop;
        });
        this.calendarContent.nativeElement.addEventListener('mousemove', (event) => {
            let y = event.clientY - this.calendarContent.nativeElement.offsetTop;
            y -= this.timeFrameHeaders!.bigHeader.length !== 0 ? 80 : 40;
            const x = event.clientX - this.scrollHorizontal.nativeElement.clientWidth;
            this.currentPosition = [x, y]
            this.hoverCorrectTreeNode()
        });
        this.calendarContent.nativeElement.addEventListener('mouseleave', () => {
            this.currentPosition = undefined;
            this.hoverCorrectTreeNode()
        });
        this.maxHeight = this.calendarContent.nativeElement.clientHeight - this.calendarContent.nativeElement.scrollTop;
    }

    ngOnDestroy() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    getTreeData() {
        const treeData: TreeData[] = [];
        this.groups.forEach(g => {
            let children: TreeData[] = [];
            g.childIds.forEach(id => {
                const person = this.persons.find(p => p.id === id)
                children.push({name: person!.name, isChild: true, shortName: person!.shortName, id: person!.id, hovered: false, height: 40})
            });
            treeData.push({name: g.name, isChild: false, id: g.id, hovered: false, showChildren: true, children: children, height: 40});
        });
        this.persons.filter(p => p.groupId === -1).forEach(p => {
            treeData.push({name: p.name, isChild: true, shortName: p.shortName, id: p!.id, hovered: false, height: 40});
        });
        return treeData;
    }

    getVisibleTreeData() {
        let count = 0;
        this.treeData.forEach(t => {
            count += 1;
            if (t.children && t.showChildren) {
                count += t.children.length
            }
        });
        return count;
    }

    getRowsData() {
        const rowsData: {row: number, height: number, color: string, childId?: number, groupId?: number}[] = [];
        this.treeData.forEach((t, idx) => {
            const color = t.isChild ? 'white' : 'lightgrey'; // todo: custom theming
            const childId = t.isChild ? t.id : undefined;
            const sectionId = t.isChild ? undefined : t.id
            rowsData.push({row: idx, color: color, height: t.height, childId: childId, groupId: sectionId});
            if (t.children && t.showChildren) {
                t.children.forEach(c => {
                    const color = c.isChild ? 'white' : 'lightgrey'; // todo: custom theming
                    rowsData.push({row: idx, color: color, height: c.height, childId: c.id});
                })
            }
        });
        return rowsData;
    }
    setupResizeObserver() {
        this.resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                if (entry.contentRect) {
                    const newWidth = entry.contentRect.width;
                    this.onContainerResize(newWidth);
                }
            }
        });

        if (this.calendarContent) {
            this.resizeObserver.observe(this.calendarContent.nativeElement);
        }
    }

    onContainerResize(newWidth: number) {
        this.calculateWidth(newWidth);
        this.cdr.detectChanges();
    }

    calculateWidth(containerWidth: number) {
        if (this.currentPeriod?.width) {
            this.calendarWidth = this.timeFrameHeaders!.smallHeader.length * this.currentPeriod.width;
            this.minuteWidth = this.calendarWidth / this.timeFunctions.getNumberOfMinutes(this.currentPeriod!.timeFrame, this.start!, this.utc);
            this.cellWidth =  this.currentPeriod.width;
        } else {
            this.calendarWidth = containerWidth;
            this.minuteWidth = containerWidth / this.timeFunctions.getNumberOfMinutes(this.currentPeriod!.timeFrame, this.start!, this.utc);
            this.cellWidth = containerWidth / this.timeFrameHeaders!.smallHeader.length;
        }
        this.cdr.detectChanges();
    }

    getTimeFrameHeaders(period: Period) {
        const start = this.start ? this.start : Date.now();
        const timeFrame = this.timeFunctions.getTimeFrameLength(period.timeFrame, this.start!, this.utc);
        const end = start + timeFrame;
        let currentTime = start;
        const bigHeaders: BigTimeFrameHeader[] = [];
        const smallHeaders: SmallTimeFrameHeader[] = []
        while (currentTime < end) {
            const {bigHeaderInfo, smallHeaderInfo} = this.getTimeInfo(currentTime, period.timeFrame, period.timeFramePeriod[1]);
            let bigHeader: BigTimeFrameHeader | undefined;
            if (bigHeaderInfo !== undefined) {
                bigHeader = bigHeaders.find(h => h.name === bigHeaderInfo);
                if (bigHeader) {
                    bigHeader.smallHeaderIds.push(smallHeaders.length)
                } else {
                    const date = new Date(currentTime).setDate(1);
                    bigHeaders.push({
                        id: bigHeaders.length,
                        name: bigHeaderInfo,
                        start: new Date(date).setHours(0, 0,0,0),
                        smallHeaderIds: [smallHeaders.length]
                    })
                }
            }
            const smallHeader: SmallTimeFrameHeader = {
                id: smallHeaders.length,
                name: smallHeaderInfo,
                start: currentTime,
                bigHeaderId: bigHeader ? bigHeader.id : -1,
                hovered: false
            }
            smallHeaders.push(smallHeader);
            currentTime += this.timeFunctions.getTimeFrameLength(period.timeFramePeriod, currentTime, this.utc);
        }
        const timeFrameHeader: TimeFrameHeader = {bigHeader: bigHeaders, smallHeader: smallHeaders}
        return timeFrameHeader
    }

    getTimeInfo(time: number, bigHeaderFormat: [number, EnumTime], smallHeaderFormat: EnumTime): {bigHeaderInfo: string | undefined, smallHeaderInfo: string} {
        let currentTimeSplit: any[];
        const timeDate = new Date(time);
        if (this.utc) {
            currentTimeSplit = [timeDate.getUTCFullYear(), timeDate.getUTCMonth(), timeDate.getUTCDate(), timeDate.getUTCHours(), timeDate.getUTCMinutes().toString().padStart(2, '0')];
        } else {
            currentTimeSplit = [timeDate.getFullYear(), timeDate.getMonth(), timeDate.getDate(), timeDate.getHours(), timeDate.getMinutes().toString().padStart(2, '0')];
        }
        const day = this.utc? this.dayShort[timeDate.getUTCDay()] : this.dayShort[timeDate.getDay()];
        let bigHeaderInfo: string | undefined;
        let smallHeaderInfo: string;
        switch(bigHeaderFormat[1]) {
            case EnumTime.Hour:
                bigHeaderInfo = undefined;
                break;
            case EnumTime.Day:
                bigHeaderInfo = bigHeaderFormat[0] > 1 ? this.monthShort[currentTimeSplit[1]] : undefined;
                break;
            case EnumTime.Week:
                bigHeaderInfo = this.monthShort[currentTimeSplit[1]];
                break;
            case EnumTime.Month:
                bigHeaderInfo = undefined;
                break;
            case EnumTime.Year:
                bigHeaderInfo = this.monthShort[currentTimeSplit[1]];
        }
        switch (smallHeaderFormat) {
            case EnumTime.Week:
                smallHeaderInfo = day + ' ' + currentTimeSplit[2];
                break;
            case EnumTime.Day:
                smallHeaderInfo = day + ' ' + currentTimeSplit[2];
                break;
            default :
                smallHeaderInfo = `${currentTimeSplit[3]}:${currentTimeSplit[4]}`;
                break;
        }
        return {bigHeaderInfo: bigHeaderInfo, smallHeaderInfo: smallHeaderInfo}
    }

    toggleSidebar() {
        this.showPersons = !this.showPersons;
    }

    toggleSection(name: string) {
        const index = this.treeData.findIndex(t => t.name === name);
        this.treeData[index].showChildren = !this.treeData[index].showChildren;
        this.numberRows = this.getVisibleTreeData();
        this.rowsData = this.getRowsData();
    }

    hoverCorrectTreeNode() {
        if (this.currentPosition) {
            const x = this.currentPosition[0];
            const y = this.currentPosition[1];
            const col = Math.floor((x + this.calendarContent.nativeElement.scrollLeft) / this.cellWidth);
            this.timeFrameHeaders?.smallHeader.forEach((s, idx) => {
                s.hovered = idx === col && y >= 0;
            });
            let height = -this.calendarContent.nativeElement.scrollTop;
            let found = false;
            this.treeData.forEach(t => {
                height += t.height;
                if (height >= y && !found && y >= 0) {
                    t.hovered = true;
                    found = true;
                } else {
                    t.hovered = false;
                }
                if (t.children && t.showChildren) {
                    t.children?.forEach(child => {
                        height += child.height
                        if (height >= y && !found && y >= 0) {
                            child.hovered = true;
                            found = true;
                        } else {
                            child.hovered = false;
                        }
                    })
                }
            });
        } else {
            this.timeFrameHeaders?.smallHeader.forEach(s => s.hovered = false);
            this.treeData.forEach(t => {
                t.hovered = false;
                if (t.children && t.showChildren) {
                    t.children?.forEach(child => {
                        child.hovered = false;
                    });
                }
            });
        }
    }

    changeTimeFrame(event: {start: number, end: number}) {
        this.start = event.start;
        this.startAndEnd = {start: event.start, end: event.end};
        this.timeFrameHeaders = this.getTimeFrameHeaders(this.currentPeriod!);
        this.calculateWidth(this.calendarContent.nativeElement.clientWidth);
        this.cdr.detectChanges();
    }

    changePeriod(event: {periodIdx: number}) {
        this.currentPeriod = this.periods[event.periodIdx];
        this.start = this.currentPeriod.start;
        this.startAndEnd = {start: this.start!, end: this.start! + this.timeFunctions.getTimeFrameLength(this.currentPeriod!.timeFrame, this.start!, this.utc)};
        this.timeFrameHeaders = this.getTimeFrameHeaders(this.currentPeriod);
        this.calendarContent.nativeElement.style.width = 'auto';
        this.calculateWidth(this.calendarContent.nativeElement.clientWidth);
        this.performAction()
    }

    onCellClicked(event: { row: number, col: number }) {
        let i = 0;
        this.treeData.forEach(t => {
            if (i === event.row) {
                console.log(this.eventItems.filter(i => i.childId === t.id && t.isChild));
            }
            i += 1;
            if (t.children && t.showChildren) {
                t.children?.forEach(child => {
                    if (i === event.row) {
                        console.log(this.eventItems.filter(i => i.childId === child.id && child.isChild));
                    }
                    i += 1;
                })
            }
        })
    }

    onAllRowsChange(event: {row: number, height: number, color: string, personId?: number}[]) {
        let index = 0;
        this.treeData.forEach(t => {
            t.height = event[index].height;
            index += 1;
            if (t.children && t.showChildren) {
                t.children.forEach(c => {
                    c.height = event[index].height;
                    index += 1;
                })
            }
        });
    }

    headerClicked(start: number, bigHeader: boolean) {
        const index = bigHeader ? this.currentPeriod?.timeFrameHeadersId?.bigHeader : this.currentPeriod?.timeFrameHeadersId?.smallHeader;
        if (index !== undefined) {
            this.currentPeriod = this.hiddenPeriods[index];
            this.start = start;
        }
        this.startAndEnd = {start: this.start!, end: this.start! + this.timeFunctions.getTimeFrameLength(this.currentPeriod!.timeFrame, this.start!, this.utc)};
        this.timeFrameHeaders = this.getTimeFrameHeaders(this.currentPeriod!);
        this.calendarContent.nativeElement.style.width = 'auto';
        this.calculateWidth(this.calendarContent.nativeElement.clientWidth);
        this.performAction()

    }
}
