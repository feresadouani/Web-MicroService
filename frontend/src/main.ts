import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { keycloakService } from './app/services/keycloak.service';

keycloakService.init()
  .then(() => {
    return platformBrowserDynamic().bootstrapModule(AppModule, {
      ngZoneEventCoalescing: true
    });
  })
  .catch(err => console.error('App bootstrap failed', err));
