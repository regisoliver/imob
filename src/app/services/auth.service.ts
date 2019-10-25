import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { User } from '../interfaces/user';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private usersCollection: AngularFirestoreCollection<User>;
  private user: User;

  constructor(private afa: AngularFireAuth, private afs: AngularFirestore) {
    this.usersCollection = this.afs.collection<User>('Users');
  }

  login(user: User) {
    return this.afa.auth.signInWithEmailAndPassword(user.email, user.password);
  }

  register(user: User) {
    return this.afa.auth.createUserWithEmailAndPassword(user.email, user.password);
  }

  logout() {
    return this.afa.auth.signOut();
  }

  getAuth() {
    return this.afa.auth;
  }

  getUID(){
    if(!this.user){
      if(this.afa.auth.currentUser){
        const user = this.afa.auth.currentUser
        //this.setUser({

        //})
      }
    }
  }

}
