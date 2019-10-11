import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Product } from '../interfaces/product';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  //private productsCollection = AngularFirestoreCollection<Product>(); //funcionando****
  //private productsColletion = this.afs.collection<Product>('Products');

  //constructor(private afs: AngularFirestore) { }
  constructor(private afs: AngularFirestore) {
    //this.productsCollection = this.afs.collection<Product>('Products');
  }

  /*
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
  */

  addProduct(product: Product) {

  }

  getProduct(id: string) {

  }

  updateProduct(id: string, product: Product) {

  }

  deleteProduct(id: string) {

  }

}
