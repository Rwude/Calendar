import { NgModule } from '@angular/core';
import {MatIconModule} from "@angular/material/icon";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatButtonModule} from "@angular/material/button";
import {CdkDrag} from "@angular/cdk/drag-drop";



@NgModule({
    declarations: [],
    imports: [
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatSidenavModule,
        MatButtonToggleModule,
        MatButtonModule,
        MatIconModule,
        CdkDrag,
    ],
    exports: [
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatSidenavModule,
        MatButtonToggleModule,
        MatButtonModule,
        MatIconModule,
        CdkDrag,
    ]
})
export class MaterialModule { }
