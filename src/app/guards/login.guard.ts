import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  constructor(
    private AuthService: AuthService,
    private router: Router
  ) { }

  canActivate(): Promise<boolean> {
    return new Promise(resolve => {
      this.AuthService.getAuth().onAuthStateChanged(user => {
        if (user) this.router.navigate(['home']);

        resolve(!user ? true : false);
      });
    });
  }
}
