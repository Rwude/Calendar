import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    ViewChild
} from '@angular/core';
import {EventItem, GridPosition, Group, GroupPosition} from "../../models";
import {TimeFunctionsService} from "../../time-functions.service";
import {CdkDragEnd, CdkDragMove} from "@angular/cdk/drag-drop";

@Component({
  selector: 'calendar-grid',
  templateUrl: './grid.component.html',
  styleUrl: './grid.component.scss'
})
export class GridComponent implements OnChanges {
    @ViewChild('dynamicGrid') dynamicGrid!: ElementRef<SVGElement>;
    @ViewChild('container', { static: false }) container!: ElementRef;

    @Input() allRows: {row: number, height: number, color: string, childId?: number, groupId?: number}[] = [];
    @Input() startEndValue!: {start: number, end: number};
    @Input() totalColumns = 50;
    @Input() columnWidth = 100;
    @Input() minuteWidth = 0;
    @Input() eventItems: EventItem[] = [];
    @Input() groups: Group[] = [];

    @Output() cellEvent = new EventEmitter<{type: string, row: number, col: number}>();
    @Output() allRowsChange = new EventEmitter<{row: number, height: number, color: string, childId?: number, groupId?: number}[]>();

    gridPositions: GridPosition[] = [];
    groupPositions: GroupPosition[][] = [];
    dragPosition = {x: 0, y: 0}
    totalHeight!: number;

    constructor(private timeFunctions: TimeFunctionsService) {
        this.gridPositions = this.eventItems.map((item, idx) => this.getItemPosition(item, idx, 0, 0));
    }

    ngOnChanges() {
        this.allRows.forEach(r => r.height = 40);
        const allPersons = this.allRows.map(r => r.childId).filter((value): value is number => value !== undefined);
        this.getCollisions(allPersons);
        this.groupPositions = Array.from({ length: this.groups.length }, () => []);
        const allGroups = this.groups.map(g => g.id);
        this.getGroupItems(allGroups);
        this.generateGrid();
    }

    calculateTotalHeight() {
        let totalHeight = 0;
        for (let row = 0; row < this.allRows.length; row++) {
            const rowHeight = this.allRows[row].height;
            totalHeight += rowHeight;
        }
        this.dynamicGrid.nativeElement.setAttribute('height', (totalHeight).toString());
        return totalHeight;
    }

    generateGrid() {
        const svg = this.dynamicGrid.nativeElement;
        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }
        let currentY = 0;
        this.totalHeight = this.calculateTotalHeight();
        let totalHeight = this.totalHeight;
        this.dynamicGrid.nativeElement.setAttribute('height', (totalHeight).toString());

