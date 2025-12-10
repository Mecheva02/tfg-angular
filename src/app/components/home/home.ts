import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostListComponent } from '../../post/post-list/post-list';
import { NotificationBellComponent } from '../notification-bell/notification-bell.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    PostListComponent,
    NotificationBellComponent   // ✅ CORAZÓN DE NOTIFICACIONES AÑADIDO
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent {
  public page_title: string = '';
}
