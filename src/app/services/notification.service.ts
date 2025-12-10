import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Notification } from '../models/notification.model';
import { global } from './global';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private apiUrl = global.url.replace(/\/$/, '');

  private refreshCount$ = new Subject<number>();
  refreshCountObservable$ = this.refreshCount$.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders() {
    let token = localStorage.getItem('token');
    if (token) token = token.replace(/"/g, '');

    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json'
    };

    if (token) headers['Authorization'] = `Bearer ${token}`;

    return { headers: new HttpHeaders(headers) };
  }

  getAll(): Observable<Notification[]> {
    return this.http.get<Notification[]>(
      `${this.apiUrl}/api/notifications`,
      this.getHeaders()
    );
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<number>(
      `${this.apiUrl}/api/notifications/unread`,
      this.getHeaders()
    );
  }

  markAsRead(id: number): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/api/notifications/${id}/read`,
      {},
      this.getHeaders()
    );
  }

  emitRefresh(): void {
    this.getUnreadCount().subscribe({
      next: (count) => this.refreshCount$.next(count),
      error: () => this.refreshCount$.next(0)
    });
  }
}
