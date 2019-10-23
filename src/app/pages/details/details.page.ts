import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/services/product.service';
import { ActivatedRoute } from '@angular/router';
import { Product } from 'src/app/interfaces/product';
import { NavController, LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';

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

  public MyForm: any;
  message = "";
  errorStatus = false;
  errorTipo = false;

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
    private toastCtrl: ToastController,
    public alertController: AlertController,
    formBuilder: FormBuilder
  ) {

    //form do details.page.ts
    //this.MyForm = formBuilder.group({
    //  proprietario: ['', Validators.required],
    //  codigo: ['', Validators.required],
    //  valor: [, Validators.required],
    //  tipo: ['', Validators.required],
    //  finalidade: ['', Validators.required],
    //  status: ['', Validators.required],
    //  telefone: [, Validators.required]
      //tipo: ['', Validators.compose([Validators.minLength(6), Validators.maxLength(20), Validators.required])],
    //});

    this.MyForm = new FormGroup({
      proprietario: new FormControl({ value: '' }, Validators.compose([Validators.required])),
      codigo: new FormControl({ value: '' }, Validators.compose([Validators.required])),
      valor: new FormControl({ value: 0 }, Validators.compose([Validators.required])),
      tipo: new FormControl({ value: '' }, Validators.compose([Validators.required])),
      finalidade: new FormControl({ value: '' }, Validators.compose([Validators.required])),
      status: new FormControl({ value: '' }, Validators.compose([Validators.required])),
      telefone: new FormControl({ value: '' }, Validators.compose([Validators.required]))
    });

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

  //ion-alert
  async presentAlertConfirm() {

    //validação do FORM
    let { proprietario,
          codigo,
          valor,
          tipo,
          finalidade,
          status,
          telefone
         } = this.MyForm.controls;

    if (!this.MyForm.valid) {
      if (!proprietario.valid) {
        this.errorStatus = true;
        this.message = "Preencha os Campos Obrigatórios";
      } else {
        this.message = "";
      }

      if (!status.valid) {
        this.errorTipo = true;
        this.message = "Preencha os Campos Obrigatórios";
      } else {
        this.message = "";
      }

      if (!valor.valid) {
        this.errorTipo = true;
        this.message = "Preencha os Campos Obrigatórios";
      } else {
        this.message = "";
      }

      if (!codigo.valid) {
        this.errorTipo = true;
        this.message = "Preencha os Campos Obrigatórios";
      } else {
        this.message = "";
      }

      if (!tipo.valid) {
        this.errorTipo = true;
        this.message = "Preencha os Campos Obrigatórios";
      } else {
        this.message = "";
      }

      if (!finalidade.valid) {
        this.errorTipo = true;
        this.message = "Preencha os Campos Obrigatórios";
      } else {
        this.message = "";
      }

      if (!telefone.valid) {
        this.errorTipo = true;
        this.message = "Preencha os Campos Obrigatórios";
      } else {
        this.message = "";
      }


    } else {
      const alert = await this.alertController.create({
        header: 'Confirmar',
        message: 'Deseja Salvar o Imóvel ?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'secondary',
            handler: (blah) => {
            }
          }, {
            text: 'Gravar',
            handler: () => {
              this.saveProduct();
            }
          }
        ]
      });

      await alert.present();
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