        for (let row = 0; row < this.allRows.length; row++) {
            const rowHeight = this.allRows[row].height;
            const color = this.allRows[row].color;

            let currentX = 0;
            for (let col = 0; col < this.totalColumns; col++) {
                const columnWidth = this.columnWidth;

                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', currentX.toString());
                rect.setAttribute('y', currentY.toString());
                rect.setAttribute('width', columnWidth.toString());
                rect.setAttribute('height', rowHeight.toString());
                rect.addEventListener('click', () => this.onCellEvent('click', row, col));
                rect.addEventListener('mouseenter', () => this.onCellEvent('hover', row, col));
                rect.addEventListener('mouseleave', () => this.onCellEvent('leave', row, col));
                rect.setAttribute('fill', color);
                rect.setAttribute('stroke', 'gray'); // todo: custom theming
                rect.setAttribute('stroke-width', '1');
                svg.appendChild(rect);

                currentX += columnWidth;
            }
            currentY += rowHeight;
        }
    }

    getItemPosition(eventItem: EventItem, index: number, zIndex: number, pseudoTimeframe: number, additionalHeight: number | undefined = undefined) {
        let position: GridPosition = {visible: true};
        let height: number = 0;
        for (let idx = 0; idx < this.allRows.length; idx ++) {
            if (this.allRows[idx].childId === eventItem.childId) {
                if (additionalHeight !== undefined) {
                    position.top = height + additionalHeight;
                    position.additionalHeight = additionalHeight;
                } else {
                    if (this.gridPositions[index]?.additionalHeight !== undefined) {
                        position.top = height + this.gridPositions[index].additionalHeight!;
                        position.additionalHeight = this.gridPositions[index].additionalHeight!
                    } else {
                        position.top = height;
                        position.additionalHeight = 0;
                    }
                }
            } else {
                height += this.allRows[idx].height;
            }
        }
        const start = eventItem.start + pseudoTimeframe;
        const end = eventItem.end + pseudoTimeframe;
        let diff: number;
        if (start < this.startEndValue.start || start > this.startEndValue.end) {
            position.left = 0;
        } else if (start < this.startEndValue.end) {
            diff = start - this.startEndValue.start;
            position.left = Math.floor(this.timeFunctions.getMinutes(diff) * this.minuteWidth);
        }
        if (start >= this.startEndValue.start) {
            if (end <= this.startEndValue.end) {
                diff = end - start;
            } else {
                diff = this.startEndValue.end - start;
            }
        } else if (end <= this.startEndValue.end) {
            diff = end - this.startEndValue.start;
        } else {
            diff = this.startEndValue.end - this.startEndValue.start;
        }
        position.width = Math.floor(this.timeFunctions.getMinutes(diff) * this.minuteWidth);
        if (position.width <= 0 || position.top === undefined) {
            position.visible = false
        }
        position.zIndex = zIndex;
        return position
    }

    dragMove(event: CdkDragMove, idx: number) {
        const dragPosition = event.distance;
        const item = this.eventItems[idx];
        let pseudoTimeframe: number;
        if (!item.dragPrecision) {
            pseudoTimeframe = 0
        } else {
            const minutes = Math.floor(dragPosition.x / this.minuteWidth);
            const dragPrecisionInMinutes = this.timeFunctions.getMinutes(item.dragPrecision[0] * item.dragPrecision[1]);
            const nbOfDrags = Math.floor(minutes / dragPrecisionInMinutes);
            pseudoTimeframe = nbOfDrags * item.dragPrecision[0] * item.dragPrecision[1]
        }

        const position = this.getItemPosition(item, idx,10, pseudoTimeframe);
        this.gridPositions[idx].width = position.width;
        const {height} = this.getHeightAndId(position.top!, dragPosition.y,);
        this.gridPositions[idx].top! = height;
        this.gridPositions[idx].left! = position.left!;
        this.gridPositions[idx].zIndex = position.zIndex;
        this.dragPosition = {x: 0, y: 0}
    }

    dragEnd(event: CdkDragEnd, idx: number) {
        const dragPosition = event.distance;
        const item = this.eventItems[idx];
        const position = this.getItemPosition(item, idx, 0, 0);
        const oldChildId = item.childId;
        const {childId} = this.getHeightAndId(position.top!, dragPosition.y);
        if (childId !== undefined) {
            this.eventItems[idx].childId = childId;
            this.gridPositions[idx].zIndex = position.zIndex;
            if (item.dragPrecision) {
                const minutes = Math.floor(dragPosition.x / this.minuteWidth);
                const dragPrecisionInMinutes = this.timeFunctions.getMinutes(item.dragPrecision[0] * item.dragPrecision[1]);
                const nbOfDrags = Math.floor(minutes / dragPrecisionInMinutes);
                this.eventItems[idx].start += nbOfDrags * (item.dragPrecision[0] * item.dragPrecision[1]);
                this.eventItems[idx].end += nbOfDrags * (item.dragPrecision[0] * item.dragPrecision[1]);
            }
            this.getCollisions([oldChildId, childId]);
            const groupIds = this.groups.filter(g => g.childIds.includes(oldChildId) || g.childIds.includes(childId)).map(g => g.id);
            this.getGroupItems(groupIds);
            this.generateGrid();
        } else {
            this.gridPositions[idx].top = position.top!;
            this.gridPositions[idx].left = position.left!;
            this.gridPositions[idx].zIndex = position.zIndex;
        }

        this.dragPosition = {x: 0, y: 0}
    }

    getCollisions(personIds: number[]) {
        const allChangedRows: {height: number, timeWindow: {start: number, end: number}[], eventItems: number[]}[][]= [];
        for (let id in personIds) {
            const personId = personIds[id];
            const eventItems = this.eventItems.filter(item  => (item.childId === personId) && (this.isInTimeframe(item)));
            const row: {height: number, timeWindow: {start: number, end: number}[], eventItems: number[]}[] = [];
            eventItems.forEach(item => {
                if (row.length === 0) {
                    row.push({height: 0, timeWindow: [{start: item.start, end: item.end}], eventItems: [item.id]});
                } else {
                    const freeRow = row.findIndex(r => {
                        return !r.timeWindow.some(tW => (item.start >= tW.start && item.start < tW.end) || (item.end > tW.start && item.end <= tW.end) || (item.start < tW.start && item.end > tW.end))
                    });
                    if (freeRow !== -1) {
                        row[freeRow].timeWindow.push({start: item.start, end: item.end});
                        row[freeRow].eventItems.push(item.id)
                    } else {
                        const height = row[row.length - 1].height + 20;
                        row.push({height: height, timeWindow: [{start: item.start, end: item.end}], eventItems: [item.id]});
                    }
                }
            });
            allChangedRows.push(row);
            const newHeight = row.length > 0 ? row[row.length - 1].height + 30 : 0;
            this.allRows.find(r => r.childId === personId)!.height = newHeight < 40 ? 40 : newHeight;
        }
        this.gridPositions = this.eventItems.map((item, idx) => {
            const includedRow = allChangedRows.find(row => row.some(r => r.eventItems.includes(item.id)))
            if (includedRow) {
                const addedHeight = includedRow.find(r => r.eventItems.includes(item.id))!.height;
                return this.getItemPosition(item, idx, 0, 0, addedHeight);
            } else {
                return this.getItemPosition(item, idx, 0, 0);
            }
        });
        this.allRowsChange.emit(this.allRows);
    }

    isInTimeframe(eventItem: EventItem) {
        return (eventItem.start >= this.startEndValue.start && eventItem.start < this.startEndValue.end) || (eventItem.end >= this.startEndValue.start && eventItem.end < this.startEndValue.end) || (eventItem.start < this.startEndValue.start && eventItem.end >= this.startEndValue.end);
    }

    getGroupItems(groupIds: number[]) {
        for (let id in groupIds) {
            const groupId = groupIds[id];
            this.groupPositions[groupId] = []
            let height: number = 0;
            let initialHeight: number = 0;
            for (let idx = 0; idx < this.allRows.length; idx ++) {
                if (this.allRows[idx].groupId === groupId) {
                    initialHeight = height;
                } else {
                    height += this.allRows[idx].height;
                }
            }
            const rows = this.getGroupLoad(groupId);
            rows.forEach(r => {
                const timeframeHeight = initialHeight + r.height;
                r.timeWindow.forEach(tW => {
                    const start = tW.start;
                    const end = tW.end;
                    let diff: number;
                    let left: number = 0;
                    if (start < this.startEndValue.start || start > this.startEndValue.end) {
                        left = 0;
                    } else if (start < this.startEndValue.end) {
                        diff = start - this.startEndValue.start;
                        left = Math.floor(this.timeFunctions.getMinutes(diff) * this.minuteWidth);
                    }
                    if (start >= this.startEndValue.start) {
                        if (end <= this.startEndValue.end) {
                            diff = end - start;
                        } else {
                            diff = this.startEndValue.end - start;
                        }
                    } else if (end <= this.startEndValue.end) {
                        diff = end - this.startEndValue.start;
                    } else {
                        diff = this.startEndValue.end - this.startEndValue.start;
                    }
                    const width = Math.floor(this.timeFunctions.getMinutes(diff) * this.minuteWidth);
                    this.groupPositions[groupId].push({top: timeframeHeight, left: left, width: width, color: r.color})
                });
            });
            const oldHeight =  this.allRows.find(r => r.groupId === groupId)!.height;
            const newHeight = rows.length > 0 ? rows[rows.length - 1].height + 10 : 0;
            this.allRows.find(r => r.groupId === groupId)!.height = newHeight < 40 ? 40 : newHeight;
            this.gridPositions.forEach(gP => {
                if (gP.top! > initialHeight && newHeight > 40) {
                    gP.top! += newHeight - oldHeight;
                }
            });
        }
        this.allRowsChange.emit(this.allRows);
    }

    getGroupLoad(groupId: number) {
        const eventItems = this.getChildEventsPerGroup(groupId).sort((a, b) => {
            const aColor = a.backgroundColor ? a.backgroundColor : 'black';
            const bColor = b.backgroundColor ? b.backgroundColor : 'black';
            if (  aColor < bColor) {
                return -1;
            } else if (aColor > bColor) {
                return 1;
            } else {
                return 0;
            }
        });
        const row: {height: number, timeWindow: {start: number, end: number}[], color: string}[] = [];
        eventItems.forEach(item => {
            const color = item.backgroundColor ? item.backgroundColor : 'black';
            if (row.length === 0) {
                row.push({height: 0, timeWindow: [{start: item.start, end: item.end}], color: color});
            } else {
                const rowIndex = row.findIndex(row => row.color === color);
                if (rowIndex !== -1) {
                    const timeframes = row[rowIndex].timeWindow.filter(tW => (tW.start <= item.start && tW.end > item.start) || (tW.start <= item.end && tW.end > item.end) || (tW.start > item.start && tW.end <= item.end));
                    if (timeframes.length === 0) {
                        row[rowIndex].timeWindow.push({start: item.start, end: item.end});
                    } else if (timeframes.length === 1) {
                        const index = row[rowIndex].timeWindow.findIndex(tW => tW.start === timeframes[0].start && tW.end === timeframes[0].end);
                        row[rowIndex].timeWindow[index].start = Math.min(timeframes[0].start, item.start);
                        row[rowIndex].timeWindow[index].end = Math.max(timeframes[0].end, item.end);
                    } else {
                        const index1 = row[rowIndex].timeWindow.findIndex(tW => tW.start === timeframes[0].start && tW.end === timeframes[0].end);
                        const index2 = row[rowIndex].timeWindow.findIndex(tW => tW.start === timeframes[1].start && tW.end === timeframes[1].end);
                        row[rowIndex].timeWindow.splice(Math.max(index1, index2), 1);
                        row[rowIndex].timeWindow.splice(Math.min(index1, index2), 1);
                        const start = Math.min(timeframes[0].start, timeframes[1].start, item.start);
                        const end = Math.max(timeframes[0].end, timeframes[1].end, item.end);
                        row[rowIndex].timeWindow.push({start: start, end: end});
                    }
                } else {
                    row.push({height: row[row.length - 1].height + 5, timeWindow: [{start: item.start, end: item.end}], color: color})
                }
            }
        });
        return row;
    }

    getChildEventsPerGroup(groupId: number) {
        return this.eventItems.filter(item => this.groups[groupId].childIds.includes(item.childId) && this.isInTimeframe(item));
    }

    getHeightAndId(oldPosition: number, delta: number) {
        const heightArray: number[] = [];
        let height = 0;
        this.allRows.forEach(r => {
            heightArray.push(height);
            height += r.height;
        });
        for (let idx = 0; idx < heightArray.length; idx ++) {
            if (oldPosition + delta >= heightArray[idx] && oldPosition + delta < heightArray[idx + 1]) {
                return {childId: this.allRows[idx].childId, height: heightArray[idx]}
            }
        }
        return {childId: this.allRows[heightArray.length - 1].childId, height: heightArray[heightArray.length - 1]}
    }

    onCellEvent(type: string, row: number, col: number) {
        this.cellEvent.emit({ type: type, row: row, col: col });
    }
}
