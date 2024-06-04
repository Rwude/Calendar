import {
    ComponentRef,
    Directive,
    ElementRef, HostListener,
    Input, ViewContainerRef
} from '@angular/core';
import {EventItem} from "../models";
import {CalendarTooltipComponent} from "./calendar-tooltip.component";

@Directive({
  selector: '[calendarTooltip]'
})
export class CalendarTooltipDirective {

    @Input() eventItem?: EventItem;
    @Input() placement?: string;
    @Input() delay?: number;
    @Input() left: number = 0;
    @Input() top: number = 0;

    private tooltip?: ComponentRef<CalendarTooltipComponent>;
    offset = 10;

    constructor(
        private elementRef: ElementRef,
        private viewContainerRef: ViewContainerRef
    ){
    }

    @HostListener('mouseenter')
    onMouseEnter(){
        if (!this.tooltip) {
            this.show();
        }
    }

    @HostListener('mouseleave')
    onMouseLeave(){
        if (this.tooltip) {
            this.hide();
        }
    }

    show() {
        const tooltipRef = this.viewContainerRef.createComponent(CalendarTooltipComponent);
        this.tooltip = tooltipRef;
        tooltipRef.instance.eventItem = this.eventItem;
        tooltipRef.instance.left = this.left!;
        tooltipRef.instance.top = this.top!;
    }

    hide() {
        this.tooltip!.destroy();
        this.tooltip = undefined;
    }



}
