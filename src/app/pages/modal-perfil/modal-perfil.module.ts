import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ModalPerfilPage } from './modal-perfil.page';

const routes: Routes = [
  {
    path: '',
    component: ModalPerfilPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ModalPerfilPage],
  exports: [ModalPerfilPage]
})
export class ModalPerfilPageModule {}
