import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingController, ToastController, IonInfiniteScroll } from '@ionic/angular';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/interfaces/product';
import { Subscription } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  private loading: any;
  public products = new Array<Product>();
  private productsSubscription: Subscription;

  sampleArr=[];
  resultArr=[];

  constructor(
    private productsService: ProductService,
    private authService: AuthService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    public fs: AngularFirestore,
  ) {
    this.productsSubscription = this.productsService.getProducts().subscribe(data => {
      this.products = data;
    });
  }
  //@ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll; -- VOLTAR

  // evento carregamento da pagina
  loadData(event) {
    setTimeout(() => {
      console.log('Done');
      event.target.complete();

      // App logic to determine if all data is loaded
      // and disable the infinite scroll
      if (this.products.length == 100) {
        event.target.disabled = true;
      }
    }, 500);
  }

  // scroll carregamento da pagina
  toggleInfiniteScroll() {
    //this.infiniteScroll.disabled = !this.infiniteScroll.disabled; --VOLTAR
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.productsSubscription.unsubscribe();
  }

  
  search(event){
    let searchKey:string=event.target.value;
    let firstLetter=searchKey.toUpperCase();

    if(searchKey.length==0){
      this.sampleArr=[];
      this.resultArr=[];
    }

    if(this.sampleArr.length==0){
      this.fs.collection('Products', ref=>ref.where('tipo','==',firstLetter)).snapshotChanges()
      .subscribe(data=>{
        data.forEach(childData => {
          this.sampleArr.push(childData.payload.doc.data())
        });
      })
    }else{
      this.resultArr=[];
      this.sampleArr.forEach(val=>{
        let name:string=val['tipo'];
        if(name.toUpperCase().startsWith(searchKey.toUpperCase())){
          if(true){
            this.resultArr.push(val);
          }
        }
      })
    }
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