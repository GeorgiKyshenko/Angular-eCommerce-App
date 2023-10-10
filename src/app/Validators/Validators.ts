import { Validators } from '@angular/forms';

export class AppValidator {
  static EMAIL_VALIDATION = [
    Validators.required,
    Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
  ];
}
