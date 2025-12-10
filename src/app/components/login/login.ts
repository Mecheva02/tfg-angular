import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {

  public page_title = 'Identifícate';
  public user: User = new User(1, '', '', '', 'ROLE_USER', '', '', '', '');
  public status: string = '';
  public token: string = '';
  public identity: any;
  public loading: boolean = false;

  constructor(
    private _userService: UserService,
    private _router: Router
  ) {}

onSubmit(form: NgForm) {

  this.status = '';
  this.loading = true;

  const loginData = {
    login: this.user.email,
    password: this.user.password
  };

  // 1️⃣ Obtener token
  this._userService.singup(loginData).subscribe({
    next: (tokenResponse: any) => {

      if (!tokenResponse || tokenResponse.status === 'error') {
        this.status = 'error';
        this.loading = false;
        return;
      }

      // ✅ Guardar token (es un string)
      this._userService.setToken(tokenResponse);

      // 2️⃣ Obtener identity (puede venir como token otra vez)
      this._userService.singup(loginData, true).subscribe({
        next: (identityResponse: any) => {

          let identity: any;

          // ✅ SI EL BACKEND DEVUELVE OBJETO
          if (typeof identityResponse === 'object' && identityResponse.sub) {
            identityResponse.id = identityResponse.sub;
            identity = identityResponse;
          }

          // ✅ SI EL BACKEND DEVUELVE SOLO STRING (JWT)
          else if (typeof identityResponse === 'string') {
            const payload = JSON.parse(atob(identityResponse.split('.')[1]));
            payload.id = payload.sub;
            identity = payload;
          }

          this.identity = identity;
          this._userService.setIdentity(identity);

          this.loading = false;
          this._router.navigate(['/inicio']);
        },
        error: () => {
          this.status = 'error';
          this.loading = false;
        }
      });
    },
    error: () => {
      this.status = 'error';
      this.loading = false;
    }
  });
}



}
