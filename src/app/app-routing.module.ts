import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { ProductosComponent } from './componentes/productos/productos.component';
import { LoginComponent } from './componentes/login/login.component';
import { NotFoundComponent } from './componentes/not-found/not-found.component';
import { ControlComponent } from './componentes/control/control.component';
import { ExpImpComponent } from './componentes/exp-imp/exp-imp.component';
import { ReclamosComponent } from './componentes/reclamos/reclamos.component';
import { WebComponent } from './componentes/web/web.component';
import { MercadolibreComponent } from './componentes/mercadolibre/mercadolibre.component';

const routes: Routes = [
  { path: "control-precios/productos", component: ProductosComponent },
  { path: "control-precios/web", component: WebComponent },
  { path: "control-precios/mercadolibre", component: MercadolibreComponent },
  { path: "control-precios/login", component: LoginComponent },  
  { path: "control-precios/control", component: ControlComponent },
  { path: "control-precios/import", component: ExpImpComponent },
  { path: "control-precios/reclamos", component: ReclamosComponent},
  //{ path: "",   redirectTo: "productos", pathMatch: "full" },
  { path: "#",   redirectTo: 'productos', pathMatch: 'full' },
  { path: "**", component: NotFoundComponent },
  

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
