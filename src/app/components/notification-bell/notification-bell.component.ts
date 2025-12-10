import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models/notification.model';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.scss']
})
export class NotificationBellComponent implements OnInit {

  notifications: Notification[] = [];
  unreadCount: number = 0;
  showPanel: boolean = false;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
  this.loadUnreadCount();
  this.loadNotifications();

  this.notificationService.refreshCountObservable$.subscribe(count => {
    this.unreadCount = count;
  });
}


  togglePanel() {
    this.showPanel = !this.showPanel;

    if (this.showPanel) {
      this.loadNotifications();
    }
  }

  loadNotifications() {
    this.notificationService.getAll().subscribe({
      next: (res) => {
        this.notifications = res;
      }
    });
  }

  loadUnreadCount() {
    this.notificationService.getUnreadCount().subscribe({
      next: (res) => {
        this.unreadCount = res;
      }
    });
  }

  markAsRead(notification: Notification) {
    if (notification.read) return;

    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.read = true;
        this.unreadCount = Math.max(this.unreadCount - 1, 0);
      }
    });
  }
}
