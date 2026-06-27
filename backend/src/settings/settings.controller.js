import { Controller, Get, Patch, Body, Dependencies } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('settings')
@Dependencies(SettingsService)
export class SettingsController {
  constructor(settingsService) {
    this.settingsService = settingsService;
  }

  @Get()
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Patch()
  updateSettings(@Body() settingsDto) {
    return this.settingsService.updateSettings(settingsDto);
  }
}
