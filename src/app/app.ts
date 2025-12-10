import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { UserService } from './services/user.service';
import { NotificationService } from './services/notification.service';
import { global } from './services/global';

import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { HomeComponent } from './components/home/home';
import { ErrorComponent } from './components/error/error';
import { PostListComponent } from './post/post-list/post-list';
import { PostCreateComponent } from './post/post-create/post-create';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule,

    LoginComponent,
    RegisterComponent,
    HomeComponent,
    ErrorComponent,
    PostListComponent,
    PostCreateComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {

  public identity: any = null;
  public profileImageUrl: string = 'assets/images/default-profile.png';
  private backendUrl = global.url.replace(/\/$/, '');

  // ✅ CONTADOR DE NOTIFICACIONES
  notificationsCount: number = 0;

  constructor(
    public _userService: UserService,
    private _router: Router,
    private notificationService: NotificationService
  ) {
    this.identity = this._userService.getIdentity();

    if (this.identity?.sub) {
      this.loadUserDetail(this.identity.sub);
      this.loadNotificationsCount(); // ✅ CARGA INICIAL DEL CORAZÓN
    }

    this._userService.identity$.subscribe(identity => {
      this.identity = identity;

      if (identity?.sub) {
        this.loadUserDetail(identity.sub);
        this.loadNotificationsCount(); // ✅ ACTUALIZA EL CORAZÓN AL LOGIN
      } else {
        this.profileImageUrl = 'assets/images/default-profile.png';
        this.notificationsCount = 0; // ✅ RESET AL LOGOUT
      }
    });

    // ✅ ESCUCHAR ACTUALIZACIONES EN TIEMPO REAL DEL CONTADOR
    this.notificationService.refreshCountObservable$.subscribe(count => {
      this.notificationsCount = count;
    });
  }

  private loadUserDetail(id: number) {
    this._userService.getUserDetail(id).subscribe((res: any) => {
      if (res.user) {
        this.identity = res.user;

        this.profileImageUrl = res.user.image
          ? `${this.backendUrl}/storage/users/${res.user.image}`
          : 'assets/images/default-profile.png';
      }
    });
  }

  // ✅ CARGAR CONTADOR DE NOTIFICACIONES NO LEÍDAS
  loadNotificationsCount(): void {
    this.notificationService.getUnreadCount().subscribe({
      next: (count) => {
        this.notificationsCount = count;
      },
      error: () => {
        this.notificationsCount = 0;
      }
    });
  }

  logout() {
    this._userService.logout();
    this.notificationsCount = 0; // ✅ LIMPIA EL CORAZÓN
    this._router.navigate(['/login']);
  }

  isAuthPage(): boolean {
    const currentUrl = this._router.url;
    return currentUrl.includes('/login') || currentUrl.includes('/registro');
  }
}
