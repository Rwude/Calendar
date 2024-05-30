import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import {EventItem, GridPosition} from "../../models";
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

    @Input() allRows: {row: number, height: number, color: string, personId?: number}[] = [];
    @Input() startEndValue!: {start: number, end: number};
    @Input() totalColumns = 50;
    @Input() columnWidth = 100;
    @Input() minuteWidth = 0;
    @Input() eventItems: EventItem[] = [];

    @Output() cellEvent = new EventEmitter<{type: string, row: number, col: number}>();
    @Output() allRowsChange = new EventEmitter<{row: number, height: number, color: string, personId?: number}[]>();

    gridPositions: GridPosition[] = [];
    dragPosition = {x: 0, y: 0}
    totalHeight!: number;

    constructor(private cdr: ChangeDetectorRef, private timeFunctions: TimeFunctionsService) {
        this.gridPositions = this.eventItems.map((item, idx) => this.getItemPosition(item, idx));
    }

    ngOnChanges(changes:SimpleChanges) {
        this.allRows.forEach(r => r.height = 40);
        const allPersons = this.allRows.map(r => r.personId).filter((value): value is number => value !== undefined);
        this.getCollisions(allPersons)
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

    getItemPosition(eventItem: EventItem, index: number, additionalHeight: number | undefined = undefined) {
        let position: GridPosition = {visible: true};
        let height: number = 0;
        for (let idx = 0; idx < this.allRows.length; idx ++) {
            if (this.allRows[idx].personId === eventItem.personId) {
                if (additionalHeight !== undefined) {
                    position.top = height + additionalHeight;
                    position.additionalHeight = additionalHeight;
                } else {
                    if (this.gridPositions[index]?.additionalHeight !== undefined) {
                        position.top = height + this.gridPositions[index].additionalHeight!;
                        position.additionalHeight = this.gridPositions[index].additionalHeight!
                    }
                }
            } else {
                height += this.allRows[idx].height;
            }
        }
        let diff: number;
        if (eventItem.start < this.startEndValue.start || eventItem.start > this.startEndValue.end) {
            position.left = 0;
        } else if (eventItem.start < this.startEndValue.end) {
            diff = eventItem.start - this.startEndValue.start;
            position.left = this.timeFunctions.getMinutes(diff) * this.minuteWidth;
        }
        if (eventItem.start >= this.startEndValue.start) {
            if (eventItem.end <= this.startEndValue.end) {
                diff = eventItem.end - eventItem.start;
            } else {
                diff = this.startEndValue.end - eventItem.start;
            }
        } else if (eventItem.end <= this.startEndValue.end) {
            diff = eventItem.end - this.startEndValue.start;
        } else {
            diff = this.startEndValue.end - this.startEndValue.start;
        }
        position.width = this.timeFunctions.getMinutes(diff) * this.minuteWidth;
        if (position.width < 0 || position.top === undefined) {
            position.visible = false
        }
        return position
    }

    dragMove(event: CdkDragMove, idx: number) {
        const dragPosition = event.distance;
        const item = this.eventItems[idx];
        const position = this.getItemPosition(item, idx);
        this.gridPositions[idx].top! = this.getHeight(position.top!, dragPosition.y);
        this.gridPositions[idx].left! = position.left! + dragPosition.x;
        this.dragPosition = {x: 0, y: 0}
    }

    dragEnd(event: CdkDragEnd, idx: number) {
        const dragPosition = event.distance;
        const item = this.eventItems[idx];
        const row = this.allRows.findIndex(r => r.personId === item.personId);
        const oldPersonId = item.personId;
        const newPersonId = this.getNewPersonId(dragPosition.y, row);
        if (newPersonId !== undefined) {
            this.eventItems[idx].personId = newPersonId;
            this.eventItems[idx].personId = newPersonId;
            this.getCollisions([oldPersonId, newPersonId]);
        } else {
            const position = this.getItemPosition(item, idx);
            this.gridPositions[idx].top = position.top!;
            this.gridPositions[idx].left = position.left!;
        }

        this.dragPosition = {x: 0, y: 0}
    }

    getCollisions(personIds: number[]) {
        const allChangedRows: {height: number, timeWindow: {start: number, end: number}[], eventItems: number[]}[][]= [];
        for (let id in personIds) {
            const personId = personIds[id];
            const eventItems = this.eventItems.filter(item  => (item.personId === personId) && (this.isInTimeframe(item)));
            const row: {height: number, timeWindow: {start: number, end: number}[], eventItems: number[]}[] = [];
            eventItems.forEach(item => {
                if (row.length === 0) {
                    row.push({height: 0, timeWindow: [{start: item.start, end: item.end}], eventItems: [item.id]});
                } else {
                    const freeRow = row.findIndex(r => {
                        return !r.timeWindow.some(tW => (item.start >= tW.start && item.start <= tW.end) || (item.end >= tW.start && item.end <= tW.end) || (item.start < tW.start && item.end > tW.end))
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
            this.allRows.find(r => r.personId === personId)!.height = newHeight < 40 ? 40 : newHeight;
        }
        this.gridPositions = this.eventItems.map((item, idx) => {
            const includedRow = allChangedRows.find(row => row.some(r => r.eventItems.includes(item.id)))
            if (includedRow) {
                const addedHeight = includedRow.find(r => r.eventItems.includes(item.id))!.height;
                return this.getItemPosition(item, idx, addedHeight);
            } else {
                return this.getItemPosition(item, idx);
            }
        });
        this.allRowsChange.emit(this.allRows);
        this.generateGrid();
    }

    getHeight(oldPosition: number, delta: number) {
        const heightArray: number[] = [];
        let height = 0;
        this.allRows.forEach(r => {
            heightArray.push(height);
            height += r.height;
        });
        for (let idx = 0; idx < heightArray.length; idx ++) {
            if (oldPosition + delta >= heightArray[idx] && oldPosition + delta < heightArray[idx + 1]) return heightArray[idx]
        }
        return heightArray[heightArray.length - 1]
    }

    isInTimeframe(eventItem: EventItem) {
        return (eventItem.start >= this.startEndValue.start && eventItem.start <= this.startEndValue.end) || (eventItem.end >= this.startEndValue.start && eventItem.end <= this.startEndValue.end) || (eventItem.start < this.startEndValue.start && eventItem.end > this.startEndValue.end);
    }

    getNewPersonId(position: number, row: number) {
        const height: number[] = [];
        let oldHeight = 0;
        this.allRows.forEach(r => {
            height.push(oldHeight);
            oldHeight += r.height;
        });
        const newHeight = height[row] + position;
        for (let idx = 0; idx < height.length - 1; idx ++) {
            if(newHeight >= height[idx] && newHeight < height[idx + 1]) return this.allRows[idx].personId
        }
        return this.allRows[height.length - 1].personId
    }

    onCellEvent(type: string, row: number, col: number) {
        this.cellEvent.emit({ type: type, row: row, col: col });
    }
}
