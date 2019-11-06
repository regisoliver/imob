import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingController, ToastController, IonInfiniteScroll } from '@ionic/angular';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/interfaces/product';
import { Subscription } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  private loading: any;
  public products = new Array<Product>();
  private productsSubscription: Subscription;

  //search
  public prodList: Product[];
  public loadedProdList: Product[];

  constructor(
    private productsService: ProductService,
    private authService: AuthService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    public fs: AngularFirestore,
    public alertController: AlertController,
  ) {
    this.productsSubscription = this.productsService.getProducts().subscribe(data => {
      this.products = data;
    });
  }

  carregaProdutoOriginal(){
    this.productsSubscription = this.productsService.getProducts().subscribe(data => {
      this.products = data;
    });
  }

  //@ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll; -- VOLTAR

  // evento carregamento da pagina
  loadData(event) {
    setTimeout(() => {
      console.log('Done');
      this.initializeItems();
      event.target.complete();
    }, 1000);
  }

  // scroll carregamento da pagina
  toggleInfiniteScroll() {
    //this.infiniteScroll.disabled = !this.infiniteScroll.disabled; --VOLTAR
  }

  //ion-alert
  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: 'Deseja sair da Conta ?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
          }
        }, {
          text: 'Sair',
          cssClass: 'secondary',
          handler: () => {
            this.logout();
          }
        }
      ]
    });

    await alert.present();
  }

  ngOnInit() {
    console.log("entrou");
    this.fs.collection('Products').valueChanges().subscribe(prodList => {
      this.prodList = prodList;
      this.loadedProdList = prodList;
    })
  }

  initializeItems(): void {
    if (!this.products.length) {
      this.carregaProdutoOriginal();
      console.log("initialize -- products", this.products);
    }
    this.prodList = this.products;
    console.log("initialize -- prodLIST", this.prodList);
    console.log("initialize -- products", this.products);
  }

  filterList(event) {
    console.log("FILTER");
    //this.initializeItems();

    const searchTerm = event.srcElement.value;
    console.log("searchTerm", searchTerm);

    if (!searchTerm) {
      this.initializeItems();
      return;
    }

    this.products = this.prodList.filter(currentProd => {
      if (currentProd.tipo && searchTerm) {
        if (currentProd.tipo.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1) {
          return true;
        }
        return false;
      }
    })

    console.log("dentro do FIlter-prod++", this.products);
  }

  ngOnDestroy() {
    this.productsSubscription.unsubscribe();
  }

  async logout() {
    await this.presentLoading();

    try {
      await this.authService.logout();
    } catch (error) {
      console.error(error);
    } finally {
      this.loading.dismiss();
    }
  }

  async presentLoading() {
    this.loading = await this.loadingCtrl.create({ message: 'Aguarde...' });
    return this.loading.present();
  }

  async deleteProduct(id: string) {
    try {
      await this.productsService.deleteProduct(id);
    } catch (error) {
      this.presentToast('Erro ao tentar deletar');
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2000 });
    toast.present();
  }
}