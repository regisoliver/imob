import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { ProductService } from 'src/app/services/product.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastController, ModalController } from '@ionic/angular';
import { ModalPerfilPage } from '../modal-perfil/modal-perfil.page';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  public userSubscription: Subscription;
  message = "";

  public id: string = null;
  public usuario: User = {};

  constructor(
    private afs: AngularFirestore,
    private router: Router,
    public authService: AuthService,
    private toastCtrl: ToastController,
    private userService: ProductService,
    private modalCtrl: ModalController,
  ) {
    this.id = this.authService.getAuth().currentUser.uid;
    if (this.id) this.loadUser();
  }

  async showModalPerfil(){
    const modal = await this.modalCtrl.create({
      component: ModalPerfilPage
    });

    modal.present();
  }

  ngOnDestroy() {
    if (this.userSubscription) this.userSubscription.unsubscribe();
  }

  ngOnInit() {

  }

  loadUser() {
    this.userSubscription = this.userService.getUser(this.id).subscribe(data => {
      this.usuario = data;
    });
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({ message, duration: 5000 });
    toast.present();
  }

}
