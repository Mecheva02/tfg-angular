import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { global } from '../../services/global';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.scss']
})
export class PerfilComponent implements OnInit {

  public user: any = null;
  public profileImageUrl: string = 'assets/images/default-profile.png';
  private backendUrl = global.url.replace(/\/$/, '');
  public showSettingsPopup: boolean = false;

  // ✅ POSTS DONDE HE COMENTADO
  public myResponsePosts: any[] = [];

  constructor(
    private _userService: UserService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {

    const identity = this._userService.getIdentity();

    if (identity?.sub) {
      this.loadUserDetail(identity.sub);
      this.loadMyResponses(identity.sub); // ✅ CARGA AUTOMÁTICA
    }

    this._userService.identity$.subscribe(identity => {
      if (identity?.sub) {
        this.loadUserDetail(identity.sub);
        this.loadMyResponses(identity.sub); // ✅ CARGA AUTOMÁTICA
      } else {
        this.user = null;
        this.profileImageUrl = 'assets/images/default-profile.png';
        this.myResponsePosts = [];
      }
    });
  }

  private loadUserDetail(id: number) {
    this._userService.getUserDetail(id).subscribe((res: any) => {
      if (res.user) {
        this.user = res.user;
       this.profileImageUrl = res.user.image
  ? `${this.backendUrl}/storage/users/${res.user.image}?t=${new Date().getTime()}`
  : 'assets/images/default-profile.png';

      }
    });
  }

  // ✅ CARGA DIRECTA DE MIS RESPUESTAS AL ENTRAR
  loadMyResponses(userId: number) {

    const token = localStorage.getItem('token')?.replace(/"/g, '');

    const headers = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    this.http.get<any[]>(
      `${this.backendUrl}/api/user/${userId}/commented-posts`,
      headers
    ).subscribe({
      next: (posts) => {
        this.myResponsePosts = posts.map(post => ({
          ...post,
          image_url: post.image
            ? `${this.backendUrl}/storage/posts/${post.image}`
            : 'assets/images/default-profile.png'
        }));
      },
      error: (err) => {
        console.error('Error cargando mis respuestas', err);
        this.myResponsePosts = [];
      }
    });
  }
//irpost
 goToPost(postId: number) {
  this.router.navigate(['/posts', postId]);
}


  toggleSettingsPopup() {
    this.showSettingsPopup = !this.showSettingsPopup;
  }

  goToSettings() {
    this.showSettingsPopup = false;
    this.router.navigate(['/ajustes']);
  }

  logout() {
    this._userService.logout();
    this.showSettingsPopup = false;
    this.router.navigate(['/login']);
  }

  cancelPopup() {
    this.showSettingsPopup = false;
  }
}
