import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models/notification.model';
import { global } from '../../services/global';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.scss']
})
export class NotificationsComponent implements OnInit {

  // ✅ NOTIFICACIONES CON USUARIO EMISOR
  notifications: (Notification & {
    sender?: {
      id: number;
      username: string;
      image: string | null;
    };
  })[] = [];

  loading: boolean = false;
  error: string | null = null;

  // ✅ URL BASE PARA IMÁGENES
  apiUrl = global.url.replace(/\/$/, '');

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (!token) {
      this.error = 'Debes iniciar sesión para ver tus notificaciones.';
      return;
    }

    this.loadNotifications();
    this.markAllAsRead(); // ✅ marca todas como leídas al entrar
  }

  loadNotifications(): void {
    this.loading = true;
    this.error = null;

    this.notificationService.getAll().subscribe({
      next: (res) => {
        this.notifications = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando notificaciones', err);
        this.error = 'No se pudieron cargar las notificaciones.';
        this.loading = false;
      }
    });
  }

  // ✅ MARCAR UNA SOLA COMO LEÍDA
  markAsRead(notification: Notification): void {
    if (notification.read) return;

    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.read = true;
      },
      error: (err) => {
        console.error('Error marcando como leída', err);
      }
    });
  }

  // ✅ MARCAR TODAS COMO LEÍDAS AUTOMÁTICAMENTE
  markAllAsRead(): void {
    this.notificationService.getAll().subscribe({
      next: (notifications) => {
        const unread = notifications.filter(n => !n.read);

        unread.forEach(n => {
          this.notificationService.markAsRead(n.id).subscribe();
          n.read = true;
        });

        // ✅ actualiza el contador del corazón
        this.notificationService.emitRefresh();
      },
      error: (err) => {
        console.error('Error marcando todas como leídas', err);
      }
    });
  }

  // ✅ IMAGEN DEL USUARIO EMISOR (ADMIN O QUIEN RESPONDE)
  getUserImage(image: string | null | undefined): string {
    if (!image) {
      return 'assets/images/default-profile.png';
    }

    return this.apiUrl + '/storage/users/' + image;
  }

}
