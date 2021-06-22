import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../order.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NavController, ToastController, Platform, IonInfiniteScroll, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-order-track',
  templateUrl: './order-track.page.html',
  styleUrls: ['./order-track.page.scss'],
})
export class OrderTrackPage implements OnInit {

  orders: any = [];
  // newordertotalcount: number;
  orderscount: any;
  orderType: any;
  ordercurrentstatus: any;
  deliverypersonid: number;
  isLoading: boolean;
  searchCriteriaForm: FormGroup;
  offset: any;
  totalPages: number;
  storeOrders: any = [];
  currentPage = 1;
  pageSize = 10;
  storeordertotalcount: any;
  @ViewChild(IonInfiniteScroll, { static: false }) infiniteScroll: IonInfiniteScroll;
  constructor(private activatedRoute: ActivatedRoute,
              private navCtrl: NavController,
              private toastCtrl: ToastController,
              private alertController: AlertController,
              private router: Router,
              private platform: Platform,
              private formBuilder: FormBuilder,
              private orderService: OrderService) {
    this.searchCriteriaForm = this.formBuilder.group({
      searchCriteria: ['']
    });
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((data: any) => {
      if (!data.has('state')) {
        this.navCtrl.navigateBack('/home');
        return;
      }
      this.orderType = +data.get('state');
      this.deliverypersonid = +JSON.parse(localStorage.getItem('deliveryid'));
    });
  }

  backToHome() {
    this.navCtrl.navigateRoot(['/home']);
  }

  ionViewWillEnter() {
    this.platform.backButton.subscribeWithPriority(0, () => {
      this.navCtrl.navigateRoot(['/home']);
    });

    this.offset = new Date().getTimezoneOffset().toString();
    this.currentPage = 1;
    this.orders = [];
    // this.infiniteScroll.disabled = false;
    this.loadOrders();
  }

  loadOrders(event?) {
    this.isLoading = true;
    if (this.orderType === 1) {
      this.fetchAllNewOrders(event);
    } else if (this.orderType === 2) {
      this.fetchAllRunningOrders(event);
    } else if (this.orderType === 4) {
      this.fetchAllDeliveredOrders(event);
    }
  }

  fetchAllNewOrders(event?) {
    this.orderService.fetchAllNewOrders(this.currentPage, this.pageSize).subscribe((data) => {
      // console.log(data);
      this.isLoading = false;
      this.orders = this.orders.concat(data.new_orders_info);
      this.orderscount = data.new_order_count[0].new_orders_count;
      this.totalPages = Math.ceil(this.orderscount / this.pageSize);
      if (event) {
        event.target.complete();
      }
    });
  }

  fetchAllRunningOrders(event?) {
    this.orderService.fetchAllRunningOrders(this.deliverypersonid, this.currentPage, this.pageSize).subscribe((data) => {
      // console.log(data);
      this.isLoading = false;
      // this.orderscount = data.runningorders.length;
      // this.orders = data.runningorders;
      // this.ordercurrentstatus = this.orders[0].order_current_status;
      // console.log(this.orders);
      this.orders = this.orders.concat(data.ongoing_orders_info);
      this.orderscount = data.ongoing_order_count[0].ongoing_orders_count;
      this.totalPages = Math.ceil(this.orderscount / this.pageSize);
      if (event) {
        event.target.complete();
      }
    });
  }

