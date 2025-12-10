import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  private apiUrl = 'http://api-rest-laravel.com.devel/api';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  // ✅ SUBIDA DE IMAGEN DE POSTS (NO USER)
  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file0', file);

    return this.http.post(
      this.apiUrl + '/posts/upload',
      formData,
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ CREACIÓN DE POST
  createPost(post: any): Observable<any> {
    return this.http.post(
      this.apiUrl + '/posts',
      post,
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ LISTADO
  getPosts(): Observable<any> {
    return this.http.get(this.apiUrl + '/posts');
  }

  getPostImage(filename: string): string {
    return this.apiUrl + '/posts/image/' + filename;
  }
}
