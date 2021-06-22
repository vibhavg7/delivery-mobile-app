import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'ordertrack/:state',
    loadChildren: () => import('./order-track/order-track.module').then( m => m.OrderTrackPageModule)
  },
  {
    path: 'orderdetail',
    loadChildren: () => import('./order-detail/order-detail.module').then( m => m.OrderDetailPageModule)
  },
  {
    path: 'billconfirmation/:orderId',
    loadChildren: () => import('./bill-confirmation/bill-confirmation.module').then( m => m.BillConfirmationPageModule)
  },
  {
    path: 'pastorders',
    loadChildren: () => import('./past-orders/past-orders.module').then( m => m.PastOrdersPageModule)
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrdersRoutingModule { }
