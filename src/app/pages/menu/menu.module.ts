import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MenuPage } from './menu.page';
import { MenuRountingModule } from './menu-rounting.module';
import { ClientPage } from '../client/client.page';
import { HomePage } from '../home/home.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenuRountingModule,
    ClientPage,
    HomePage
  ],
  declarations: [MenuPage]
})
export class MenuPageModule {}
