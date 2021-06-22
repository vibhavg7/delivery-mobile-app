import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { tap, map } from 'rxjs/operators';
import { catchError } from 'rxjs/internal/operators/catchError';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private deliveryServiceUrl = 'https://api.grostep.com/deliveryapi/';
  redirectUrl: any;
  deliveryInfo: any;
  private TOKEN_KEY = 'deliverytoken';
  private DELIVERY_BOY_ID = 'deliveryid';
  private DELIVERY_BOY_PHONE = 'deliveryphone';
  constructor(private httpClient: HttpClient) { }


  get isLoggedIn() {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  get isauthenticated() {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  registerDeliveryBoy(phone: any, token: any) {
    const obj: any = {};
    obj.phone = phone;
    obj.token = token;
    console.log(obj);
    return this.httpClient.post<any[]>(`${this.deliveryServiceUrl}register`, obj)
      .pipe(
        tap(data => {
          this.deliveryInfo = data;
        })
        , map((data) => {
          return data;
        })
        , catchError(this.handleError)
      );
  }

  loginDeliveryPerson(phone: any, token: any) {
    const obj: any = {};
    obj.phone = phone;
    obj.token = token;
    // validate
    return this.httpClient.post<any[]>(`${this.deliveryServiceUrl}login`, obj)
      .pipe(
        tap(data => {
          this.deliveryInfo = data;
        })
        , map((data) => {
          console.log(data);
          // return this.authenticate(data);
          return data;
        })
        , catchError(this.handleError)
      );
  }

  fetchDeliveryPersonInfoById(id): Observable<any> {

    return this.httpClient.get(`${this.deliveryServiceUrl}deliveryinfo/${id}`).pipe(
      tap(data => {
        // this.storeCategories = data['store_categories'];
        // console.log(data);
      })
      , map((deliveryPersonData) => {
        return deliveryPersonData;
      })
      , catchError(this.handleError)
    );
  }

  validateDeliveryPerson(phone: any, otp: any) {
    const obj: any = {};
    obj.phone_number = phone;
    obj.otp_number = otp;
    return this.httpClient.post<any[]>(`${this.deliveryServiceUrl}validate`, obj)
      .pipe(
        tap(data => {
        })
        , map((data) => {
          // console.log(data);
          return this.authenticate(data);
          // return data;
        })
        , catchError(this.handleError)
      );
  }

  resendOTP(deliveryPersonId) {
    return this.httpClient.get<any[]>(`${this.deliveryServiceUrl}resendOTP/${deliveryPersonId}`)
      .pipe(
        tap((data: any) => {
          // this.customerInfo = data;
        })
        , map((data) => {
          return data;
        })
        , catchError(this.handleError)
      );
  }

  logout() {
    const deliverypersonid = +JSON.parse(localStorage.getItem('deliveryid'));
    const obj: any = {};
    obj.login_status = 0;
    obj.token = '';
    const url = `${this.deliveryServiceUrl}logoutDeliveryPerson/${deliverypersonid}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.put(url, obj, { headers }).pipe(
      tap(data => {
      }),
      map((data) => {
        return data;
      }),
      catchError(this.handleError)
    );
  }

  createAuthorizationHeader(headers: Headers) {
    headers.append('Authorization', 'Bearer ' +
      localStorage.getItem(this.TOKEN_KEY));
  }

  authenticate(response: any): any {
    if (response.status === 200) {
      const token = response.token;
      const deliveryBoyid = response.deliveryPersonData.delivery_person_id;
      const deliveryBoyphone = response.deliveryPersonData.phone;
      // console.log(deliveryBoyphone);
      if (token) {
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.DELIVERY_BOY_ID, deliveryBoyid);
        localStorage.setItem(this.DELIVERY_BOY_PHONE, deliveryBoyphone);
        return response;
      } else {
        return response;
      }
    } else {
      return response;
    }
  }

  private handleError(err: HttpErrorResponse) {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage = '';
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
    }
    // console.error(errorMessage);
    return throwError(errorMessage);
  }
}
