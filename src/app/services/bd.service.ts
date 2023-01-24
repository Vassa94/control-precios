import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';




@Injectable({
  providedIn: 'root'
})
export class BDService {

  constructor(private http: HttpClient) { }
API='http://localhost:8080'

obtenerDatos(): Observable<any> {

  return this.http.get(this.API+'/producto/traer');
  //return this.http.get('../assets/productos.json');
}

obtenerWeb(): Observable<any> {
  return this.http.get(this.API+'/web/traer');
  //return this.http.get('../assets/pubWeb.json');
}

obtenerMl(): Observable<any> {
  return this.http.get('../assets/pubMl.json');
  //return this.http.get('http://localhost:8080/producto/traer')
}

crearProducto(body): Observable<any>{
  return this.http.post('http://localhost:8080/productos/crear', body);   
  
}
borrarProducto(id): Observable<any>{
  return this.http.delete(this.API+'/productos/borrar/'+id);
}

actuProductos(body): Observable<any>{
  return this.http.put(this.API+'/productos/actualizar/precio', body); 
}

actualizarProducto(id,params): Observable<any>{  
  return this.http.put<any>(this.API+'/productos/editar/'+id, params);  
}

actuStock(body): Observable<any>{
  return this.http.put(this.API+'/productos/actualizar/stock', body); 
}

actuWeb(body): Observable<any>{
  return this.http.put(this.API+'/web/actualizar/precio', body); 
}

stockWeb(body): Observable<any>{
  return this.http.put<any>(this.API+'/web/actualizar/stock', body); 
}

listaWeb(body): Observable<any>{
  return this.http.put<any>(this.API+'/web/actualizar/batch', body); 
}

crearPubli(body): Observable<any>{
  return this.http.post<any>(this.API+'/web/crear',body);
}

guardar(body:any){
  //this.http.post('http://localhost:8080/productos.json',body)
  //fs.writeFileSync('http://localhost:8080/productos.json', JSON.stringify(body))

}


}

