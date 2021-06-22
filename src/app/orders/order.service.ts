import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { tap, map, catchError } from 'rxjs/operators';
import { Observable, throwError, of, Subject, forkJoin } from 'rxjs';
// import { ErrorTracker } from '../shared/errorTracker';

export class ErrorTracker {
  errorNumber: number;
  errorMessage: string;
  friendlyMessage: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  deliveredorders: any;
  deliverypersondata: any;
  public runningOrders: any;
  private deliveryServiceUrl = 'https://api.grostep.com/deliveryapi/';
  private storeServiceUrl = 'https://api.grostep.com/storesapi/';
  imageServiceUrl = 'https://api.grostep.com/imageuploadapi';
  ordersInfo: any = [];
  private subject = new Subject<any>();
  public ordersCount$: Observable<any> = this.subject.asObservable();
  constructor(private http: HttpClient) { }

  fetchDeliveryPersonOrdersCount(deliveryPersonId: number): Observable<any> {
    const timeoffset = new Date().getTimezoneOffset();
    // const response1 = this.http.get<any[]>(`${this.deliveryServiceUrl}fetchAllNewOrders`);
    // const response2 = this.http.get<any[]>(`${this.deliveryServiceUrl}deliverypersonordersinfo/${deliveryPersonId}/${timeoffset}`);
    // return forkJoin([response1, response2])
    // .pipe(tap((d) => {
    // }));
    return this.http.get<any[]>(`${this.deliveryServiceUrl}deliverypersonordersinfo/${deliveryPersonId}/${timeoffset}`)
       .pipe(
        tap((data: any) => {
          // this.runningOrders = data.runningorders;
        })
        , map((data: any) => {
          this.sendMessage(data);
          return data;
        })
        , catchError(this.handleError)
      );
  }

  getRunningOrderDetails(orderid, deliverypersonid): Observable<any> {
    const obj: any = {};
    obj.deliverypersonid = deliverypersonid;
    obj.orderId = orderid;
    const orderdata = this.http.post<any[]>(`${this.deliveryServiceUrl}fetchRunningStatusByOrderId`, obj);
    const orderproduct =  this.fetchOrderProducts(orderid);
    return forkJoin([orderdata, orderproduct])
    .pipe(tap((d) => {
    }));
  }

  uploadImage(uploadData: any, orderId: any) {
    return this.http.post(`${this.imageServiceUrl}/uploadOrderBill/${orderId}`, uploadData).pipe(
      tap(data => {
      }),
      map((data: any) => {
        return data;
      })
    );
  }

  getDeliveredOrderDetails(orderid): Observable<any> {
    const orderdata = of(this.deliveredorders.filter(d => d.order_id === +orderid));
    const orderproduct =  this.fetchOrderProducts(orderid);
    return forkJoin([orderdata, orderproduct])
    .pipe(tap((d) => {
    }));
  }

  fetchOrderProducts(orderId: number): Observable<any> {
    console.log(orderId);
    return this.http.get<any[]>(`${this.storeServiceUrl}storeinfo/storeorderproducts/${orderId}`)
      .pipe(
        tap(data => {
        })
        , map((data) => {
          // console.log(data);
          return data;
        })
        , catchError(this.handleError)
      );
  }

