import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-validate-otp',
  templateUrl: './validate-otp.page.html',
  styleUrls: ['./validate-otp.page.scss'],
})
export class ValidateOtpPage implements OnInit {

  maxTime: any = 60;
  timer: any;
  phonenumber: any;
  deliveryPersonId: number;
  otp: any = '';
  obj: any = {};
  isLoading = false;
  hidevalue = false;
  phoneOTP: any = '';
  @ViewChild('input', { static: false }) input;
  constructor(private activatedRoute: ActivatedRoute,
              private authService: AuthService,
              private toastCtrl: ToastController,
              private router: Router,
              private navCtrl: NavController) { }

  ngOnInit() {
    this.otp = '';
    this.phonenumber = this.authService.deliveryInfo.phone;
    this.activatedRoute.paramMap.subscribe((data: any) => {
      if (!data.has('deliveryPersonId')) {
        this.navCtrl.navigateBack('/auth/login');
        return;
      }
      this.deliveryPersonId = +data.get('deliveryPersonId');
    });
  }

  ionViewWillEnter() {
    // this.otp = '';
    this.deliveryPersonId = +this.activatedRoute.snapshot.paramMap.get('deliveryPersonId');
  }

  ionViewDidEnter() {
    this.StartTimer();
    setTimeout(() => {
      this.input.setFocus();
    }, 0);
  }

  StartTimer() {
    this.timer = setTimeout(x => {
      if (this.maxTime <= 0) { }
      this.maxTime -= 1;
      if (this.maxTime > 0 && this.maxTime < 10) {
        this.maxTime = '0' + this.maxTime;
        this.hidevalue = false;
        this.StartTimer();
      } else if (this.maxTime > 0) {
        this.hidevalue = false;
        this.StartTimer();
      } else {
        this.hidevalue = true;
      }
    }, 1000);
  }


  // next(ev) {
  //   console.log(ev.value);
  //   this.obj[ev.name] = ev.value;
  //   console.log(this.obj[ev.name]);
  // }

  // validateOTP() {
  //   this.otp = '';
  //   for (const prop in this.obj) {
  //     if (Object.prototype.hasOwnProperty.call(this.obj, prop)) {
  //       this.otp += this.obj[prop];
  //     }
  //   }
  //   // console.log(this.otp);
  //   this.authService.loginDeliveryPerson(this.authService.deliveryInfo.phone, this.otp)
  //     .subscribe((data: any) => {
  //       this.otp = '';
  //       if (data.status === 200) {
  //         this.navCtrl.navigateRoot([`/home`]);
  //       }
  //     });
  // }

  validateOTP(phoneOTP: any) {
    if (phoneOTP === undefined || phoneOTP === '' || phoneOTP.length < 4) {

    } else if (phoneOTP !== undefined && phoneOTP !== '' && phoneOTP.length === 4) {
      this.isLoading = true;
      this.authService.validateDeliveryPerson(this.phonenumber, phoneOTP)
        .subscribe((data: any) => {
          if (data.status === 200) {
            this.navCtrl.navigateRoot([`/home`]);
          } else {
            this.presentToast('Please enter valid OTP');
          }
          this.isLoading = false;
        });
    } else {
      this.presentToast('Please enter valid OTP');
    }
  }

  resendOTP() {
    console.log('resendOTP');
    if (this.hidevalue) {
      if (this.phonenumber === undefined || this.phonenumber.length < 10) {
      } else if (this.phonenumber !== undefined && this.phonenumber.length === 10) {
        console.log('resendOTP1');
        this.isLoading = true;
        this.authService.resendOTP(this.deliveryPersonId)
          .subscribe((data: any) => {
            console.log(data);
            if (data.status === 400) {
              this.presentToast('Unable to resend otp.Please try again later');
              this.isLoading = false;
            } else if (data.status === 200) {
              this.hidevalue = false;
              this.maxTime = 60;
              this.StartTimer();
              this.presentToast('OTP sent successfully');
              this.isLoading = false;
              // this.router.navigate(['/', 'auth', 'validate-otp', data.customer_id, { storeId: this.storeId }]);
            }
          });
      } else {
        this.presentToast('Unable to register.Please enter valid phone number');
      }
    }
  }

  async presentToast(msg) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 1000, position: 'middle' });

    toast.present();
  }

}
