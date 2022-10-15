import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatIconModule} from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DataTablesModule } from 'angular-datatables'; 


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProductosComponent } from './componentes/productos/productos.component';
import { NavbarComponent } from './componentes/navbar/navbar.component';
import { LoginComponent } from './componentes/login/login.component';
import { ControlComponent } from './componentes/control/control.component';
import { NotFoundComponent } from './componentes/not-found/not-found.component';
import { ExpImpComponent } from './componentes/exp-imp/exp-imp.component';
import { ReclamosComponent } from './componentes/reclamos/reclamos.component';
import { FileUploadComponent } from './componentes/file-upload/file-upload.component';
import { ProgresoComponent } from './componentes/file-upload/progreso/progreso.component';

@NgModule({
  declarations: [
    AppComponent,
    ProductosComponent,
    NavbarComponent,
    LoginComponent,
    ControlComponent,
    NotFoundComponent,
    ExpImpComponent,
    ReclamosComponent,
    FileUploadComponent,
    ProgresoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FontAwesomeModule,
    TableModule,
    MatIconModule,
    MatProgressBarModule,
    DataTablesModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
