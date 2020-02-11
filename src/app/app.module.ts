import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonicSelectableModule } from 'ionic-selectable';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AngularFireModule } from '@angular/fire';
import { environment } from 'src/environments/environment';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { Keyboard } from '@ionic-native/keyboard/ngx';

import { IonicStorageModule } from '@ionic/storage';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';

import { Camera } from '@ionic-native/camera/ngx';
import { File } from '@ionic-native/file/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
//import { ImagePicker } from '@ionic-native/image-picker/ngx';

import { NgxMaskIonicModule } from 'ngx-mask-ionic'

import { BrMaskerModule } from 'br-mask';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    FormsModule,
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    IonicSelectableModule,
    IonicStorageModule.forRoot(),
    HttpClientModule,
    HttpModule,
    NgxMaskIonicModule.forRoot(),
    BrMaskerModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Camera, File, WebView, AngularFireStorage,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    Keyboard,
    SocialSharing,
    ScreenOrientation
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
