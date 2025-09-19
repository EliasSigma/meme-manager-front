import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  isLoginMode = true;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Redirection si déjà connecté
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this.router.navigate(['/gallery']);
      }
    });

    this.initForms();
  }

  private initForms(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
  }

  async onLogin(): Promise<void> {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        await this.authService.login(this.loginForm.value);
        this.router.navigate(['/gallery']);
      } catch (error) {
        this.isLoading = false;
        this.errorMessage = 'Email ou mot de passe incorrect';
        console.error('Erreur de connexion:', error);
      }
    }
  }

  async onRegister(): Promise<void> {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        const { confirmPassword, ...userData } = this.registerForm.value;
        await this.authService.register(userData);
        this.router.navigate(['/gallery']);
      } catch (error) {
        this.isLoading = false;
        this.errorMessage = 'Erreur lors de l\'inscription';
        console.error('Erreur d\'inscription:', error);
      }
    }
  }

  getErrorMessage(field: string, form: FormGroup): string {
    const control = form.get(field);
    if (control?.errors && control.touched) {
      if (control.errors['required']) return `${field} est requis`;
      if (control.errors['email']) return 'Email invalide';
      if (control.errors['minlength']) return `${field} doit contenir au moins ${control.errors['minlength'].requiredLength} caractères`;
      if (control.errors['mismatch']) return 'Les mots de passe ne correspondent pas';
    }
    return '';
  }
}