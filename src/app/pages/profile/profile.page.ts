import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  

  constructor(
    private afs: AngularFirestore,
    private user: AuthService
    ) {
    const posts = afs.doc('users/${user.getUID()}')
    //this.user
   }

  ngOnInit() {
  }

}
