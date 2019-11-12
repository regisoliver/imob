import { Component, OnInit, ViewChild } from '@angular/core';
import { Http } from '@angular/http'
import { ProductService } from 'src/app/services/product.service';
import { ActivatedRoute } from '@angular/router';
import { Product } from 'src/app/interfaces/product';
import { NavController, LoadingController, ToastController, Platform } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription, Observable } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit {

  //data-picker product.aniversario
  customYearValues = [2019, 2016, 2008, 2004, 2000, 1996, 1980, 1974, 1970];
  customDayShortNames = ['s\u00f8n', 'man', 'tir', 'ons', 'tor', 'fre', 'l\u00f8r'];
  customPickerOptions: any;

  //sharing
  public mensagem: string;
  public fotos: any = {};
  public piscina: string;
  public lazer: string;
  public churrasqueira: string;

  //variaveis do Upload Images
  imageURL: string
  desc: string
  noFace: boolean = false
  imagemtotal: string

  scaleCrop: string = '-/scale_crop/200x200'

  effects = {
    effect1: '',
    effect2: '-/exposure/50/-/saturation/50/-/warmth/-30/',
    effect3: '-/filter/vevera/150/',
    effect4: '-/filter/carris/150/',
    effect5: '-/filter/misiara/150/'
  }
  activeEffect: string = this.effects.effect1

  @ViewChild('fileButton', { static: false }) fileButton

  public fGroup: FormGroup;
  message = "";
  errorStatus = false;
  errorTipo = false;

  private productId: string = null;
  public product: Product = {};
  private loading: any;
  private productSubscription: Subscription;

  constructor(
    public http: Http,
    private productService: ProductService,
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private toastCtrl: ToastController,
    public alertController: AlertController,
    public fBuilder: FormBuilder,
    public afs: AngularFirestore,
    public auth: AuthService,
    private afStorage: AngularFireStorage,
    private socialSharing: SocialSharing,
  ) {

    //form do details.page.ts
    this.fGroup = fBuilder.group({
      'id': [null],
      'status': [null, Validators.required],
      'codigo': [null],
      'tipo': [null, Validators.required],
      'dormitorios': [null, Validators.maxLength(2)],
      'suites': [null, Validators.maxLength(2)],
      'finalidade': [null, Validators.required],
      'valor_condominio': [null],
      'valor_iptu': [null],
      'valor': [null, Validators.required],
      'endereco': [null],
      'bairro': [null],
      'area_util': [null],
      'area_total': [null],
      'proprietario': [null, Validators.required],
      'telefone': [null, Validators.required],
      'permuta': [null],
      'aniversario': [null],
      'canal': [null],
      'visitas': [null],
      'detalhe_um': [null],
      'detalhe_dois': [null],
      'detalhe_tres': [null],
      'observacao': [null, Validators.compose([
        Validators.maxLength(250)
      ])],
      'data_entrada': [null],
      'corretor': [null],
      'images': [null]
    });

    this.productId = this.activatedRoute.snapshot.params['id'];
    console.log("acaba de receber o ID: ", this.productId); // mostra o ID
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

  //metodo cria mensagem de sharing
  criaMensagemSharing() {
    if (this.product.detalhe_um) {
      this.piscina = "Imovel com *Piscina*";
    }
    if (this.product.detalhe_dois) {
      this.lazer = "Imovel com *Area de Lazer*";
    }
    if (this.product.detalhe_tres) {
      this.churrasqueira = "Imovel com *Churrasqueira*";
    }

    this.mensagem = "*Imobiliária C.IMOB*\n\n"
      + "*Imovel:* " + this.product.tipo + "\n";
    if (this.product.bairro.length) {
      this.mensagem += "*Bairro:* " + this.product.bairro + "\n";
    }
    if (this.product.area_util != null) {
      this.mensagem += "*Área Util:* " + this.product.area_util + "\n";
    }
    if (this.product.area_total != null) {
      this.mensagem += "*Área Total:* " + this.product.area_total + "\n";
    }
    if (this.product.detalhe_um) {
      this.mensagem += this.piscina + "\n";
    }
    if (this.product.detalhe_dois) {
      this.mensagem += this.lazer + "\n";
    }
    if (this.product.detalhe_tres) {
      this.mensagem += this.churrasqueira + "\n";
    }
    if (this.product.valor_iptu != null) {
      this.mensagem += "*IPTU:* " + this.product.valor_iptu + "\n";
    }
    if (this.product.valor_condominio != null) {
      this.mensagem += "*Condomínio:* " + this.product.valor_condominio + "\n";
    }
    if (this.product.valor != null) {
      this.mensagem += "*Valor Imovel:* " + this.product.valor + "\n\n";
    }
    this.mensagem += "*Galeria de Imagens*\n";

    this.fotos = [];
    this.product.images.forEach(obj => (
      this.fotos.push(obj.trim().split(','))
    ));

    console.log(this.mensagem);
    console.log(this.fotos);
  }

  //Compartilhamento de imovel
  compartilharWpp() {
    if (this.productId) {
      this.criaMensagemSharing();
      this.socialSharing.shareViaWhatsApp(
        this.mensagem, "", this.fotos);
    } else {
      this.presentToast('Compartilhe um Imovel Cadastrado.');
    }
  }

  //metodos do Upload Images
  setSelected(effect: string) {
    console.log("fez o Selected")
    console.log(effect)
    this.activeEffect = this.effects[effect]
  }

  uploadFile() {
    console.log("fez o upload")
    this.ngOnInit();
    this.fileButton.nativeElement.click()
  }

  fileChanged(event) {
    console.log("fez o fileChanged")
    console.log(event)

    this.presentLoading();

    const files = event.target.files
    console.log("event target name: ", files[0].name);

    const data2 = new String;

    const data = new FormData()
    data.append('file', files[0])
    data.append('UPLOADCARE_STORE', '1')
    data.append('UPLOADCARE_PUB_KEY', 'fd95da9399e52e4f97e0')

    this.http.post('https://upload.uploadcare.com/base/', data)
      .subscribe(event => {
        this.imageURL = event.json().file
        console.log("Subscribe mostrando imageURL: ", this.imageURL);

        this.imagemtotal = "https://ucarecdn.com/" + this.imageURL + "/" + files[0].name;
        console.log("imagemtotal: ", this.imagemtotal);

        if (this.product.images == null) {
          this.product.images = [];
        }
        this.product.images.push(this.imagemtotal)
        console.log("this.product.images com push: ", this.product.images);
        this.carregaProductToFGroup();

        this.loading.dismiss();
      })
  }

  //metodo de teste do form
  submitForm() {
    console.log(this.fGroup.value);
    this.product.images.pop();
  }

  //ion-alert Salvar Produto
  async presentAlertSalvarProduto() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: 'Deseja Salvar o Imóvel ?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
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

  //ion-alert Delete foto Array
  async presentAlertDeleteArrayFoto(id) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: 'Deletar a imagem ?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
          }
        }, {
          text: 'Deletar',
          handler: () => {
            this.deleteProductImage(id);
          }
        }
      ]
    });

    await alert.present();

  }

  criaConstanteProducts() {
    const prod: Product = {
      //id: this.product.id,
      status: this.product.status,
      codigo: this.product.codigo,
      tipo: this.product.tipo,
      dormitorios: this.product.dormitorios,
      suites: this.product.suites,
      finalidade: this.product.finalidade,
      valor_condominio: this.product.valor_condominio,
      valor_iptu: this.product.valor_iptu,
      valor: this.product.valor,
      endereco: this.product.endereco,
      bairro: this.product.bairro,
      area_util: this.product.area_util,
      area_total: this.product.area_total,
      proprietario: this.product.proprietario,
      telefone: this.product.telefone,
      permuta: this.product.permuta,
      aniversario: this.product.aniversario,
      canal: this.product.canal,
      visitas: this.product.visitas,
      detalhe_um: this.product.detalhe_um,
      detalhe_dois: this.product.detalhe_dois,
      detalhe_tres: this.product.detalhe_tres,
      observacao: this.product.observacao,
      images: this.product.images,
      corretor: this.product.corretor,
      data_entrada: this.product.data_entrada
    }

    Object.keys(prod).forEach(key => {
      if (prod[key] === undefined) {
        prod[key] = null;
      }
    });

    return prod;
  }

  carregaProductToFGroup() {
    //this.product.id = this.productId;
    this.product.status = this.fGroup.value['status'];
    this.product.codigo = this.fGroup.value['codigo'];
    this.product.tipo = this.fGroup.value['tipo'];
    this.product.dormitorios = this.fGroup.value['dormitorios'];
    this.product.suites = this.fGroup.value['suites'];
    this.product.finalidade = this.fGroup.value['finalidade'];
    this.product.valor_condominio = this.fGroup.value['valor_condominio'];
    this.product.valor_iptu = this.fGroup.value['valor_iptu'];
    this.product.valor = this.fGroup.value['valor'];
    this.product.endereco = this.fGroup.value['endereco'];
    this.product.bairro = this.fGroup.value['bairro'];
    this.product.area_util = this.fGroup.value['area_util'];
    this.product.area_total = this.fGroup.value['area_total'];
    this.product.proprietario = this.fGroup.value['proprietario'];
    this.product.telefone = this.fGroup.value['telefone'];
    this.product.permuta = this.fGroup.value['permuta'];
    this.product.aniversario = this.fGroup.value['aniversario'];
    this.product.canal = this.fGroup.value['canal'];
    this.product.visitas = this.fGroup.value['visitas'];
    this.product.detalhe_um = this.fGroup.value['detalhe_um'];
    this.product.detalhe_dois = this.fGroup.value['detalhe_dois'];
    this.product.detalhe_tres = this.fGroup.value['detalhe_tres'];
    this.product.observacao = this.fGroup.value['observacao'];
    this.product.corretor = this.authService.getAuth().currentUser.uid;
  }

  ngOnInit() {
    setTimeout(() => {
      //this.fGroup.get('id').setValue(this.productId);
      this.fGroup.get('status').setValue(this.product.status);
      this.fGroup.get('codigo').setValue(this.product.codigo);
      this.fGroup.get('tipo').setValue(this.product.tipo);
      this.fGroup.get('dormitorios').setValue(this.product.dormitorios);
      this.fGroup.get('suites').setValue(this.product.suites);
      this.fGroup.get('finalidade').setValue(this.product.finalidade);
      this.fGroup.get('valor_condominio').setValue(this.product.valor_condominio);
      this.fGroup.get('valor_iptu').setValue(this.product.valor_iptu);
      this.fGroup.get('valor').setValue(this.product.valor);
      this.fGroup.get('endereco').setValue(this.product.endereco);
      this.fGroup.get('bairro').setValue(this.product.bairro);
      this.fGroup.get('area_util').setValue(this.product.area_util);
      this.fGroup.get('area_total').setValue(this.product.area_total);
      this.fGroup.get('proprietario').setValue(this.product.proprietario);
      this.fGroup.get('telefone').setValue(this.product.telefone);
      this.fGroup.get('permuta').setValue(this.product.permuta);
      this.fGroup.get('aniversario').setValue(this.product.aniversario);
      this.fGroup.get('canal').setValue(this.product.canal);
      this.fGroup.get('visitas').setValue(this.product.visitas);
      this.fGroup.get('detalhe_um').setValue(this.product.detalhe_um);
      this.fGroup.get('detalhe_dois').setValue(this.product.detalhe_dois);
      this.fGroup.get('detalhe_tres').setValue(this.product.detalhe_tres);
      this.fGroup.get('observacao').setValue(this.product.observacao);
    }, 200);
  }

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

    if (this.productId) {
      try {
        this.carregaProductToFGroup();
        //this.product.foto = JSON.stringify(this.product.images);

        //this.product.images = [];
        const produto = this.criaConstanteProducts();
        await this.productService.updateProduct(this.productId, produto);
        await this.loading.dismiss();

        this.navCtrl.navigateBack('/home');
      } catch (error) {
        this.presentToast('Erro ao tentar salvar');
        this.loading.dismiss();
      }
    } else {
      this.product.data_entrada = new Date().getTime();

      try {
        this.carregaProductToFGroup();
        //this.product.foto = JSON.stringify(this.product.images);
        //console.log("json: ", this.product.foto);

        //this.product.images = [];
        const produto = this.criaConstanteProducts();
        console.log("PROD: ", produto);

        await this.productService.addProduct(produto);
        await this.loading.dismiss();

        this.presentToast('Cadastrado com Suesso.');
        this.navCtrl.navigateBack('/home');
      } catch (error) {
        this.presentToast('Erro ao tentar salvar');
        console.log(error)
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

  //deleta as imagens do Array
  async deleteProductImage(id: any) {
    try {
      Object.keys(this.product.images).forEach(key => {
        if (key.toString() == id) {
          this.product.images.splice(id, 1);
        }
      });
    } catch (error) {
      this.presentToast('Erro ao tentar deletar');
    }
  }
}