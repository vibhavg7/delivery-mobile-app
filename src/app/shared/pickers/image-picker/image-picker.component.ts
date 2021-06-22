import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { Capacitor, Plugins, CameraSource, CameraResultType } from '@capacitor/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
@Component({
  selector: 'app-image-picker',
  templateUrl: './image-picker.component.html',
  styleUrls: ['./image-picker.component.scss'],
})
export class ImagePickerComponent implements OnInit {

  usePricker: boolean;
  selectedImage: any;
  @Output() imagePick = new EventEmitter<string | File>();
  @ViewChild('filePicker', { static: false }) filePicker: ElementRef<HTMLInputElement>;
  constructor(private navCtrl: NavController, private sanitizer: DomSanitizer, private platform: Platform) { }

  ngOnInit() {
    if (
      (this.platform.is('mobile') && !this.platform.is('hybrid')) ||
      this.platform.is('desktop')
    ) {
      this.usePricker = true;
    }
    console.log(this.usePricker);
  }

  // onPickImage() {
  //   if (!Capacitor.isPluginAvailable('Camera')) {
  //     return;
  //   }
  //   Plugins.Camera.getPhoto({
  //     quality: 50,
  //     source: CameraSource.Prompt,
  //     correctOrientation: true,
  //     height: 320,
  //     width: 200,
  //     resultType: CameraResultType.DataUrl
  //   })
  //     .then((image: any) => {
  //       this.selectedImage = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + image.base64Data);
  //       // this.selectedImage = image.DataUrl;
  //       this.imagePick.emit(this.selectedImage);
  //     })
  //     .catch(error => {
  //       console.log(error);
  //       return false;
  //     });
  // }


  async onPickImage() {
    if (!Capacitor.isPluginAvailable('Camera') || this.usePricker) {
      this.filePicker.nativeElement.click();
      return;
    }
    const image = await Plugins.Camera.getPhoto({
      quality: 90,
      height: 600,
      width: 600,
      correctOrientation: true,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera
    });
    this.selectedImage = this.sanitizer.bypassSecurityTrustResourceUrl(image && (image.base64String));
    this.imagePick.emit(image.base64String);
  }

  onFileChosen(event: Event) {
    const pickedFile = (event.target as HTMLInputElement).files[0];
    if (!pickedFile) {
      return;
    }
    const fr = new FileReader();
    fr.onload = () => {
      const dataUrl = fr.result.toString();
      this.selectedImage = dataUrl;
      this.imagePick.emit(pickedFile);
    };
    fr.readAsDataURL(pickedFile);
  }

}
