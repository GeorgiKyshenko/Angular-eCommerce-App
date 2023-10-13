import { FormControl, ValidationErrors, Validators } from '@angular/forms';

export class AppValidator {
  static EMAIL_VALIDATION = [
    Validators.required,
    Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
  ];

  static whitespaceValidator(control: FormControl): ValidationErrors | null {
    if (control.value !== null && control.value.trim().lenght === 0) {
      //invalid, returns error object
      return { whitespaceValidator: true };
    } else {
      //valid, return null
      return null;
    }
  }
}
