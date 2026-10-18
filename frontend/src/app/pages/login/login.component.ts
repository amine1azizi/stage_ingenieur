import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { getErrorMessage } from '../../utils/error-message';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  registering = false;
  error = '';
  warning = '';
  submitting = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.warning = history.state?.warning || '';
  }

  submit(): void {
    this.error = '';
    this.submitting = true;
    const request = this.registering
      ? this.authService.register(this.email, this.password)
      : this.authService.login(this.email, this.password);

    request.subscribe({
      next: (user) => {
        this.submitting = false;
        const requestedUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        const defaultUrl = user.role === 'ADMIN' ? '/dashboard' : '/portal';
        const destination = requestedUrl && requestedUrl.startsWith('/')
          ? requestedUrl
          : defaultUrl;
        this.router.navigateByUrl(destination);
      },
      error: (err) => {
        this.error = getErrorMessage(err);
        this.submitting = false;
      }
    });
  }

  toggleMode(): void {
    this.registering = !this.registering;
    this.error = '';
  }
}
