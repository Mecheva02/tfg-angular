import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { global } from '../../services/global';

@Component({
  standalone: true,
  selector: 'app-user-edit',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './user-edit.html',
  styleUrls: ['./user-edit.scss']
})
export class UserEditComponent implements OnInit {

  public page_title: string = 'Ajustes de usuario';
  public user: any = { name: '', surname: '', username: '', image: '' };
  public editUser: any = { name: '', surname: '', username: '' };
  public profileImageUrl: string = 'assets/images/default-profile.png';
  public successMessage: string = '';
  private backendUrl = global.url.replace(/\/$/, '');
  public fileToUpload: File | null = null;

  constructor(private _userService: UserService, private router: Router) {}

  ngOnInit() {
    const identity = this._userService.getIdentity();

    if (identity?.sub) {
      this.loadUserDetail(identity.sub);
    }
  }

  private loadUserDetail(id: number) {
    this._userService.getUserDetail(id).subscribe((res: any) => {
      if (res.user) {
        this.user = res.user;

        this.profileImageUrl = res.user.image
          ? `${this.backendUrl}/storage/users/${res.user.image}?t=${new Date().getTime()}`
          : 'assets/images/default-profile.png';

        this.editUser = {
          name: res.user.name,
          surname: res.user.surname,
          username: res.user.username
          // si en el futuro añades email al formulario, añádelo aquí también
          // email: res.user.email
        };
      }
    });
  }

  // -------------------- SUBIDA AUTOMÁTICA DE FOTO --------------------
  onFileChange(event: any): void {
    const file: File = event.target.files[0];

    if (!file) return;

    this.fileToUpload = file;

    this._userService.upload(file).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {

          // ✅ Actualizar imagen en la vista (con cache busting)
          this.profileImageUrl = `${this.backendUrl}/storage/users/${res.image}?t=${new Date().getTime()}`;

          // ✅ Actualizar SOLO el campo image dentro de la identity existente
          const currentIdentity = this._userService.getIdentity();

          if (currentIdentity) {
            const updatedIdentity = {
              ...currentIdentity,
              image: res.image
            };

            this._userService.setIdentity(updatedIdentity);
          }

          this.successMessage = 'Imagen actualizada';
          setTimeout(() => this.successMessage = '', 3000);
        }
      },
      error: (err: any) => {
        console.error('Error subiendo imagen', err);
      }
    });
  }

  // -------------------- ENVÍO DE DATOS DEL PERFIL --------------------
  onSubmit(): void {
    if (!this.editUser || !this._userService.getToken()) {
      this.successMessage = 'No estás logueado o falta token';
      setTimeout(() => this.successMessage = '', 3000);
      return;
    }

    this._userService.update(this.editUser).subscribe({
      next: (res: any) => {
        if (res.user) {

          // ✅ Actualizar identity SIN perder sub, role, email, etc.
          const currentIdentity = this._userService.getIdentity();
          if (currentIdentity) {
            const updatedIdentity = {
              ...currentIdentity,
              name: res.user.name,
              surname: res.user.surname,
              username: res.user.username,
              image: res.user.image
            };

            this._userService.setIdentity(updatedIdentity);
          }

          this.user = res.user;

          this.profileImageUrl = res.user.image
            ? `${this.backendUrl}/storage/users/${res.user.image}?t=${new Date().getTime()}`
            : 'assets/images/default-profile.png';

          this.editUser = {
            name: res.user.name,
            surname: res.user.surname,
            username: res.user.username
          };

          this.successMessage = 'Perfil actualizado correctamente';
          setTimeout(() => this.successMessage = '', 3000);
        }
      },
      error: (err) => {
        console.error(err);
        this.successMessage = 'Error al actualizar el perfil';
        setTimeout(() => this.successMessage = '', 3000);
      }
    });
  }
}
