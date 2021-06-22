import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrderTrackPageRoutingModule } from './order-track-routing.module';

import { OrderTrackPage } from './order-track.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    OrderTrackPageRoutingModule
  ],
  declarations: [OrderTrackPage]
})
export class OrderTrackPageModule {}
