import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { ProductosComponent } from './componentes/productos/productos.component';
import { LoginComponent } from './componentes/login/login.component';
import { NotFoundComponent } from './componentes/not-found/not-found.component';
import { ControlComponent } from './componentes/control/control.component';
import { ExpImpComponent } from './componentes/exp-imp/exp-imp.component';

const routes: Routes = [
  { path: "productos", component: ProductosComponent },
  { path: "login", component: LoginComponent },  
  { path: "control", component: ControlComponent },
  { path: "import", component: ExpImpComponent },
  { path: "",   redirectTo: "productos", pathMatch: "full" },
  { path: "#",   redirectTo: 'productos', pathMatch: 'full' },
  { path: "**", component: NotFoundComponent },
  

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
