import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PastOrdersPage } from './past-orders.page';

const routes: Routes = [
  {
    path: '',
    component: PastOrdersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PastOrdersPageRoutingModule {}
