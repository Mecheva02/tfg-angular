import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { global } from './global';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  public url: string;

  constructor(private http: HttpClient) {
    // ✅ Base URL sin barra final
    this.url = global.url.replace(/\/$/, '');
  }

  // ==========================
  // OBTENER POSTS
  // ==========================
  getPosts(): Observable<any> {
    return this.http.get(this.url + '/api/posts');
  }

  // ==========================
  // CREAR POST (ADMIN, CON JWT)
  // ==========================
  createPost(post: any): Observable<any> {
    const token = localStorage.getItem('token')?.replace(/"/g, '');

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    });

    return this.http.post(
      this.url + '/api/posts',
      post,
      { headers }
    );
  }

  // ==========================
  // SUBIR IMAGEN DEL POST
  // ==========================
  uploadImage(file: File): Observable<any> {
    const token = localStorage.getItem('token')?.replace(/"/g, '');

    const formData = new FormData();
    formData.append('file0', file);

    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });

    return this.http.post(
      this.url + '/api/posts/upload',
      formData,
      { headers }
    );
  }

  // ==========================
  // IMAGEN DEL POST
  // ==========================
  // Alias "clásico" por si el componente llama a getImage(...)
  getImage(image: string): string {
    return this.getPostImage(image);
  }

  // Nuevo nombre más explícito (el que ya tenías)
  getPostImage(image: string): string {
    if (!image) {
      return 'assets/images/default-post.png';
    }

    // ✅ Hostinger + storage link
    return this.url + '/storage/posts/' + image;
  }

  // ==========================
  // IMAGEN DE USUARIO
  // ==========================
  getUserImage(image: string): string {
    if (!image) {
      return 'assets/images/default-profile.png';
    }

    return this.url + '/storage/users/' + image;
  }
}
