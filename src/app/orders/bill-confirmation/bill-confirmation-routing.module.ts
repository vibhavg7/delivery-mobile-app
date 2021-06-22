import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BillConfirmationPage } from './bill-confirmation.page';

const routes: Routes = [
  {
    path: '',
    component: BillConfirmationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BillConfirmationPageRoutingModule {}