  updateOrderStatus(orderid, deliverypersonid, orderstatus, deliverypersonstatus, billnumber = 0, billamount = 0, isOrderEdit = 0) {
    const obj: any = {};
    obj.status = orderstatus;
    obj.deliverypersonid = deliverypersonid;
    obj.order_delivery_person_status = deliverypersonstatus;
    obj.bill_number = billnumber;
    obj.bill_amount = billamount;
    obj.is_order_editable = isOrderEdit;
    console.log(obj);
    const url = `${this.deliveryServiceUrl}updateorder/${orderid}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put(url, obj, { headers }).pipe(
      tap(data => {
        // console.log(JSON.stringify(data));
      }),
      map((data1) => {
        return data1;
      }),
      catchError(this.handleError)
    );
  }

  fetchAllDPPastOrders(deliverypersonid, pagenumber: number, pagesize: number, filterBy: any, ordertype: any) {
    const obj: any = {};
    obj.page_number = pagenumber;
    obj.page_size = pagesize;
    obj.deliverypersonid = deliverypersonid;
    obj.filterBy = filterBy;
    obj.order_type = ordertype;
    obj.offset = new Date().getTimezoneOffset();
    console.log(obj);
    return this.http.post<any[]>(`${this.deliveryServiceUrl}fetchpastorders`, obj)
    .pipe(
      tap((data: any) => {
        // this.ordersInfo = data.past_orders_info;
        console.log(data);
      })
      , map((data) => {
        return data;
      })
      , catchError(this.handleError)
    );
  }


  // fetchOrdersCount(deliveryPersonId: number): Observable<any> {
  //   const timeoffset = new Date().getTimezoneOffset();
  //   return this.http.get<any[]>(`${this.storeServiceUrl}merchantorderscount/${deliveryPersonId}/${timeoffset}`)
  //     .pipe(
  //       tap(data => {
  //       })
  //       , map((data: any) => {
  //         this.sendMessage(data);
  //         return data;
  //       })
  //       , catchError(this.handleError)
  //     );
  // }

  fetchAllNewOrders(pagenumber: number, pagesize: number) {
    const obj: any = {};
    obj.page_number = pagenumber;
    obj.page_size = pagesize;
    // obj.offset = new Date().getTimezoneOffset();
    console.log(obj);
    return this.http.post<any[]>(`${this.deliveryServiceUrl}fetchAllNewOrders`, obj)
       .pipe(
        tap(data => {
        })
        , map((data: any) => {
          // this.sendMessage(data);
          return data;
        })
        , catchError(this.handleError)
      );
  }

  fetchAllRunningOrders(deliverypersonid, pagenumber: number, pagesize: number) {
    const obj: any = {};
    obj.page_number = pagenumber;
    obj.page_size = pagesize;
    // tslint:disable-next-line:max-line-length
    return this.http.post<any[]>(`${this.deliveryServiceUrl}fetchAllRunningOrders/${deliverypersonid}`, obj)
       .pipe(
        tap((data: any) => {
          this.runningOrders = data.runningorders;
        })
        , map((data: any) => {
          return data;
        })
        , catchError(this.handleError)
      );
  }

  fetchRunningStatusByOrderId(deliverypersonid, orderId) {
    // tslint:disable-next-line:max-line-length
    const obj: any = {};
    obj.deliverypersonid = deliverypersonid;
    obj.orderId = orderId;
    return this.http.post<any[]>(`${this.deliveryServiceUrl}fetchRunningStatusByOrderId`,obj)
       .pipe(
        tap((data: any) => {
          // this.runningOrders = data.runningorders;
        })
        , map((data: any) => {
          return data;
        })
        , catchError(this.handleError)
      );
  }

  fetchAllDeliveredOrders(deliverypersonid, pagenumber: number, pagesize: number) {
    const obj: any = {};
    obj.page_number = pagenumber;
    obj.page_size = pagesize;
    obj.offset = new Date().getTimezoneOffset();
    return this.http.post<any[]>(`${this.deliveryServiceUrl}fetchAllDeliveredOrders/${deliverypersonid}`, obj)
       .pipe(
        tap((data: any) => {
          // console.log(data);
          this.deliveredorders = data.delivered_orders_info;
          console.log(this.deliveredorders);
        })
        , map((data: any) => {
          return data;
        })
        , catchError(this.handleError)
      );
  }

  sendMessage(data: any) {
    this.subject.next({
      total_order_count: data.new_order_count[0].new_order_count,
      new_order_count: data.new_order_count[0].new_order_count,
      running_order_count: data.running_order_count[0].running_order_count,
      delivered_order_count: data.delivered_order_count[0].delivered_order_count
      // new_order_count: data.neworders.length
    });
  }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }


  private handleError(err: HttpErrorResponse): Observable<ErrorTracker> {

    const dataError = new ErrorTracker();
    dataError.errorNumber = 100;
    dataError.errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
    dataError.friendlyMessage = 'An error retriving data';
    return throwError(dataError);
  }

}
