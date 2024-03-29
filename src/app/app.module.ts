import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';



import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProductosComponent } from './componentes/productos/productos.component';
import { NavbarComponent } from './componentes/navbar/navbar.component';
import { LoginComponent } from './componentes/login/login.component';
import { ControlComponent } from './componentes/control/control.component';
import { NotFoundComponent } from './componentes/not-found/not-found.component';
import { ReclamosComponent } from './componentes/reclamos/reclamos.component';
import { WebComponent } from './componentes/web/web.component';
import { TruefalseComponent } from './componentes/truefalse/truefalse.component';
import { MercadolibreComponent } from './componentes/mercadolibre/mercadolibre.component';
import { GuiaComponent } from './componentes/guia/guia.component';
import { ReputacionComponent } from './componentes/reputacion/reputacion.component';


@NgModule({
  declarations: [
    AppComponent,
    ProductosComponent,
    NavbarComponent,
    LoginComponent,
    ControlComponent,
    NotFoundComponent,
    ReclamosComponent,
    WebComponent,
    TruefalseComponent,
    MercadolibreComponent,
    GuiaComponent,
    ReputacionComponent
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    NgxPaginationModule,
    CommonModule,
    BrowserAnimationsModule,
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
