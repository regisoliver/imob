import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { ProductService } from 'src/app/services/product.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  public userService: ProductService;
  private userSubscription: Subscription;
  message = "";

  public id: string = null;
  public usuario: User = {};

  constructor(
    private afs: AngularFirestore,
    private router: Router,
    public authService: AuthService,
    private toastCtrl: ToastController,
  ) {
    this.id = this.authService.getAuth().currentUser.uid;
    console.log("USer: construtor: ", this.id);
    //if (this.id) this.loadUser();
    //console.log("USer: construtor: ", this.usuario);
    
    /*
    this.userSubscription = this.userService.getUser(this.id).subscribe(data => {
      this.usuario = data;
    });
    */
    
  }

  ngOnDestroy() {
    if (this.userSubscription) this.userSubscription.unsubscribe();
  }

  ngOnInit() {
    //this.afs.collection('Users').valueChanges().subscribe(obj => {
    //  this.user = obj;
    //})

    //const usuario = this.authService.
  }

  loadUser() {
    this.userSubscription = this.userService.getUser(this.id).subscribe(data => {
      this.usuario = data;
    });

    console.log("USer: construtor: ", this.usuario);
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({ message, duration: 5000 });
    toast.present();
  }

  alterarPerfil(){
    this.message = "Desculpe, Você precisa ser um desenvolvedor :)";
    this.presentToast(this.message);
  }

}
