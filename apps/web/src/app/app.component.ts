import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, AuthUser } from './core/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  protected currentUser: AuthUser | null = null;
  protected showProfileMenu = false;
  private authSub?: Subscription;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.authSub = this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      if (!user) {
        this.showProfileMenu = false;
      }
    });

    if (this.authService.isLoggedIn && !this.currentUser) {
      this.authService.me().subscribe({
        error: () => {
          this.authService.logout();
        },
      });
    }
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }

  protected toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
