import { Component, AfterViewInit, OnInit } from '@angular/core';

import { Platform, NavController, MenuController, AlertController } from '@ionic/angular';
// import { SplashScreen } from '@ionic-native/splash-screen/ngx';
// import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router } from '@angular/router';
import { AuthService } from './auth/auth.service';
import {
  Plugins,
  PushNotification,
  PushNotificationToken,
  PushNotificationActionPerformed,
  Capacitor
} from '@capacitor/core';
import { OrderService } from './orders/order.service';
const { PushNotifications, Modals, Storage } = Plugins;
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {

  deliveryid: number;
  private TOKEN_KEY = 'deliverytoken';
  private DELIVERY_BOY_ID = 'deliveryid';
  private DELIVERY_BOY_PHONE = 'deliveryphone';
  constructor(
    private platform: Platform,
    // private splashScreen: SplashScreen,
    // private statusBar: StatusBar,
    private navCtrl: NavController,
    private alertController: AlertController,
    private router: Router,
    private authService: AuthService,
    private menuCtrl: MenuController,
    private orderService: OrderService
  ) {
    this.initializeApp();
  }

  ngOnInit() {
    console.log('Initializing HomePage');
    this.deliveryid = +JSON.parse(localStorage.getItem('deliveryid'));
    // Register with Apple / Google to receive push via APNS/FCM
    PushNotifications.register();


    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting
    PushNotifications.requestPermission().then(result => {
      if (result.granted) {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
      } else {
        // Show some error
      }
    });



    PushNotifications.createChannel({
      description: 'Emergency Notifications',
      id: 'fcm_emergency_channel',
      importance: 5,
      lights: true,
      name: 'Emergency Alert Channel',
      sound: 'emergency.mp3',
      vibration: true,
      visibility: 1,
    })
      .then(() => {
        // alert('push channel created: ');
      })
      .catch((error) => {
        // alert(error);
      });

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration',
      (token: PushNotificationToken) => {
        // alert('Push registration success, token: ' + token.value);
        this.setDeliveryToken(token.value);
      }
    );


    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError',
      (error: any) => {
        // alert('Error on registration: ' + JSON.stringify(error));
      }
    );

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived',
      (notification: PushNotification) => {
        this.deliveryid = +JSON.parse(localStorage.getItem('deliveryid'));
        // alert('Push received: ' + JSON.stringify(notification.title) + JSON.stringify(notification.body));
        this.orderService.fetchDeliveryPersonOrdersCount(this.deliveryid).subscribe((data: any) => {
        });
      }
    );

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed',
      (notification: PushNotificationActionPerformed) => {
        this.deliveryid = +JSON.parse(localStorage.getItem('deliveryid'));
        this.orderService.fetchDeliveryPersonOrdersCount(this.deliveryid).subscribe((data: any) => {
        });
      }
    );
  }

  async setDeliveryToken(token) {
    await Storage.set({
      key: 'deliverytoken',
      value: token
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      if (!this.authService.isLoggedIn) {
        this.navCtrl.navigateRoot(['/auth/login']);
        if (Capacitor.isPluginAvailable('SplashScreen')) {
          Plugins.SplashScreen.hide();
        }
        // this.statusBar.styleDefault();
        // this.splashScreen.hide();
      } else {
        this.navCtrl.navigateRoot(['/home']);
        if (Capacitor.isPluginAvailable('SplashScreen')) {
          Plugins.SplashScreen.hide();
        }
        // this.statusBar.styleDefault();
        // this.splashScreen.hide();
      }
    });
  }

  ngAfterViewInit() {
    this.platform.backButton.subscribeWithPriority(0, () => {
      if (this.router.url === '/auth/login' || this.router.url === '/home') {
        // tslint:disable-next-line:no-string-literal
        navigator['app'].exitApp();
      } else {
        this.navCtrl.pop();
      }
    });
  }

  get isLoggedIn() {
    return this.authService.isLoggedIn;
  }

  // get userName() {
  //   const merchant = JSON.parse(localStorage.getItem('merchant'));
  //   return (merchant) ? merchant.store_name : '';
  // }

  logout() {
    this.presentAlertConfirm();
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: 'Logout!',
      message: 'Are you sure you want to logout!',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Logout',
          handler: () => {
            console.log('Confirm Okay');
            this.authService.logout().subscribe((data: any) => {
              if (data.status === 200) {
                localStorage.removeItem(this.DELIVERY_BOY_ID);
                localStorage.removeItem(this.TOKEN_KEY);
                localStorage.removeItem(this.DELIVERY_BOY_PHONE);
                this.navCtrl.navigateRoot(['/auth/login']);
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  clickMenu(value) {
    this.navCtrl.navigateRoot(`/${value}`);
    this.menuCtrl.close();
  }
}
