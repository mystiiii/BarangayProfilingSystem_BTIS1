import { Injectable } from '@nestjs/common';

@Injectable()
export class SettingsService {
  constructor() {
    this.settings = {
      barangayName: 'Barangay 781 Zone 84',
      requireVerification: true,
      automaticBackups: false
    };
  }

  getSettings() {
    return this.settings;
  }

  updateSettings(dto) {
    this.settings = { ...this.settings, ...dto };
    return {
      message: 'Settings updated successfully',
      settings: this.settings
    };
  }
}
