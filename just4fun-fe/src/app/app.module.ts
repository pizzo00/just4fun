import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { UserService } from "./services/user.service";
import { UserLoginComponent } from './user-login/user-login.component';
import { UserRegisterComponent } from './user-register/user-register.component';
import { FormsModule } from "@angular/forms";
import { UserLogoutComponent } from './user-logout/user-logout.component';
import { LoggedHomeComponent } from './logged-home/logged-home.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent,
    UserLoginComponent,
    UserRegisterComponent,
    UserLogoutComponent,
    LoggedHomeComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [
    {provide: UserService, useClass: UserService}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
