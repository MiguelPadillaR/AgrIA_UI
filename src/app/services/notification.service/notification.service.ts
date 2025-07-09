// src/app/services/notification.service.ts
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private snackBar: MatSnackBar, private translate: TranslateService) {}

  /**
   * Show a notification on the interface.
   * 
   * @param messageKey (str) Dict key inside the JSON localization files.
   * @param additionalMessage (str) Additional message context for the notification.
   * @param type (str) Type of notification (`'success' | 'error' | 'info' | 'warning'`).
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