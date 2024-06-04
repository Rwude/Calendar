import {NgModule} from '@angular/core';
import {AppComponent} from "./app.component";
import {CalendarModule} from "./calendar/calendar.module";
import {BrowserModule} from "@angular/platform-browser";
import {MatButtonToggle} from "@angular/material/button-toggle";
import {MatSlideToggle} from "@angular/material/slide-toggle";

@NgModule({
  declarations: [AppComponent],
    imports: [
        BrowserModule,
        CalendarModule,
        MatButtonToggle,
        MatSlideToggle,
    ],
  bootstrap: [AppComponent]
})
export class AppModule { }
