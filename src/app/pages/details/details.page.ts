import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/services/product.service';
import { ActivatedRoute } from '@angular/router';
import { Product } from 'src/app/interfaces/product';
import { NavController, LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit {

  //data-picker product.aniversario
  customYearValues = [2020, 2016, 2008, 2004, 2000, 1996, 1980, 1974, 1970];
  customDayShortNames = ['s\u00f8n', 'man', 'tir', 'ons', 'tor', 'fre', 'l\u00f8r'];
  customPickerOptions: any;

  private productId: string = null;
  public product: Product = {};
  private loading: any;
  private productSubscription: Subscription;

  constructor(
    private productService: ProductService,
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private toastCtrl: ToastController
  ) {
    this.productId = this.activatedRoute.snapshot.params['id'];

    if (this.productId) this.loadProduct();

    //data-picker product.aniversario
    this.customPickerOptions = {
      buttons: [{
        text: 'Save',
        handler: () => console.log('Aniversario Salvo!')
      }, {
        text: 'Log',
        handler: () => {
          console.log('Erro ao salvar o Aniversario');
          return false;
        }
      }]
    }
  }

  ngOnInit() { }

  ngOnDestroy() {
    if (this.productSubscription) this.productSubscription.unsubscribe();
  }


  loadProduct() {
    this.productSubscription = this.productService.getProduct(this.productId).subscribe(data => {
      this.product = data;
    });
  }


  async saveProduct() {
    await this.presentLoading();

    this.product.corretor = this.authService.getAuth().currentUser.uid;

    if (this.productId) {
      try {
        await this.productService.updateProduct(this.productId, this.product);
        await this.loading.dismiss();

        this.navCtrl.navigateBack('/home');
      } catch (error) {
        this.presentToast('Erro ao tentar salvar');
        this.loading.dismiss();
      }
    } else {
      this.product.data_entrada = new Date().getTime();

      try {
        await this.productService.addProduct(this.product);
        await this.loading.dismiss();

        this.navCtrl.navigateBack('/home');
      } catch (error) {
        this.presentToast('Erro ao tentar salvar');
        this.loading.dismiss();
      }
    }
  }

  async presentLoading() {
    this.loading = await this.loadingCtrl.create({ message: 'Aguarde...' });
    return this.loading.present();
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2000 });
    toast.present();
  }
}