  async pendingBilling(orderid) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Edit Customer Order?',
      message: 'Do you want to Edit Customer <strong>Order</strong>?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            this.orderService.updateOrderStatus(+orderid, +this.deliverypersonid, 10, 6)
              .subscribe((data: any) => {
                console.log(data);
                if (data.status === 200) {
                  this.navCtrl.navigateRoot([`/home`]);
                  this.presentToast('Order is on the way marked successfully');
                }
              });
          }
        }, {
          text: 'Yes',
          handler: () => {
            console.log('Confirm Okay');
            this.navCtrl.navigateForward([`/orders/billconfirmation/${orderid}`]);
          }
        }
      ]
    });
    await alert.present();
  }

  fetchAllDeliveredOrders(event?) {
    this.orderService.fetchAllDeliveredOrders(this.deliverypersonid, this.currentPage, this.pageSize).subscribe((data) => {
      // console.log(data);
      this.isLoading = false;
      this.orders = this.orders.concat(data.delivered_orders_info);
      this.orderscount = data.delivered_order_count[0].delivered_orders_count;
      this.totalPages = Math.ceil(this.orderscount / this.pageSize);
      if (event) {
        event.target.complete();
      }
      // this.orderscount = data.deliveredorders.length;
      // this.orders = data.deliveredorders;
    });
  }

  pickItems(orderid) {
    if (this.orderType !== 1 && this.orderType !== 4) {
      this.router.navigate(['/orders/orderdetail'], { queryParams: { orderid, state: this.orderType } });
    }
  }

  // deliveredOrderDetail(orderid, orderdeliverypersonstatus) {
  //   if (this.orderType !== 'new') {
  //     this.router.navigate(['/orders/orderdetail'], { queryParams: { orderid, state: this.orderType } });
  //   }
  // }

  openMap(lat, lng) {
    const url = 'https://maps.google.com/?q=' + lat + ',' + lng;
    window.open(url);
  }

  updateOrderStatus(orderid, orderstatus, deliverypersonstatus) {
    this.presentAlertConfirm(orderid, orderstatus, deliverypersonstatus);
  }

  itemsRequested(orderid) { }

  onChanges() {
  }

  callOrdersAPI(status) {
    // this.ordertype = status;
    // this.orderService.fetchAllDeOrders(this.storeId, this.currentPage, this.pageSize, '', status).subscribe((data: any) => {
    //   this.isLoading = false;
    //   console.log(data);
    //   this.storeordertotalcount = data.store_order_count[0].store_orders_count;
    //   this.storeOrders = data.store_orders_info;
    // });
  }

  loadMore(event) {
    this.currentPage++;
    this.loadOrders(event);
    if (this.currentPage === this.totalPages) {
      event.target.disabled = true;
    }
  }

  async presentToast(msg) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 1500, position: 'bottom' });

    toast.present();
  }

  ionViewWillLeave() {
    if (this.infiniteScroll !== undefined) {
      this.infiniteScroll.disabled = false;
      this.infiniteScroll.position = 'bottom';
    }
    // this.infiniteScroll.position = 'bottom';
    // this.infiniteScroll.disabled = false;
  }

  async presentAlertConfirm(orderid, orderstatus, deliverypersonstatus) {
    let msg = '';
    if (+orderstatus === 3) {
      msg = 'Are you sure you want to accept this order?';
    } else if (+orderstatus === 4) {
      msg = 'Are you sure you reach the store?';
    }  else if (orderstatus === 4) {
      msg = 'Are you sure you reach the store?';
    }  else if (+orderstatus === 10) {
      msg = 'Are you sure you mark the order on the way';
    } else if (+orderstatus === 11) {
      msg = 'Are you sure you mark the order delivered?';
    }
    const alert = await this.alertController.create({
      header: 'Order Task Required!',
      message: msg,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            // console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Confirm',
          handler: () => {
            // console.log('Confirm Okay');
            this.orderService.updateOrderStatus(orderid, this.deliverypersonid, orderstatus, deliverypersonstatus)
              .subscribe((data: any) => {
                if (data.status === 200) {
                  if (+data.order_status === 12) {
                    this.presentToast('You cannot accept this order since this order is cancelled by the customer');
                  } else {
                    if (+deliverypersonstatus === 2) {
                      this.presentToast('You have sucessfully accepted the order.Please click on running order to view the details');
                      this.navCtrl.navigateRoot([`/home`]);
                    } else if (+deliverypersonstatus === 3) {
                      this.presentToast('Please start collecting the items and verify the items as per order');
                      this.router.navigate(['/orders/orderdetail'], { queryParams: { orderid, state: this.orderType } });
                      // this.navCtrl.navigateRoot([`/orders/orderdetail`]);
                    } else {
                      this.presentToast('Please click on navigate button to navigate customer address');
                    }
                  }
                  this.navCtrl.navigateRoot([`/home`]);
                }
              });
          }
        }
      ]
    });

    await alert.present();
  }

}
