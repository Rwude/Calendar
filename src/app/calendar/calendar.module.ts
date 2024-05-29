import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TimeSchedulerComponent} from "./time-scheduler/time-scheduler.component";
import {MaterialModule} from "./material.module";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {GridComponent} from "./time-scheduler/grid/grid.component";
import {CalendarHeaderComponent} from "./calendar-header/calendar-header.component";
import {GridItemComponent} from "./time-scheduler/grid/grid-item/grid-item.component";
import {FormsModule} from "@angular/forms";

@NgModule({
  declarations: [
      TimeSchedulerComponent,
      GridComponent,
      GridItemComponent,
      CalendarHeaderComponent
  ],
    imports: [
        CommonModule,
        BrowserAnimationsModule,
        MaterialModule,
        FormsModule,
    ],
  exports: [
      TimeSchedulerComponent,
      GridComponent,
      GridItemComponent,
      CalendarHeaderComponent
  ]
})
export class CalendarModule { }
