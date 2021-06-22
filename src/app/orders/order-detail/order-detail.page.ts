import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { mergeMap } from 'rxjs/operators';
import { OrderService } from '../order.service';
import { ToastController, NavController, Platform, AlertController } from '@ionic/angular';
import { CallNumber } from '@ionic-native/call-number/ngx';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.page.html',
  styleUrls: ['./order-detail.page.scss'],
})
export class OrderDetailPage implements OnInit {

  submitted = false;
  buttonSubmitted = false;
  ordercurrentstatus: any;
  orderType: any;
  deliverypersonid: number;
  orderProducts: any;
  isLoading: boolean;
  orderInfo: any;
  navigateCustomerButton = false;
  constructor(private route: ActivatedRoute,
              private callNumber: CallNumber,
              private toastCtrl: ToastController, private router: Router,
              private platform: Platform,
              private alertController: AlertController,
              private navCtrl: NavController, private orderService: OrderService) { }

  ngOnInit() {
  }

  backToHome() {
    this.navCtrl.navigateRoot([`/orders/ordertrack/${this.orderType}`]);
  }

  ionViewWillEnter() {
    this.platform.backButton.subscribeWithPriority(0, () => {
      this.navCtrl.navigateRoot([`/orders/ordertrack/${this.orderType}`]);
    });
    this.isLoading = true;
    this.deliverypersonid = +JSON.parse(localStorage.getItem('deliveryid'));
    this.route.queryParamMap.pipe(
      mergeMap((data: any) => {
        this.orderType = +data.params.state;
        return this.getOrderDetail(data);
      })
    )
      .subscribe((orderDetail: any) => {
        this.isLoading = false;
        console.log(orderDetail);
        this.orderInfo = orderDetail[0].orderdata[0];
        this.orderProducts = orderDetail[1].order_products_info;
        console.log(this.orderInfo);
        console.log(this.orderProducts);
        this.ordercurrentstatus = this.orderInfo.order_current_status;
      });

  }

  async pendingBilling(orderid) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Edit Customer <strong>Order</strong>?',
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
    // this.navCtrl.navigateForward([`/orders/billconfirmation/${orderid}`]);
  }


  updateOrderStatus(orderid, orderstatus, deliverypersonstatus) {
    this.submitted = true;
    this.orderService.updateOrderStatus(+orderid, +this.deliverypersonid, orderstatus, deliverypersonstatus).subscribe((data: any) => {
      console.log(data);
      if (data.status === 200) {
        if (+deliverypersonstatus === 5) {
          this.ordercurrentstatus = 5;
          this.navCtrl.navigateRoot([`/orders/ordertrack/${this.orderType}`]);
          // this.navCtrl.navigateForward([`/orders/billconfirmation/${orderid}`]);
          this.presentToast('You have successfully picked all the items.');
        } else if (+deliverypersonstatus === 6) {
          // this.presentToast('You have successfully picked all the items.Please click on below button to start navigation');
          // this.navigateCustomerButton = true;
        }
      }
      this.submitted = false;
    });

  }

  openMap(lat, lng) {
    const url = 'https://maps.google.com/?q=' + lat + ',' + lng;
    window.open(url);
  }

  getOrderDetail(data) {
    console.log(data);
    console.log(this.orderType);
    if (+this.orderType === 2) {
      return this.orderService.getRunningOrderDetails(data.params.orderid, this.deliverypersonid);
    } else if (this.orderType === 4) {
      return this.orderService.getDeliveredOrderDetails(data.params.orderid);
    }
  }


  async presentToast(msg) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 1500, position: 'bottom' });

    toast.present();
  }

  dailCustomerNumber(phoneNumber) {
    this.callNumber.callNumber(phoneNumber, true)
      .then(res => console.log('Launched dialer!', res))
      .catch(err => console.log('Error launching dialer', err));
  }

}
