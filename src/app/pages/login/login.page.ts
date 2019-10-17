import { Component, OnInit, ViewChild } from '@angular/core';
import { IonSlides, LoadingController, ToastController } from '@ionic/angular';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  @ViewChild(IonSlides, null) slides: IonSlides;
  public userLogin: User = {};
  public userRegister: User = {};
  private loading: any;

  constructor(
    public Keyboard: Keyboard,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private authService: AuthService
  ) { }

  ngOnInit() {
  }

  segmentChanged(event: any) {
    if (event.detail.value === "login") {
      this.slides.slidePrev();
    } else {
      this.slides.slideNext();
    }
  }

  async login() {
    await this.presentLoading();

    try {
      await this.authService.login(this.userLogin);
    } catch (error) {
      let message: string;

      switch (error.code) {
        case 'auth/argument-error':
          message = 'Insira sua Senha';
          break;

        case 'auth/invalid-email':
          message = 'E-mail não cadastrado';
          break;

        case 'auth/wrong-password':
          message = 'Senha Incorreta';
          break;

        case 'auth/user-not-found':
          message = 'E-mail não existe';
          break;
      }

      console.error(error);
      this.presentToast(message);
    } finally {
      this.loading.dismiss();
    }
  }

  async register() {
    //console.log(this.userRegister);
    await this.presentLoading();

    try {
      await this.authService.register(this.userRegister);
    } catch (error) {
      let message: string;

      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'E-mail ja esta sendo usado';
          break;

        case 'auth/invalid-email':
          message = 'E-mail Inválido';
          break;

        case 'auth/weak-password':
          message = 'A senha deve conter mais de 6 caracteres';
          break;
      }

      console.error(error);
      this.presentToast(message);
    } finally {
      this.loading.dismiss();
    }
  }

  async presentLoading() {
    this.loading = await this.loadingCtrl.create({ message: 'Por Favor, Aguarde...', });
    return this.loading.present();
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2000 });
    toast.present();
  }

}
