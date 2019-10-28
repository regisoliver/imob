import { Component, OnInit, ViewChild } from '@angular/core';
import { Http } from '@angular/http'
import { ProductService } from 'src/app/services/product.service';
import { ActivatedRoute } from '@angular/router';
import { Product } from 'src/app/interfaces/product';
import { NavController, LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { firestore } from 'firebase';

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

  //variaveis do Upload Images
  imageURL: string
	desc: string
  noFace: boolean = false
  
  scaleCrop: string = '-/scale_crop/200x200'
	
	effects = {
		effect1: '',
		effect2: '-/exposure/50/-/saturation/50/-/warmth/-30/',
		effect3: '-/filter/vevera/150/',
		effect4: '-/filter/carris/150/',
		effect5: '-/filter/misiara/150/'
  }
  activeEffect: string = this.effects.effect1
  
  @ViewChild('fileButton', {static: false}) fileButton

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
    public auth: AuthService
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
      'corretor': [null]
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

  async createPost() {
		await this.presentLoading();

		const image = this.product.imageURL
		const activeEffect = this.activeEffect
		const desc = this.desc

		this.afs.doc(`users/${this.auth.getUID()}`).update({
			posts: firestore.FieldValue.arrayUnion(`${image}/${activeEffect}`)
		})

		this.afs.doc(`posts/${image}`).set({
			desc,
			author: this.auth.getAuth.name,
			likes: [],
			effect: activeEffect
		})
		
		this.loading.dismiss();
		this.imageURL = ""
		this.desc = ""

		const alert = await this.alertController.create({
			header: 'Done',
			message: 'Your post was created!',
			buttons: ['Cool!']
		})

		await alert.present()
	}

  //metodos do Upload Images
	setSelected(effect: string) {
    console.log("fez o Selected")
    console.log(effect)
		this.activeEffect = this.effects[effect]
	}

	uploadFile() {
    console.log("fez o upload")
    console.log(this.product.imageURL)
		this.fileButton.nativeElement.click()
	}

	fileChanged(event) {
    console.log("fez o fileChanged")
    console.log(event)
		
		this.presentLoading();

		const files = event.target.files
		
		const data = new FormData()
		data.append('file', files[0])
		data.append('UPLOADCARE_STORE', '1')
		data.append('UPLOADCARE_PUB_KEY', 'fd95da9399e52e4f97e0')
		
		this.http.post('https://upload.uploadcare.com/base/', data)
		.subscribe(event => {
			console.log(event)
			this.product.imageURL = event.json().file
			this.loading.dismiss();
			this.http.get(`https://ucarecdn.com/${this.product.imageURL}/detect_faces/`)
			.subscribe(event => {
				this.noFace = event.json().faces == 0
			})
		})
	}

  //metodo de teste do form
  submitForm() {
    console.log(this.fGroup.value);
  }

  //ion-alert
  async presentAlertConfirm() {

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

  carregaProductToFGroup(){
    this.product.id = this.productId;
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
  }

  ngOnInit() {
    setTimeout(() =>{
      this.fGroup.get('id').setValue(this.productId);
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
    }, 300);
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

    this.product.corretor = this.authService.getAuth().currentUser.uid;
    this.fGroup.get('corretor').setValue(this.authService.getAuth().currentUser.uid);

    if (this.productId) {
      try {
        this.carregaProductToFGroup();
        console.log("Atualização: ", this.product);
        console.log(this.fGroup.value);
        await this.productService.updateProduct(this.productId, this.product);
        await this.loading.dismiss();

        this.navCtrl.navigateBack('/home');
      } catch (error) {
        this.presentToast('Erro ao tentar salvar');
        this.loading.dismiss();
      }
    } else {
      this.product.data_entrada = new Date().getTime();
      this.fGroup.get('data_entrada').setValue(new Date().getTime());

      try {
        this.carregaProductToFGroup();
        console.log("NOVO: ", this.product);
        console.log(this.fGroup.value);
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