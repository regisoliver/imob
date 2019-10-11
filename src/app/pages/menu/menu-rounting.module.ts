import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MenuPage } from './menu.page';
import { ClientPage } from '../client/client.page';
import { HomePage } from '../home/home.page';

const routes: Routes = [{
  path: 'menu',
  component: MenuPage,
  children: [
    {
      path: 'client',
      outlet: 'menucontent',
      component: ClientPage
    },
    {
      path: 'home',
      outlet: 'menucontent',
      component: HomePage
    }
  ]
},
{
  path:'',
  redirectTo:'/menu/(menucontent:home)'
}
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class MenuRountingModule { }
