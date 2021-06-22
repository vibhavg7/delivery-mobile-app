import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { Capacitor, Plugins, CameraSource, CameraResultType } from '@capacitor/core';
import { OrderService } from '../order.service';
import { ActivatedRoute } from '@angular/router';
import {Location} from '@angular/common';

function base64toBlob(base64Data, contentType) {
  contentType = contentType || '';
  const sliceSize = 1024;
  const byteCharacters = window.atob(base64Data);
  const bytesLength = byteCharacters.length;
  const slicesCount = Math.ceil(bytesLength / sliceSize);
  const byteArrays = new Array(slicesCount);

  for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
    const begin = sliceIndex * sliceSize;
    const end = Math.min(begin + sliceSize, bytesLength);

    const bytes = new Array(end - begin);
    for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
      bytes[i] = byteCharacters[offset].charCodeAt(0);
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes);
  }
  return new Blob(byteArrays, { type: contentType });
}
@Component({
  selector: 'app-bill-confirmation',
  templateUrl: './bill-confirmation.page.html',
  styleUrls: ['./bill-confirmation.page.scss'],
})
export class BillConfirmationPage implements OnInit {

  deliverypersonid: number;
  billimage: any = '';
  orderId: any;
  submitted = false;
  @ViewChild('slider', { read: ElementRef, static: true}) slider: ElementRef;
  sliderOpts = {
    zoom: {
      maxRatio: 3
    }
  };
  @ViewChild('billnumber', {static: false}) billnumber: any = 0;
  @ViewChild('billamount', {static: false}) billamount: any = 0;
  constructor(private navCtrl: NavController,
              private location: Location,
              private toastCtrl: ToastController,
              private activatedRoute: ActivatedRoute,
              private orderService: OrderService) { }

  ngOnInit() {
    this.deliverypersonid = +JSON.parse(localStorage.getItem('deliveryid'));
    this.activatedRoute.paramMap.subscribe((data: any) => {
      this.orderId = +data.get('orderId');
    });
    console.log(this.billamount);
    console.log(this.billnumber);
  }

  backToRoot() {
    this.location.back();
    // this.navCtrl.navigateRoot(['/home']);
  }

  async onImagePicked(imageData: any) {
    let imageFile;
    imageFile = base64toBlob(
      imageData.replace('data:image/jpeg;base64,', ''),
      'image/jpeg');
    const uploadData = new FormData();
    uploadData.append('image', imageFile);
    this.orderService.uploadImage(uploadData, this.orderId).subscribe((data1: any) => {
      this.billimage = data1.orderImage.bill_image_url;
      this.presentToast('Bill Uploaded successfully');
    });
  }

  zoom(zoomin) {
    console.log(zoomin);
    const zoom = this.slider.nativeElement.swiper.zoom;
    console.log(zoom);
    if (zoomin) {
      zoom.in();
    } else {
      zoom.out();
    }
  }

  updateOrderStatus(orderstatus, deliverypersonstatus) {
    this.submitted = true;
    this.orderService.updateOrderStatus(+this.orderId, +this.deliverypersonid, orderstatus,
                                        deliverypersonstatus, +this.billnumber.value, +this.billamount.value, 1)
    .subscribe((data: any) => {
      console.log(data);
      if (data.status === 200) {
          this.navCtrl.navigateRoot([`/home`]);
          this.presentToast('Bill Uploaded successfully');
          this.submitted = false;
      }
    });
  }

  async presentToast(msg) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 1000, position: 'middle' });
    toast.present();
  }

}
