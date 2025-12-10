import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { global } from './global';

@Injectable({
  providedIn: 'root'
})
export class AdminCommentService {

  private api = global.url.replace(/\/$/, '');

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token')?.replace(/"/g, '');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  getPending() {
    return this.http.get<any[]>(
      `${this.api}/api/admin/comments/pending`,
      this.getHeaders()
    );
  }

  approve(commentId: number) {
    return this.http.put(
      `${this.api}/api/admin/comments/${commentId}/approve`,
      {},
      this.getHeaders()
    );
  }

  reject(commentId: number) {
    return this.http.put(
      `${this.api}/api/admin/comments/${commentId}/reject`,
      {},
      this.getHeaders()
    );
  }
}
