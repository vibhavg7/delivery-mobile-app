import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OrderService } from '../orders/order.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  Plugins,
  PushNotification,
  PushNotificationToken,
  PushNotificationActionPerformed
} from '@capacitor/core';
import { Platform } from '@ionic/angular';

const { PushNotifications, Modals } = Plugins;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {

  deliveryid: number;
  subscription: Subscription;
  isLoading = false;
  newordercount = 0;
  runningordercount = 0;
  deliveredordercount = 0;
  searchCriteriaForm: FormGroup;
  totalDailyOrders = 0;
  totalDailyEarning = 0;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private changeDetector: ChangeDetectorRef,
    private platform: Platform,
    public orderService: OrderService
  ) {
    this.searchCriteriaForm = this.formBuilder.group({
      searchCriteria: ['']
    });
  }

  public async ngOnInit(): Promise<void> {
    await this.onEnter();
  }

  public async onEnter(): Promise<void> {
    this.subscription = this.orderService.ordersCount$.subscribe((message: any) => {
      // tslint:disable-next-line:no-string-literal
      this.newordercount = message['new_order_count'];
      this.changeDetector.detectChanges();
    });
  }

  ionViewWillEnter() {
    this.platform.backButton.subscribeWithPriority(0, () => {
      // tslint:disable-next-line:no-string-literal
      navigator['app'].exitApp();
    });
    this.fetchOrdersCount();
  }

  doRefresh(event) {
    console.log('Begin async operation');
    this.fetchOrdersCount();
    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 2000);
  }

  onChanges() {
  }

  fetchOrdersCount() {
    this.isLoading = true;
    this.deliveryid = +JSON.parse(localStorage.getItem('deliveryid'));
    this.orderService.fetchDeliveryPersonOrdersCount(this.deliveryid).subscribe((data) => {
      this.isLoading = false;
      console.log(data);
      this.newordercount = data.new_order_count[0].new_order_count;
      this.runningordercount = data.running_order_count[0].running_order_count;
      this.deliveredordercount = data.delivered_order_count[0].delivered_order_count;
      this.totalDailyOrders = data.total_delivered_order_count[0].total_order_count;
      this.totalDailyEarning = this.totalDailyOrders * 8;
    });
  }

  newOrder() {
    if (this.newordercount > 0) {
      this.router.navigate(['/orders/ordertrack/1']);
      // this.router.navigate(['/orders/ordertrack'], { queryParams: { state: 'new' } });
    }
  }

  pendingOrder() {
    if (this.runningordercount > 0) {
      this.router.navigate(['/orders/ordertrack/2']);
      // this.router.navigate(['/orders/ordertrack'], { queryParams: { state: 'running' } });
    }
  }

  delieveredOrder() {
    if (this.deliveredordercount > 0) {
      this.router.navigate(['/orders/ordertrack/4']);
      // this.router.navigate(['/orders/ordertrack'], { queryParams: { state: 'delivered' } });
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
