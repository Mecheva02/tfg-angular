import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { global } from './global';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public url: string;
  public identity: any = null;
  public token: string | null = null;

  public identity$ = new BehaviorSubject<any>(null);

  constructor(private _http: HttpClient) {
    this.url = global.url.replace(/\/$/, '');
    
    this.loadToken();
    this.loadIdentity();
  }

  // ===========================
  // AUTH
  // ===========================

  singup(user: any, gettoken: any = null): Observable<any> {
    if (gettoken != null) {
      user.gettoken = true;
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this._http.post(
      `${this.url}/api/login`,
      user,
      { headers }
    );
  }

  register(user: User): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this._http.post(
      `${this.url}/api/register`,
      user,
      { headers }
    );
  }

  // ===========================
  // GET DETAIL (CON TOKEN)
  // ===========================

  getUserDetail(id: number): Observable<any> {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });

    return this._http.get(`${this.url}/api/user/detail/${id}`, { headers });
  }

  // ===========================
  // UPDATE (CON TOKEN)
  // ===========================

  update(user: any): Observable<any> {
    const token = this.getToken();
    if (!token) throw new Error('No hay token disponible');

    const body: any = {
      name: user.name,
      surname: user.surname,
      username: user.username
    };

    // Solo enviamos email si existe (por si en el futuro lo añades al form)
    if (user.email) {
      body.email = user.email;
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    });

    return this._http.put(`${this.url}/api/user/update`, body, { headers });
  }

  // ===========================
  // UPLOAD IMAGE (CON TOKEN)
  // ===========================
  upload(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file0', file);

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.getToken()}`);

    return this._http.post(
      `${this.url}/api/user/upload`,
      formData,
      { headers }
    );
  }

  // ===========================
  // LOCALSTORAGE
  // ===========================
  loadIdentity() {
    const identity = localStorage.getItem('identity');

    if (!identity || identity === 'undefined' || identity === 'null') {
      this.identity = null;
      localStorage.removeItem('identity');
    } else {
      try {
        this.identity = JSON.parse(identity);
      } catch (e) {
        console.error('Identity corrupta en localStorage:', identity);
        this.identity = null;
        localStorage.removeItem('identity');
      }
    }

    this.identity$.next(this.identity);
  }

  loadToken() {
    const token = localStorage.getItem('token');
    this.token = token && token !== 'undefined' ? token : null;
  }

  getIdentity() {
    return this.identity;
  }

  getToken() {
    const token = localStorage.getItem('token');
    return token ? token.replace(/"/g, '') : null;
  }

  setIdentity(identity: any) {
    this.identity = identity;
    localStorage.setItem('identity', JSON.stringify(identity));
    this.identity$.next(identity);
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  logout() {
    localStorage.removeItem('identity');
    localStorage.removeItem('token');
    this.identity = null;
    this.token = null;
    this.identity$.next(null);
  }
}
