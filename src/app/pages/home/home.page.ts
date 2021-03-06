import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingController, ToastController, IonInfiniteScroll } from '@ionic/angular';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/interfaces/product';
import { Subscription } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { AlertController } from '@ionic/angular';
import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  private loading: any;
  public products = new Array<Product>();
  private productsSubscription: Subscription;
  public logado: User = {};

  //search
  public prodList: Product[];
  public loadedProdList: Product[];

  //sharing
  public message: string;

  constructor(
    private productsService: ProductService,
    private authService: AuthService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    public fs: AngularFirestore,
    public alertController: AlertController,
  ) {
    this.carregaProdutoOriginal();
    this.loadLogado();
  }

  carregaProdutoOriginal() {
    this.productsSubscription = this.productsService.getProducts().subscribe(data => {
      this.products = data;
    });
  }

  loadLogado() {
    this.productsService.getUser(this.authService.getAuth().currentUser.uid).subscribe(data => {
      this.logado = data;
      console.log("user Nome:", this.logado.nome);
      console.log("user Admin:", this.logado.isAdmin);
    });
  }

  //@ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll; -- VOLTAR

  // evento carregamento da pagina
  async loadData(event) {
    await setTimeout(() => {
      console.log('Done');
      this.initializeItems();
      event.target.complete();
    }, 1000);
  }

  // scroll carregamento da pagina
  toggleInfiniteScroll() {
    //this.infiniteScroll.disabled = !this.infiniteScroll.disabled; --VOLTAR
  }

  //ion-alert Logout
  async presentAlertConfirmLogout() {
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

  //ion-alert deletar
  async presentAlertConfirmDelete(id: string) {
    this.loadLogado();
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: 'Deletar Imovel ?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
          }
        }, {
          text: 'Deletar',
          cssClass: 'secondary',
          handler: () => {
            this.deleteProduct(id);
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

  async filterList(event) {
    console.log("FILTER");

    const searchTerm = event.srcElement.value;
    console.log("searchTerm", searchTerm);

    if (!searchTerm) {
      this.initializeItems();
      return;
    }

    this.products = this.prodList.filter(currentProd => {
      if (currentProd.finalidade && searchTerm) {
        if (currentProd.finalidade.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1) {
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
    await this.presentLoading();
    console.log("delete nome:", this.logado.nome);
    console.log("delete admin:", this.logado.isAdmin);
    if (this.logado.isAdmin == true) {
      try {
        await this.productsService.deleteProduct(id);
        this.loading.dismiss();
        this.presentToast("<b>Produto Deletado</b>");
      } catch (error) {
        this.loading.dismiss();
        this.presentToast('Erro ao tentar deletar');
        console.log(error);
      }
    }else{
      this.loading.dismiss();
      this.presentToast("<b>Permissão</b>\n\nVocê não tem Permissão para Deletar.");
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({ 
      message,
      position: 'middle',
      duration: 4000 });
    toast.present();
  }

}