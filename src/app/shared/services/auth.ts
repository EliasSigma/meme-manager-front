import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { ApiService } from './api';
import { User, AuthResponse, LoginData, RegisterData } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    this.checkAuthState();
  }

  private checkAuthState(): void {
    const token = this.getToken();
    const user = this.getCurrentUser();

    if (token && user) {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    }
  }

  async login(credentials: LoginData): Promise<AuthResponse> {
    try {
      const response = await this.apiService.requestApi('/auth/login', 'POST', credentials);
      this.handleAuthSuccess(response);
      return response;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await this.apiService.requestApi('/users', 'POST', userData);
      this.handleAuthSuccess(response);
      return response;
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem('directus_token');
    localStorage.removeItem('directus_refresh_token');
    localStorage.removeItem('directus_user');

    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);

    this.router.navigate(['/login']);
  }

  async refreshToken(): Promise<AuthResponse | null> {
    const refreshToken = localStorage.getItem('directus_refresh_token');

    if (!refreshToken) {
      this.logout();
      return null;
    }

    try {
      const response = await this.apiService.requestApi('/auth/refresh', 'POST', {
        refresh_token: refreshToken
      });
      this.handleAuthSuccess(response);
      return response;
    } catch (error) {
      console.error('Erreur de rafraîchissement:', error);
      this.logout();
      throw error;
    }
  }

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem('directus_token', response.access_token);
    localStorage.setItem('directus_refresh_token', response.refresh_token);
    localStorage.setItem('directus_user', JSON.stringify(response.user));

    this.currentUserSubject.next(response.user);
    this.isAuthenticatedSubject.next(true);
  }

  getToken(): string | null {
    return localStorage.getItem('directus_token');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('directus_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}