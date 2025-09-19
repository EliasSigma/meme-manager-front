import { NgModule, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Login } from './pages/login/login';
import { MemeCard } from './shared/components/meme-card/meme-card';
import { MemeGallery } from './pages/meme-gallery/meme-gallery';

@NgModule({
  declarations: [
    App,
    Login,
    MemeCard,
    MemeGallery
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule 
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withFetch()),
    provideClientHydration()
  ],
  bootstrap: [App]
})
export class AppModule { }
