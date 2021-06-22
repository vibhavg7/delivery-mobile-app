import { Component, OnInit, ViewChild } from '@angular/core';
import { Platform, NavController, IonInfiniteScroll } from '@ionic/angular';
import { OrderService } from '../order.service';

@Component({
  selector: 'app-past-orders',
  templateUrl: './past-orders.page.html',
  styleUrls: ['./past-orders.page.scss'],
})
export class PastOrdersPage implements OnInit {

  pastorderscount: any;
  currentPage = 1;
  pageSize = 10;
  orderstatus = 7;
  filterBy: any = '';
  deliveryid: number;
  isLoading = false;
  totalPages: number;
  pastOrders: any = [];
  @ViewChild(IonInfiniteScroll, {static: true}) infiniteScroll: IonInfiniteScroll;
  constructor(private platform: Platform, private navCtrl: NavController, private orderService: OrderService) { }

  ngOnInit() {
    this.deliveryid = +JSON.parse(localStorage.getItem('deliveryid'));
  }

  ionViewWillEnter() {
    this.platform.backButton.subscribeWithPriority(0, () => {
      this.navCtrl.navigateRoot(['/home']);
    });
    this.currentPage = 1;
    this.pastOrders = [];
    // console.log(this.infiniteScroll);
    this.infiniteScroll.disabled = false;
    this.loadPastOrders();
  }

  loadPastOrders(event?) {
    this.isLoading = true;
    this.orderService.fetchAllDPPastOrders
    (this.deliveryid, this.currentPage, this.pageSize, '', this.orderstatus).subscribe((data: any) => {
      if (data.status === 200) {
        this.isLoading = false;
        console.log(data);
        this.pastOrders = this.pastOrders.concat(data.dp_orders_info);
        this.pastorderscount = data.dp_order_count[0].dp_orders_count;
        this.totalPages = Math.ceil(this.pastorderscount / this.pageSize);
      }
      if (event) {
        event.target.complete();
      }
    });
  }

  loadMore(event) {
    this.currentPage++;
    console.log(event);
    console.log(this.currentPage);
    this.loadPastOrders(event);
    if (this.currentPage === this.totalPages) {
      console.log('dddd');
      event.target.disabled = true;
    }
  }

  backToHome() {
    this.navCtrl.navigateRoot(['/home']);
  }

}
