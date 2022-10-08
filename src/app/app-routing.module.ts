import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { ProductosComponent } from './componentes/productos/productos.component';
import { LoginComponent } from './componentes/login/login.component';
import { NotFoundComponent } from './componentes/not-found/not-found.component';

const routes: Routes = [
  { path: "productos", component: ProductosComponent },
  { path: "login", component: LoginComponent },
  { path: "**", component: NotFoundComponent },
  { path: "",   redirectTo: "productos", pathMatch: "full" },
  { path: "#",   redirectTo: 'productos', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
