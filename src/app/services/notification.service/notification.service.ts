// src/app/services/notification.service.ts
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private snackBar: MatSnackBar, private translate: TranslateService) {}

/* 

  showSuccess(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Close', {
      duration: duration,
      panelClass: ['success-snackbar'], // Custom CSS class for success styling
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  showError(message: string, duration: number = 5000): void {
    this.snackBar.open(message, 'Close', {
      duration: duration,
      panelClass: ['error-snackbar'], // Custom CSS class for error styling
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  showInfo(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Close', {
      duration: duration,
      panelClass: ['info-snackbar'], // Custom CSS class for info styling
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

 */
  /**
   * Show a notification on the interface.
   * 
   * @param messageKey (str) Dict key inside the JSON localization files.
   * @param additionalMessage (str) 
   * @param type (str) Type of notification.
   * @param duration (number) Duration of displayed notidication in ms (Default: 3000).
   */
  public showNotification(
    messageKey: string,
    additionalMessage: string = '',
    type: 'success' | 'error' | 'info' | 'warning',
    duration: number = 3000
  ): void {
    let panelClass: string[] = [];
    switch (type) {
      case 'success':
        panelClass = ['success-snackbar'];
        break;
      case 'error':
        panelClass = ['error-snackbar'];
        break;
      case 'info':
        panelClass = ['info-snackbar'];
        break;
      case 'warning':
        panelClass = ['warning-snackbar'];
        break;
    }

    // Look up the translation:
    this.translate.get(`notifications.${messageKey}`).subscribe((translatedMessage: string) => {
      const message = additionalMessage ? translatedMessage + ' ' + additionalMessage: translatedMessage;
      this.snackBar.open(message, 'Close', {
        duration: duration,
        panelClass: panelClass,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    });
  }
}