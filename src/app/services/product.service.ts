import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Product } from '../interfaces/product';
import { map, delay } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsCollection: AngularFirestoreCollection<Product>;
  private usersCollection: AngularFirestoreCollection<User>;

  constructor(
    private afs: AngularFirestore,
    private http: HttpClient
  ) {
    this.productsCollection = this.afs.collection<Product>('Products');
    this.usersCollection = this.afs.collection<User>('Users');
  }

  getProducts() {
    return this.productsCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;

          return { id, ...data };
        });
      })
    )
    
  }

  //USERS
  getUsers() {
    return this.usersCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;

          return { id, ...data };
        });
      })
    )
    
  }

  addProduct(product: Product) {
    return this.productsCollection.add(product);
  }

  getProduct(id: string) {
    return this.productsCollection.doc<Product>(id).valueChanges();
  }

  updateProduct(id: string, product: Product) {
    return this.productsCollection.doc<Product>(id).update(product);
  }

  deleteProduct(id: string) {
    return this.productsCollection.doc(id).delete();
  }


  //User
  addUser(user: User) {
    return this.usersCollection.add(user);
  }

  //User
  getUser(id: string) {
    return this.usersCollection.doc<User>(id).valueChanges();
  }

  //User
  updateUser(id: string, user: User) {
    return this.usersCollection.doc<User>(id).update(user);
  }



}
