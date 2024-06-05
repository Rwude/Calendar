import {Component, ElementRef, EventEmitter, Input, OnChanges, Output, ViewChild} from '@angular/core';
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
    @Input() changePersons: boolean = true;
    @Input() groups: Group[] = [];
    @Input() utc: boolean = false;

    @Output() cellEvent = new EventEmitter<{type: string, row: number, col: number}>();
    @Output() allRowsChange = new EventEmitter<{row: number, height: number, color: string, childId?: number, groupId?: number}[]>();

    gridPositions: GridPosition[] = [];
    groupPositions: GroupPosition[][] = [];
    dragPosition = {x: 0, y: 0}
    totalHeight!: number;

    constructor(private timeFunctions: TimeFunctionsService) {
    }

    ngOnChanges() {
        this.allRows.forEach(r => r.height = 40);
        const allPersons = this.allRows.map(r => r.childId).filter((value): value is number => value !== undefined);
        const allGroups = this.groups.map(g => g.id);
        this.updateItems(allPersons, allGroups);
        if (this.dynamicGrid) this.generateGrid();
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

    getItemPosition(eventItem: EventItem, index: number, itemIndex: number, zIndex: number, pseudoTimeframe: number, additionalHeight: number | undefined = undefined) {
        let position: GridPosition = {eventIndex: itemIndex, visible: true};
        let height: number = 0;
        for (let idx = 0; idx < this.allRows.length; idx ++) {
            if (this.allRows[idx].childId === eventItem.childId) {
                if (additionalHeight !== undefined) {
                    position.top = height + additionalHeight;
                    position.additionalHeight = additionalHeight;
                } else {
                    if (this.gridPositions[index]?.additionalHeight !== undefined) {
                        position.top = height + this.gridPositions[index].additionalHeight!;
                        position.additionalHeight = this.gridPositions[index].additionalHeight!;
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
            position.left = this.timeFunctions.getMinutes(diff) * this.minuteWidth;
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
        position.width = this.timeFunctions.getMinutes(diff) * this.minuteWidth;
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
            const minutes = Math.round(dragPosition.x / this.minuteWidth);
            const dragPrecisionInMinutes = this.timeFunctions.getNumberOfMinutes(item.dragPrecision, item.start, this.utc);
            const nbOfDrags = Math.round(minutes / dragPrecisionInMinutes);
            pseudoTimeframe = nbOfDrags * this.timeFunctions.getTimeFrameLength(item.dragPrecision, item.start, this.utc);
            this.gridPositions[idx].pseudoStart = item.start + pseudoTimeframe;
            this.gridPositions[idx].pseudoEnd = item.end + pseudoTimeframe;
        }

        const position = this.getItemPosition(item, idx, this.gridPositions[idx].eventIndex, 1, pseudoTimeframe);
        this.gridPositions[idx].width = position.width;
        const {height} = this.getHeightAndId(position.top!, dragPosition.y,);
        if (this.changePersons) this.gridPositions[idx].top! = height;
        this.gridPositions[idx].left! = position.left!;
        this.gridPositions[idx].zIndex = position.zIndex;
        this.calculatePseudoPosition(idx)
        this.dragPosition = {x: 0, y: 0}
    }

    dragEnd(event: CdkDragEnd, idx: number) {
        const dragPosition = event.distance;
        const item = this.eventItems[idx];
        const position = this.getItemPosition(item, idx, this.gridPositions[idx].eventIndex, 0, 0);
        const oldChildId = item.childId;
        const {childId} = this.getHeightAndId(position.top!, dragPosition.y);
        if (item.dragPrecision) {
            const minutes = Math.round(dragPosition.x / this.minuteWidth);
            const dragPrecisionInMinutes =  this.timeFunctions.getNumberOfMinutes(item.dragPrecision, item.start, this.utc);
            const nbOfDrags = Math.round(minutes / dragPrecisionInMinutes);
            const timeFrameLength = this.timeFunctions.getTimeFrameLength(item.dragPrecision, item.start, this.utc);
            this.eventItems[idx].start += nbOfDrags * timeFrameLength
            this.eventItems[idx].end += nbOfDrags * timeFrameLength;
        }
        if (childId !== undefined) {
            if (this.changePersons) this.eventItems[idx].childId = childId;
            const groupIds = this.groups.filter(g => g.childIds.includes(oldChildId) || g.childIds.includes(childId)).map(g => g.id);
            this.updateItems([oldChildId, childId], groupIds);
            this.generateGrid();
        } else {
            const groupIds = this.groups.filter(g => g.childIds.includes(oldChildId)).map(g => g.id);
            this.updateItems([oldChildId], groupIds);
            this.generateGrid();
        }
        this.gridPositions[idx].zIndex = position.zIndex;
        this.gridPositions[idx].pseudoStart = undefined;
        this.gridPositions[idx].pseudoEnd = undefined;

        this.dragPosition = {x: 0, y: 0}
    }

    updateItems(allChilds: number[], allGroups: number[]) {
        const allChangedChildRows = this.getCollisions(allChilds);
        const allChangedGroupRows =  this.getGroupLoad(allGroups);

        let height: number = 0;
        let additionalHeight: number = 0;
        for (let idx = 0; idx < this.allRows.length; idx ++) {
            if (this.allRows[idx].groupId !== undefined) {
                const groupId = this.allRows[idx].groupId!;
                if (allGroups.includes(groupId)) {
                    this.groupPositions[groupId] = []
                    const row = allChangedGroupRows.find(r => r.groupId === groupId)!;
                    this.setGroupItemPositions(groupId, row.rows, height);
                    const oldHeight =  this.allRows[idx].height;
                    let newHeight = row.rows.length > 0 ? row.rows[row.rows.length - 1].height + 10 : 0;
                    newHeight = newHeight < 40 ? 40 : newHeight
                    this.allRows[idx].height = newHeight;
                    additionalHeight += newHeight - oldHeight;
                } else {
                    this.groupPositions[groupId].forEach(gP => {
                        gP.top! += additionalHeight;
                    });
                }
            } else if (this.allRows[idx].childId !== undefined) {
                const childId = this.allRows[idx].childId!;
                if (allChilds.includes(childId)) {
                    const row = allChangedChildRows.find(r => r.childId === childId)!;
                    const oldHeight = this.allRows[idx].height;
                    let newHeight = row.rows.length > 0 ? row.rows[row.rows.length - 1].height + 30 : 0;
                    newHeight = newHeight < 40 ? 40 : newHeight;
                    this.allRows[idx].height = newHeight;
                    additionalHeight += newHeight - oldHeight;
                }
            }
            height += this.allRows[idx].height;
        }

        let idx = 0;
        this.eventItems.forEach((item, index) => {
            const row = allChangedChildRows.find(row => row.childId === item.childId);
            if (row) {
                const includedRow = row.rows.find(row => row.eventItems.includes(item.id));
                if (includedRow) {
                    const addedHeight = includedRow!.height;
                    this.gridPositions[idx] = this.getItemPosition(item, idx, index, 0, 0, addedHeight);
                }
            } else {
                this.gridPositions[idx] = this.getItemPosition(item, idx, index, 0, 0);
            }
            if (this.isInTimeframe(item)) {
                this.calculatePseudoPosition(idx)
                idx += 1;
            } else {
                this.gridPositions.splice(idx, 1)
            }

        });
        this.allRowsChange.emit(this.allRows);
    }

    getCollisions(childIds: number[]) {
        const allChangedRows: {childId: number, rows: {height: number, timeWindow: {start: number, end: number}[], eventItems: number[]}[]}[]= [];
        for (let id in childIds) {
            const childId = childIds[id];
            let eventItems = this.eventItems.filter(item  => (item.childId === childId) && (this.isInTimeframe(item)));
            eventItems.sort((a,b) => {
                if (a.importance === undefined && b.importance === undefined) {
                    return 0;
                }
                if (a.importance === undefined) {
                    return 1;
                }
                if (b.importance === undefined) {
                    return -1;
                }
                return a.importance - b.importance;
            });
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
            allChangedRows.push({childId: childId, rows: row});
        }
        return allChangedRows;
    }

    getGroupLoad(groupIds: number[]) {
        const allrows: {groupId: number, rows: {height: number, timeWindow: {start: number, end: number}[], color: string}[]}[] = [];
        for (let idx = 0; idx < groupIds.length; idx += 1) {
            const groupId = groupIds[idx]
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
            allrows.push({groupId: groupId, rows: row});
        }
        return allrows;
    }

    setGroupItemPositions(groupId: number, rows: {height: number, timeWindow: {start: number, end: number}[], color: string}[], height: number){
        rows.forEach(r => {
            const timeframeHeight = height + r.height;
            r.timeWindow.forEach(tW => {
                const start = tW.start;
                const end = tW.end;
                let diff: number;
                let left: number = 0;
                if (start < this.startEndValue.start || start > this.startEndValue.end) {
                    left = 0;
                } else if (start < this.startEndValue.end) {
                    diff = start - this.startEndValue.start;
                    left = Math.round(this.timeFunctions.getMinutes(diff) * this.minuteWidth);
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
                const width = Math.round(this.timeFunctions.getMinutes(diff) * this.minuteWidth);
                this.groupPositions[groupId].push({top: timeframeHeight, left: left, width: width, color: r.color})
            });
        });
    }

    getChildEventsPerGroup(groupId: number) {
        return this.eventItems.filter(item => this.groups[groupId].childIds.includes(item.childId) && this.isInTimeframe(item));
    }

    isInTimeframe(eventItem: EventItem) {
        return (eventItem.start >= this.startEndValue.start && eventItem.start < this.startEndValue.end) || (eventItem.end >= this.startEndValue.start && eventItem.end < this.startEndValue.end) || (eventItem.start < this.startEndValue.start && eventItem.end >= this.startEndValue.end);
    }

    calculatePseudoPosition(idx: number) {
        const left = this.gridPositions[idx].left!;
        const width = this.gridPositions[idx].width!;
        const top = this.gridPositions[idx].top!;
        if (left + width / 2 - 85 <= 5) {
            this.gridPositions[idx].pseudoLeft = 90 - left;
        } else if (left + width / 2 + 90 >= this.totalColumns * this.columnWidth) {
            const diff = left + 90 - this.totalColumns * this.columnWidth;
            this.gridPositions[idx].pseudoLeft = - diff;
        } else {
            this.gridPositions[idx].pseudoLeft = width / 2;
        }
        if (top + 135 >= this.totalHeight) {
            this.gridPositions[idx].pseudoTop = - 121
        } else {
            this.gridPositions[idx].pseudoTop = 20
        }
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
