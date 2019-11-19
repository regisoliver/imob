import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastController, ModalController, LoadingController, AlertController } from '@ionic/angular';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';
import { ProductService } from 'src/app/services/product.service';
import { Http } from '@angular/http';

@Component({
  selector: 'app-modal-perfil',
  templateUrl: './modal-perfil.page.html',
  styleUrls: ['./modal-perfil.page.scss'],
})
export class ModalPerfilPage implements OnInit {

  public userSubscription: Subscription;
  message = "";
  private loading: any;

  public id: string = null;
  public usuario: User = {};

  //variaveis do Upload Images
  imageURL: string

  @ViewChild('fileButton', { static: false }) fileButton

  constructor(
    public http: Http,
    private modalCrtl: ModalController,
    public authService: AuthService,
    private toastCtrl: ToastController,
    private userService: ProductService,
    private loadingCtrl: LoadingController,
    public alertController: AlertController
  ) {
    this.id = this.authService.getAuth().currentUser.uid;
    if (this.id) this.loadUser();
  }

  ngOnInit() {
  }

  close() {
    this.modalCrtl.dismiss();
  }

  loadUser() {
    this.userSubscription = this.userService.getUser(this.id).subscribe(data => {
      this.usuario = data;
    });
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
    let Array = files[0].name.split(".");
    let nomeFinal = Array[Array.length - 1].toUpperCase();
    console.log("nomeFinal: ", nomeFinal);

    const data = new FormData()
    data.append('file', files[0])
    data.append('UPLOADCARE_STORE', '1')
    data.append('UPLOADCARE_PUB_KEY', 'fd95da9399e52e4f97e0')

    if (nomeFinal == "JPG" || nomeFinal == "JPEG" || nomeFinal == "PNG" || nomeFinal == "BMP") {
      this.http.post('https://upload.uploadcare.com/base/', data)
        .subscribe(event => {
          this.imageURL = event.json().file
          console.log("Subscribe mostrando imageURL: ", this.imageURL);

          this.usuario.foto = "https://ucarecdn.com/" + this.imageURL + "/" + files[0].name;
          console.log("usuario.foto: ", this.usuario.foto);

          this.loading.dismiss();
        })
    } else {
      this.loading.dismiss();
      this.message = null;
      this.message = "Selecione uma imagem valida.";
      this.presentToast(this.message);

    }

  }

  async alteraPerfil() {
    await this.presentLoading();

    try {
      //const produto = this.criaConstanteProducts();
      console.log("usuario: ", this.usuario);
      await this.userService.updateUser(this.id, this.usuario);
      await this.loading.dismiss();

      //this.navCtrl.navigateBack('/profile');
      this.close();
    } catch (error) {
      this.presentToast('Erro ao tentar salvar');
      console.log(error);
      this.loading.dismiss();
    }
  }

  //ion-alert Delete VIDEO
  async presentAlertAlteraPerfil() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: 'Deseja Altera o Perfil ?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
          }
        }, {
          text: 'Alterar',
          handler: () => {
            this.alteraPerfil();
          }
        }
      ]
    });

    await alert.present();

  }

  //ion-alert Alterar FOTO
  async presentAlertAlterarFoto() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: 'Ação da Foto do Perfil',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
          }
        }, {
          text: 'Excluir Foto',
          handler: () => {
            this.deletarFoto();
          }
        }, {
          text: 'Alterar Foto',
          handler: () => {
            this.uploadFile();
          }
        }
      ]
    });

    await alert.present();

  }

  async deletarFoto() {
    await this.presentLoading();
    this.usuario.foto = null;
    await this.loading.dismiss();
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
