import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  protected identifier = '';
  protected password = '';
  protected loading = false;
  protected errorMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  protected submit(): void {
    if (!this.identifier.trim() || !this.password.trim()) {
      this.errorMessage = 'Completá usuario/email y contraseña';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService
      .login(this.identifier.trim(), this.password)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/preview']);
        },
        error: () => {
          this.errorMessage = 'Credenciales inválidas';
        },
      });
  }
}
