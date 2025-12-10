import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { User } from '../../models/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // 👈 AÑADIDO AQUÍ
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
  providers: [UserService]
})
export class RegisterComponent implements OnInit {
  public page_title: string = 'Regístrate';
  public user: User = new User(1, '', '','','ROLE_USER', '', '', '', '');
  public status: string = '';

  constructor(private _userService: UserService) {}

  ngOnInit() {
    console.log('Componente de registro funcionando correctamente');
  }

  onSubmit(form: NgForm) {
    this._userService.register(this.user).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.status = 'success';
          form.resetForm({
            id: 1,
            name: '',
            surname: '',
            role: 'ROLE_USER',
            email: '',
            password: '',
            description: '',
            image: ''
          });
        } else {
          this.status = 'error';
        }
      },
      error: (error: any) => {
        this.status = 'error';
        console.error(error);
      }
    });
  }
}
