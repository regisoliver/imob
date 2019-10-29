import { Component, OnInit } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Platform } from '@ionic/angular';
import { File } from '@ionic-native/file/ngx';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Product } from 'src/app/interfaces/product';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-galeria',
  templateUrl: './galeria.page.html',
  styleUrls: ['./galeria.page.scss'],
})
export class GaleriaPage implements OnInit {

  public uploadPercent: Observable<number>;
  public downloadUrl: Observable<string>;

  private productId: string = null;
  public product: Product = {};
  private productSubscription: Subscription;

  constructor(
    private camera: Camera,
    private platform: Platform,
    private file: File,
    private afStorage: AngularFireStorage,
    private activatedRoute: ActivatedRoute,
    private productService: ProductService
  ) { 
    this.productId = this.activatedRoute.snapshot.params['id'];
    console.log('ID: ', this.productId);
  }

  ngOnInit() {
  }

  async openGalery(){
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      correctOrientation: true
    };

    try{
      const fileUrl: string = await this.camera.getPicture(options);
      console.log(fileUrl);
      console.log(options.destinationType);

      let file: string;

      if(this.platform.is('ios')){
        file = fileUrl.split('/').pop();
        console.log(this.file);
      } else {
        file = fileUrl.substring(fileUrl.lastIndexOf('/') + 1, fileUrl.indexOf('?'));
        console.log(this.file);
      }

      const path: string = fileUrl.substring(0, fileUrl.lastIndexOf('/'));

      const buffer: ArrayBuffer = await this.file.readAsArrayBuffer(path, file);
      const blob: Blob = new Blob([buffer], { type: 'image/jpeg' });

      this.uploadPicture(blob);
    }catch(error){
      console.error(error);
    }

  }

  uploadPicture(blob: Blob){
    console.log(blob);
    
    const ref = this.afStorage.ref('images/ionic.jpg');
    const task = ref.put(blob);

    this.uploadPercent = task.percentageChanges();

    task.snapshotChanges().pipe(
      finalize(() => this.downloadUrl = ref.getDownloadURL())
    ).subscribe();
    
  }

  loadProduct() {
    this.productSubscription = this.productService.getProduct(this.productId).subscribe(data => {
      this.product = data;
      console.log(this.product);
    });
  }

}
