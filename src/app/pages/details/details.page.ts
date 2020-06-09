import { Component, OnInit, ViewChild } from '@angular/core';
import { Http } from '@angular/http'
import { ProductService } from 'src/app/services/product.service';
import { ActivatedRoute } from '@angular/router';
import { Product } from 'src/app/interfaces/product';
import { User } from 'src/app/interfaces/user';
import { NavController, LoadingController, ToastController, Platform, ActionSheetController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription, Observable } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { File, FileEntry } from '@ionic-native/file/ngx';
// import { Camera, CameraOptions, CameraPopoverOptions } from '@ionic-native/camera/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { ImagePicker, ImagePickerOptions } from '@ionic-native/image-picker/ngx';
import { MediaCapture, MediaFile, CaptureError } from '@ionic-native/media-capture/ngx';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { StreamingMedia } from '@ionic-native/streaming-media/ngx';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';

const MEDIA_FOLDER_NAME = 'my_media';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit {

  //image-picker
  imageResponse: any;
  options: any;
  files = [];

  //data-picker product.aniversario
  customYearValues = [2019, 2016, 2008, 2004, 2000, 1996, 1980, 1974, 1970];
  customDayShortNames = ['s\u00f8n', 'man', 'tir', 'ons', 'tor', 'fre', 'l\u00f8r'];
  customPickerOptions: any;

  //sharing
  public mensagem: string;
  public fotos: string[];
  public piscina: string;
  public lazer: string;
  public churrasqueira: string;
  public area_gourmet: string;
  public videofinal: any = {};
  public id: string = null;
  public primeiraFoto: string;
  public buttonDisabled: any;

  //variaveis do Upload Images
  imageURL: string
  desc: string
  noFace: boolean = false
  imagemtotal: string
  video: string;
  images: any = [];

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
  public usuario: User = {};
  public userID: string;
  public logado: User = {};
  public todosUsers = new Array<User>();
  public userFixo: string;
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
    private socialSharing: SocialSharing,
    public file: File,
    public imagePicker: ImagePicker,
    // public camera: Camera,
    public filepath: FilePath,
    private media: Media,
    private mediaCapture: MediaCapture,
    private streamingMedia: StreamingMedia,
    private photoViewer: PhotoViewer,
    private actionSheetController: ActionSheetController,
    private plt: Platform
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
      'valor': [null],
      'valor_locacao': [null],
      'endereco': [null],
      'bairro': [null],
      'area_util': [null],
      'area_total': [null],
      'proprietario': [null, Validators.required],
      'telefone': [null],
      'celular': [null],
      'permuta': [null],
      'aniversario': [null],
      'canal': [null],
      'visitas': [null],
      'detalhe_um': [null],
      'detalhe_dois': [null],
      'detalhe_tres': [null],
      'detalhe_quatro': [null],
      'observacao': [null, Validators.compose([
        Validators.maxLength(250)
      ])],
      'data_entrada': [null],
      'corretor': [null],
      'images': [null],
      'video': [null]
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

  //metodo cria mensagem de sharing
  criaMensagemSharing() {
    if (this.product.detalhe_um) {
      this.piscina = "*Imovel com Piscina*";
    }
    if (this.product.detalhe_dois) {
      this.lazer = "*Imovel com Area de Lazer*";
    }
    if (this.product.detalhe_tres) {
      this.churrasqueira = "*Imovel com Churrasqueira*";
    }
    if (this.product.detalhe_quatro) {
      this.area_gourmet = "*Imovel com Área Gourmet*";
    }

    this.mensagem = "*Imobiliária C.IMOB*\n\n"
      + "*Imovel:* " + this.product.tipo + "\n";
    if (this.product.bairro.length) {
      this.mensagem += "*Bairro:* " + this.product.bairro + "\n";
    }
    if (this.product.area_util != null) {
      this.mensagem += "*Área Util:* " + this.product.area_util + " m²\n";
    }
    if (this.product.area_total != null) {
      this.mensagem += "*Área Total:* " + this.product.area_total + " m²\n";
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
    if (this.product.detalhe_quatro) {
      this.mensagem += this.area_gourmet + "\n";
    }
    if (this.product.valor_iptu != null) {
      this.mensagem += "*IPTU:* " + this.product.valor_iptu + "\n";
    }
    if (this.product.valor_condominio != null) {
      this.mensagem += "*Condomínio:* " + this.product.valor_condominio + "\n";
    }
    if (this.product.valor != null) {
      this.mensagem += "*Valor Venda:* " + this.product.valor + "\n\n";
    }
    if (this.product.valor_locacao != null) {
      this.mensagem += "*Valor Locação:* " + this.product.valor_locacao + "\n\n";
    }

    this.fotos = [];
    //this.product.foto = JSON.stringify(this.product.images);
    if (this.product.images != null || this.product.images != undefined) {
      this.product.images.forEach(obj => {
        //this.fotos.push(obj.trim().replace(',', " "));
        this.fotos.push(obj.trim() + " \n\n");
        //this.fotos.push(JSON.stringify(obj));
        //this.fotos.push(obj.trim());
        console.log("1::", obj);
        console.log("2::", this.fotos);
      });
    }
    if (this.fotos.length) {
      this.primeiraFoto = this.fotos[0];
    } else {
      this.primeiraFoto = "https://ucarecdn.com/bd144f77-1aed-4458-a73d-9abbf2b41d7a/logooriginal.jpeg";
    }

    console.log(this.mensagem);
    console.log(this.fotos);
    console.log(this.product.video);
    console.log("Primeira foto: ", this.primeiraFoto);
  }

  //Compartilhamento de imovel
  async compartilharWpp() {
    await this.presentLoading();
    if (this.productId) {
      this.criaMensagemSharing();

      if (this.product.video == undefined || this.product.video == null) {
        if (this.fotos == undefined || this.fotos == null) {
          this.socialSharing.share(this.mensagem, "", this.primeiraFoto, "");
        } else {
          this.socialSharing.share(this.mensagem, "", this.primeiraFoto, this.fotos.toString());
        }
      } else if (this.fotos == undefined || this.fotos == null) {
        this.socialSharing.share(this.mensagem, "", this.product.video, "");
      } else {
        this.socialSharing.share(this.mensagem, "", this.product.video, this.fotos.toString());
      }
      await this.loading.dismiss();
    } else {
      await this.loading.dismiss();
      this.presentToast('<b>Compartilhe um Imóvel Cadastrado.</b>');
    }
  }

  //metodos do Upload Images
  setSelected(effect: string) {
    console.log("fez o Selected")
    console.log(effect)
    this.activeEffect = this.effects[effect]
  }

  uploadFile() {
    this.fileButton.nativeElement.click()
    // this.fileButton.nativeElement.imagePicker()
  }

  fileChanged(event) {
    console.log("fez o fileChanged")

    this.presentLoading();

    this.carregaFGroupToProducts();
    console.log("this.product 1: ", this.product);

    const files = event.target.files
    // const files = event.target.fotos
    let Array = files[0].name.split(".");
    let nomeFinal = Array[Array.length - 1].toUpperCase();
    console.log("nomeFinal: ", nomeFinal);

    const data = new FormData()
    data.append('file', files[0])
    data.append('UPLOADCARE_STORE', '1')
    data.append('UPLOADCARE_PUB_KEY', 'fd95da9399e52e4f97e0')

    if (nomeFinal == "JPG" || nomeFinal == "JPEG" || nomeFinal == "PNG" || nomeFinal == "BMP") {
      try {
        this.http.post('https://upload.uploadcare.com/base/', data)
          .subscribe(event => {
            this.imageURL = event.json().file
            console.log("Subscribe mostrando imageURL: ", this.imageURL);

            this.imagemtotal = "https://ucarecdn.com/" + this.imageURL + "/" + files[0].name;
            console.log("imagemtotal: ", this.imagemtotal);

            if (this.product.images == null) {
              this.product.images = [];
            }
            this.product.images.push(this.imagemtotal);

            /*
            if (this.productId) {
              if (this.logado.isAdmin == false && this.logado.codigo != this.product.corretor) {
                console.log("finally 1: ", this.fGroup.get('proprietario'));
                this.fGroup.get('proprietario').setValue(null);
                this.fGroup.get('telefone').setValue(null);
                this.fGroup.get('celular').setValue(null);
              }
            }
            */

            this.loading.dismiss();
          })
      } catch (error) {
        console.log("entrou no erro de foto");
        console.error(error);
      }
    } else {
      console.log("entrou no 2 fluxo");
      try {
        this.http.post('https://upload.uploadcare.com/base/', data)
          .subscribe(event => {
            this.imageURL = event.json().file
            this.product.video = "https://ucarecdn.com/" + this.imageURL + "/" + files[0].name;
            this.video = files[0].name;
            console.log("pegou o video", this.video);
            /*
            if (this.productId) {
              if (this.logado.isAdmin == false && this.logado.codigo != this.product.corretor) {
                console.log("finally 2: ", this.fGroup.get('proprietario'));
                this.fGroup.get('proprietario').setValue(null);
                this.fGroup.get('telefone').setValue(null);
                this.fGroup.get('celular').setValue(null);
              }
            }
            */

            this.loading.dismiss();
          })
      } catch (error) {
        console.log("entrou no erro de video");
        let message: string;

        switch (error.code) {
          case 'Uploading of these files types is not allowed on your current plan.':
            message = 'Extensão não suportada';
            break;

          case 'Bad Request':
            message = 'Extensão não suportada';
            break;

          case 'File is too large.':
            message = 'File is too large.';
            break;
        }
        switch (error.statusText) {
          case 'Bad Request':
            message = 'Extensão não suportada';
            break;
        }
        switch (error._body) {
          case 'File is too large.':
            message = 'File is too large.';
            break;
        }

        if (message == null || message == "") {
          message = "Erro ao adicionar esta extenção";
          this.presentToast(message);
        }

        console.error(error);
        this.presentToast(message);
        this.loading.dismiss();
      } finally {
        this.loading.dismiss();
      }
    }

    this.loading.dismiss();

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

  //ion-alert Delete VIDEO
  async presentAlertDeleteVideo() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: 'Deletar o Vídeo ?',
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
            this.deleteVideo();
          }
        }
      ]
    });

    await alert.present();

  }

  criaConstanteProducts() {
    const prod: Product = {
      status: this.product.status,
      codigo: this.product.codigo,
      tipo: this.product.tipo,
      dormitorios: this.product.dormitorios,
      suites: this.product.suites,
      finalidade: this.product.finalidade,
      valor_condominio: this.product.valor_condominio,
      valor_iptu: this.product.valor_iptu,
      valor: this.product.valor,
      valor_locacao: this.product.valor_locacao,
      endereco: this.product.endereco,
      bairro: this.product.bairro,
      area_util: this.product.area_util,
      area_total: this.product.area_total,
      proprietario: this.product.proprietario,
      telefone: this.product.telefone,
      celular: this.product.celular,
      permuta: this.product.permuta,
      aniversario: this.product.aniversario,
      canal: this.product.canal,
      visitas: this.product.visitas,
      detalhe_um: this.product.detalhe_um,
      detalhe_dois: this.product.detalhe_dois,
      detalhe_tres: this.product.detalhe_tres,
      detalhe_quatro: this.product.detalhe_quatro,
      observacao: this.product.observacao,
      images: this.product.images,
      corretor: this.product.corretor,
      data_entrada: this.product.data_entrada,
      video: this.product.video
    }

    Object.keys(prod).forEach(key => {
      if (prod[key] === undefined) {
        prod[key] = null;
      }
    });

    return prod;
  }

  carregaFGroupToProducts() {
    this.product.status = this.fGroup.value['status'];
    this.product.codigo = this.fGroup.value['codigo'];
    this.product.tipo = this.fGroup.value['tipo'];
    this.product.dormitorios = this.fGroup.value['dormitorios'];
    this.product.suites = this.fGroup.value['suites'];
    this.product.finalidade = this.fGroup.value['finalidade'];
    this.product.valor_condominio = this.fGroup.value['valor_condominio'];
    this.product.valor_iptu = this.fGroup.value['valor_iptu'];
    this.product.valor = this.fGroup.value['valor'];
    this.product.valor_locacao = this.fGroup.value['valor_locacao'];
    this.product.endereco = this.fGroup.value['endereco'];
    this.product.bairro = this.fGroup.value['bairro'];
    this.product.area_util = this.fGroup.value['area_util'];
    this.product.area_total = this.fGroup.value['area_total'];
    this.product.proprietario = this.fGroup.value['proprietario'];
    this.product.telefone = this.fGroup.value['telefone'];
    this.product.celular = this.fGroup.value['celular'];
    this.product.permuta = this.fGroup.value['permuta'];
    this.product.aniversario = this.fGroup.value['aniversario'];
    this.product.canal = this.fGroup.value['canal'];
    this.product.visitas = this.fGroup.value['visitas'];
    this.product.detalhe_um = this.fGroup.value['detalhe_um'];
    this.product.detalhe_dois = this.fGroup.value['detalhe_dois'];
    this.product.detalhe_tres = this.fGroup.value['detalhe_tres'];
    this.product.detalhe_quatro = this.fGroup.value['detalhe_quatro'];
    this.product.observacao = this.fGroup.value['observacao'];
    //this.product.corretor = this.authService.getAuth().currentUser.uid;
  }

  ngOnInit() {
    this.plt.ready().then(() => {
      let path = this.file.dataDirectory;
      // this.file.checkDir(path, MEDIA_FOLDER_NAME).then( result =>{

      // }, err =>{

      // })
      this.loadFiles();
    }, err => {
      // this.file.createDir(path, MEDIA_FOLDER_NAME)
    });

    setTimeout(() => {
      if (this.product.corretor) this.loadUser();
      this.getTotalUsers();
      this.loadLogado();

      this.fGroup.get('status').setValue(this.product.status);
      this.fGroup.get('codigo').setValue(this.product.codigo);
      this.fGroup.get('tipo').setValue(this.product.tipo);
      this.fGroup.get('dormitorios').setValue(this.product.dormitorios);
      this.fGroup.get('suites').setValue(this.product.suites);
      this.fGroup.get('finalidade').setValue(this.product.finalidade);
      this.fGroup.get('valor_condominio').setValue(this.product.valor_condominio);
      this.fGroup.get('valor_iptu').setValue(this.product.valor_iptu);
      this.fGroup.get('valor').setValue(this.product.valor);
      this.fGroup.get('valor_locacao').setValue(this.product.valor_locacao);
      this.fGroup.get('endereco').setValue(this.product.endereco);
      this.fGroup.get('bairro').setValue(this.product.bairro);
      this.fGroup.get('area_util').setValue(this.product.area_util);
      this.fGroup.get('area_total').setValue(this.product.area_total);
      this.fGroup.get('proprietario').setValue(this.product.proprietario);
      this.fGroup.get('telefone').setValue(this.product.telefone);
      this.fGroup.get('celular').setValue(this.product.celular);
      this.fGroup.get('permuta').setValue(this.product.permuta);
      this.fGroup.get('aniversario').setValue(this.product.aniversario);
      this.fGroup.get('canal').setValue(this.product.canal);
      this.fGroup.get('visitas').setValue(this.product.visitas);
      this.fGroup.get('detalhe_um').setValue(this.product.detalhe_um);
      this.fGroup.get('detalhe_dois').setValue(this.product.detalhe_dois);
      this.fGroup.get('detalhe_tres').setValue(this.product.detalhe_tres);
      this.fGroup.get('detalhe_quatro').setValue(this.product.detalhe_quatro);
      this.fGroup.get('observacao').setValue(this.product.observacao);
      if (this.product.video != null) {
        this.video = this.product.video;
        let Array = this.video.trim().split('/');
        this.video = Array[Array.length - 1];
        console.log(this.video);
      }
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

  loadUser() {
    this.productSubscription = this.productService.getUser(this.product.corretor).subscribe(data => {
      this.usuario = data;
      this.userFixo = data.nome;
    });
  }

  loadLogado() {
    this.productService.getUser(this.authService.getAuth().currentUser.uid).subscribe(data => {
      this.logado = data;
      console.log("dentro do load logado:", this.logado.isAdmin);
      if (this.productId) {
        if (this.product.corretor != this.logado.codigo) {
          if (this.logado.isAdmin == false) {
            this.fGroup.get('proprietario').setValue(null);
            this.fGroup.get('telefone').setValue(null);
            this.fGroup.get('celular').setValue(null);
            this.buttonDisabled = true;
            console.log("disabled:", this.buttonDisabled);
          }
        }
      }

    });
  }

  getTotalUsers() {
    this.productService.getUsers().subscribe(data => {
      this.todosUsers = data;
    });
  }

  alteraUser() {
    this.todosUsers.forEach(doc => {
      if (doc.nome == this.usuario.nome) {
        this.userID = doc.codigo;
        this.usuario = doc;
        console.log("alterado usuario: ", this.usuario);
      }
    });
  }

  volta3FGroup() {
    this.fGroup.get('proprietario').setValue(this.product.proprietario);
    this.fGroup.get('telefone').setValue(this.product.telefone);
    this.fGroup.get('celular').setValue(this.product.celular);
  }

  async saveProduct() {
    await this.presentLoading();

    if (this.productId) {
      this.loadProduct();
      this.volta3FGroup();
      if (this.logado.isAdmin == true) {
        if (this.usuario.nome == "null") {
          this.carregaFGroupToProducts();
          const produto = this.criaConstanteProducts();
          produto.corretor = this.authService.getAuth().currentUser.uid;
          console.log("PROD 1: ", this.usuario);
          console.log("PROD 1: ", produto);
          await this.productService.updateProduct(this.productId, produto);

          await this.loading.dismiss();
          this.presentToast("<b> ★ Cadastrado com Sucesso.</b>");
          this.navCtrl.navigateBack('/home');
        } else {
          this.carregaFGroupToProducts();
          const produto = this.criaConstanteProducts();
          this.alteraUser();
          produto.corretor = this.usuario.codigo;
          console.log("PROD 2: ", this.usuario);
          console.log("PROD 2: ", produto);
          await this.productService.updateProduct(this.productId, produto);

          await this.loading.dismiss();
          this.presentToast("<b> ★ Cadastrado com Sucesso.</b>");
          this.navCtrl.navigateBack('/home');
        }
      } else if (this.logado.codigo == this.product.corretor) {
        this.carregaFGroupToProducts();
        const produto = this.criaConstanteProducts();
        produto.corretor = this.authService.getAuth().currentUser.uid;
        await this.productService.updateProduct(this.productId, produto);
        console.log("novo PROD: ", this.usuario);
        console.log("novo PROD: ", produto);

        await this.loading.dismiss();
        this.presentToast("<b> ★ Cadastrado com Sucesso.</b>");
        this.navCtrl.navigateBack('/home');
      } else {
        this.presentToast('<b> ★ Você não pode Alterar esse Imóvel</b>');
        this.loading.dismiss();
      }
    } else {
      this.product.data_entrada = new Date().getTime();
      try {
        this.carregaFGroupToProducts();

        if (this.logado.isAdmin == true) {
          if (this.usuario.nome == "null") {
            const produto = this.criaConstanteProducts();
            produto.corretor = this.authService.getAuth().currentUser.uid;
            console.log("iqual novo PROD: ", this.usuario);
            console.log("iqual novo PROD: ", produto);
            await this.productService.addProduct(produto);

            await this.loading.dismiss();
            this.presentToast("<b> ★ Cadastrado com Sucesso.</b>");
            this.navCtrl.navigateBack('/home');
          } else {
            const produto = this.criaConstanteProducts();
            this.alteraUser();
            produto.corretor = this.usuario.codigo;
            console.log("iqual novo PROD: ", this.usuario);
            console.log("iqual novo PROD: ", produto);
            await this.productService.addProduct(produto);

            await this.loading.dismiss();
            this.presentToast("<b> ★ Cadastrado com Sucesso.</b>");
            this.navCtrl.navigateBack('/home');
          }
        } else {
          const produto = this.criaConstanteProducts();
          produto.corretor = this.authService.getAuth().currentUser.uid;
          await this.productService.addProduct(produto);
          console.log("novo PROD: ", this.usuario);
          console.log("novo PROD: ", produto);

          await this.loading.dismiss();
          this.presentToast("<b> ★ Cadastrado com Sucesso.</b>");
          this.navCtrl.navigateBack('/home');
        }

        await this.loading.dismiss();
      } catch (error) {
        console.log(error);
        console.error(error);
        this.presentToast('Erro ao tentar salvar');
        await this.loading.dismiss();
      }
    }
  }

  async presentLoading() {
    this.loading = await this.loadingCtrl.create({ message: 'Aguarde...' });
    return this.loading.present();
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      position: 'middle',
      duration: 4000
    });
    toast.present();
  }

  //deleta as imagens do Array
  async deleteProductImage(id: any) {
    await this.presentLoading();
    try {
      Object.keys(this.product.images).forEach(key => {
        if (key.toString() == id) {
          this.product.images.splice(id, 1);
        }
      });
      await this.loading.dismiss();
    } catch (error) {
      await this.loading.dismiss();
      this.presentToast('Erro ao tentar deletar');
    }
  }

  async deleteVideo() {
    await this.presentLoading();
    this.video = null;
    this.product.video = null;
    await this.loading.dismiss();
  }

  // pickMultipleImages() {
  //   let options: ImagePickerOptions = {
  //     maximumImagesCount: 50,
  //     height: 700,
  //     width: 700
  //   }

  //   this.imagePicker.getPictures(options).then((results) => {
  //     for (var i = 0; i < results.length; i++) {
  //       console.log('Image URI: ' + results[i]);
  //     }
  //   }, (err) => { });
  // }

  getImages() {
    let options: ImagePickerOptions = {
      // Android only. Max images to be selected, defaults to 15. If this is set to 1, upon
      // selection of a single image, the plugin will return it.
      maximumImagesCount: 3,

      // max width and height to allow the images to be.  Will keep aspect
      // ratio no matter what.  So if both are 800, the returned image
      // will be at most 800 pixels wide and 800 pixels tall.  If the width is
      // 800 and height 0 the image will be 800 pixels wide if the source
      // is at least that wide.
      width: 200,
      //height: 200,

      // quality of resized image, defaults to 100
      quality: 25

      // output type, defaults to FILE_URIs.
      // available options are 
      // window.imagePicker.OutputType.FILE_URI (0) or 
      // window.imagePicker.OutputType.BASE64_STRING (1)
      // outputType: 1
    };
    this.imageResponse = [];
    this.imagePicker.requestReadPermission().then(result => {
      if (result) {
        this.imagePicker.getPictures(options).then((results) => {
          if (results) {
            for (var i = 0; i < results.length; i++) {
              this.imageResponse.push('data:image/jpeg;base64,' + results[i]);
            }
          }
        }, (err) => {
          this.presentToast(err);
        });
      }

    })

  }

  // testeImagens() {
  //   var options: ImagePickerOptions = {
  //     maximumImagesCount: 10,
  //     height: 100,
  //     width: 100
  //   };

  //   this.options = {
  //     maximumImagesCount: 50,
  //     height: 250,
  //     width: 250
  //   }
  //   this.imagePicker.requestReadPermission();
  //   let permission;
  //   if(this.imagePicker.requestReadPermission()){
  //     this.imagePicker.getPictures(options).then((results) => {
  //       for (var i = 0; i < results.length; i++) {
  //           console.log('Image URI: ' + results[i]);
  //       }
  //     }, (err) => { });
  //   }
  // }

  openFile(f: FileEntry){
    if(f.name.indexOf('.wav') > -1){
      const path = f.nativeURL.replace(/^file:\/\//, '');
      const audioFile: MediaObject = this.media.create(path);
      audioFile.play();
    } else if(f.name.indexOf('.MOV') > -1 || f.name.indexOf('.mp4') > -1) {
      this.streamingMedia.playVideo(f.nativeURL);
    } else if(f.name.indexOf('.jpg') > -1) {
      this.photoViewer.show(f.nativeURL, 'Minha Imagem');
    }
  }

  deleteFile(f: FileEntry){
    const path = f.nativeURL.substr(0, f.nativeURL.lastIndexOf('/') +1);

    this.file.removeFile(path, f.name).then(() => {
      this.loadFiles();
    }, err => console.log('error remove: ', err));
  }

  loadFiles(){
    // this.file.listDir(this.file.dataDirectory).then( res =>{
    //   this.files = res;
    //   console.log('files: ', res);
    // });
  }

  copyFileToLocalDir(fullPath) {
    console.log('copy now: ', fullPath);
    let myPath = fullPath;
    if (fullPath.indexOf('file://') < 0) {
      myPath = 'file://' + fullPath;
    }

    const ext = myPath.split('.').pop();
    const d = Date.now();
    const newName = `${d}.${ext}`;

    const name = myPath.substr(myPath.lastIndexOf('/') + 1);
    const copyFrom = myPath.substr(0, myPath.lastIndexOf('/') +1);
    const copyTo = this.file.dataDirectory + MEDIA_FOLDER_NAME;

    this.file.copyFile(copyFrom, name, copyTo, newName).then(() => {
      this.loadFiles();
    }, err => console.log('error: ', err))
  }

  pickImages() {
    this.imagePicker.getPictures({}).then(results => {
      console.log('images: ', results);
      for (let result of results) {
        this.copyFileToLocalDir(result);
      }
    })
  }

  async selectMedia() {
    const actionSheet = await this.actionSheetController.create({
      header: 'O que você quer Adicionar?',
      buttons: [
        {
          text: 'Capturar Images',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            // this.uploadFile();
          }
        }, {
          text: 'Multiple Images',
          icon: 'images-outline',
          handler: () => {
            this.pickImages();
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }


}