import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import {
  Plugins,
  PushNotification,
  PushNotificationToken,
  PushNotificationActionPerformed } from '@capacitor/core';
import { Platform, ToastController } from '@ionic/angular';

const { PushNotifications, Storage } = Plugins;

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  isLoading = false;
  deliveryPersonId: number;
  phoneNumber: any = '';
  // storeId: number;
  token: any;
  public loginForm: FormGroup;
  @ViewChild('input', { static: false }) input;
  constructor(
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private toastCtrl: ToastController,
    private platform: Platform,
    private router: Router) { }

  ngOnInit() {
    // PushNotifications.register();

    // // On success, we should be able to receive notifications
    // PushNotifications.addListener('registration',
    //   (token: PushNotificationToken) => {
    //     this.token = token.value;
    //   }
    // );
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.input.setFocus();
    }, 0);
  }
  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  ionViewWillEnter() {
    this.platform.backButton.subscribeWithPriority(0, () => {
      // tslint:disable-next-line:no-string-literal
      navigator['app'].exitApp();
    });

    this.deliveryPersonId = +this.activatedRoute.snapshot.paramMap.get('deliveryPersonId');
  }

  // login(phoneNumber: any) {
  //   this.authService.registerDeliveryBoy(phoneNumber, this.token)
  //     .subscribe((data: any) => {
  //       console.log(data);
  //       if (data.delivery_person_id !== 0) {
  //         this.router.navigate(['/', 'auth', 'validate-otp', data.delivery_person_id]);
  //       }
  //     });
  // }

  async getDeliveryToken(phoneNumber) {
    const deliverytoken = await Storage.get({ key: 'deliverytoken' });
    // alert(customertoken.value);
    if (phoneNumber === undefined || phoneNumber.length < 10) {
    } else if (phoneNumber !== undefined && phoneNumber.length === 10) {
      this.isLoading = true;
      this.authService.loginDeliveryPerson(phoneNumber, deliverytoken.value)
        .subscribe((data: any) => {
          if (data.status === 400) {
            alert('Unable to login. Please contact Grostep Team for your registration.');
            // this.presentToast('Unable to login.Our Team will get back to you soon for your registration');
          } else if (data.status === 200) {
            // this.router.navigate(['/', 'auth', 'validate-otp', data.customer_id, { storeId: this.storeId }]);
            this.router.navigate(['/', 'auth', 'validate-otp', data.delivery_person_id]);
          }
          this.isLoading = false;
        });
    } else {
      alert('Unable to login.Please enter valid phone number');
      // this.presentToast('Unable to login.Please enter valid phone number');
    }
  }

  login(phoneNumber: any) {
    this.getDeliveryToken(phoneNumber);
    // this.authService.registerMerchant(phoneNumber, this.token)
    //   .subscribe((data: any) => {
    //     console.log(data);
    //     if (data.store_id !== 0) {
    //       this.router.navigate(['/', 'auth', 'validate-otp', data.store_id]);
    //     }
    //   });
  }

  async presentToast(msg) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 1000, position: 'middle' });

    toast.present();
  }

}
