import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';

import { IonicModule } from '@ionic/angular';

import { DetailsPage } from './details.page';

const routes: Routes = [
  {
    path: '',
    component: DetailsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    HttpClientJsonpModule
  ],
  declarations: [DetailsPage]
})
export class DetailsPageModule {}
