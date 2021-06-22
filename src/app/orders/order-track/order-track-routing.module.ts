import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrderTrackPage } from './order-track.page';

const routes: Routes = [
  {
    path: '',
    component: OrderTrackPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderTrackPageRoutingModule {}
