import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { ActivatedRoute } from '@angular/router';
import { Platform, NavController } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  deliveryid: number;
  isLoading = false;
  errorMessage: any = '';
  deliveryPersonData: any;
  constructor(private activatedRoute: ActivatedRoute,
              private platform: Platform,
              private navCtrl: NavController,
              private authService: AuthService) { }

  ngOnInit() {
  }

  backToHome() {
    this.navCtrl.navigateRoot(['/home']);
  }

  ionViewWillEnter() {
    this.platform.backButton.subscribeWithPriority(0, () => {
      this.navCtrl.navigateRoot(['/home']);
    });
    this.isLoading = true;
    this.deliveryid = +JSON.parse(localStorage.getItem('deliveryid'));
    this.authService.fetchDeliveryPersonInfoById(this.deliveryid).subscribe((data) => {
        this.isLoading = false;
        // console.log(data);
        this.deliveryPersonData = data.deliveryPersonData;
        console.log(this.deliveryPersonData);
    });
  }

}
