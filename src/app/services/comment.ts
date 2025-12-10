import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { global } from './global';

export interface Comment {
  id: number;
  user_id: number;
  post_id: number;
  parent_id?: number | null;
  content: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  user?: any;
  replies?: Comment[];
}

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  // ✅ URL unificada desde global.ts
  private api = global.url + 'api';

  constructor(private http: HttpClient) {}

  // ✅ OBTENER COMENTARIOS POR POST
  getByPost(postId: number) {
    return this.http.get<{ status: string; comments: Comment[] }>(
      `${this.api}/comments/${postId}`
    );
  }

  // ✅ CREAR COMENTARIO
  create(data: { post_id: number; content: string }) {
    const token = localStorage.getItem('token');

    const headers = {
      Authorization: 'Bearer ' + token!,
      'Content-Type': 'application/json'
    };

    return this.http.post<any>(
      `${this.api}/comments`,
      data,
      { headers }
    );
  }

  // ✅ CONTADOR DE COMENTARIOS
  getCount(postId: number) {
    return this.http.get<{ status: string; count: number }>(
      `${this.api}/comments/count/${postId}`
    );
  }

  // ✅ EDITAR COMENTARIO
  update(commentId: number, content: string) {
    const token = localStorage.getItem('token');

    const headers = {
      Authorization: 'Bearer ' + token!,
      'Content-Type': 'application/json'
    };

    return this.http.put<any>(
      `${this.api}/comments/${commentId}`,
      { content },
      { headers }
    );
  }

  // ✅ BORRAR COMENTARIO
  delete(commentId: number) {
    const token = localStorage.getItem('token');

    const headers = {
      Authorization: 'Bearer ' + token!
    };

    return this.http.delete<any>(
      `${this.api}/comments/${commentId}`,
      { headers }
    );
  }

  // ✅ COMENTARIOS PAGINADOS
  getByPostPaginated(postId: number, page: number) {
    return this.http.get<any>(
      `${this.api}/comments/${postId}?page=${page}`
    );
  }
}
