import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';




@Injectable({
  providedIn: 'root'
})
export class BDService {

  constructor(private http: HttpClient) { }
API='http://192.168.0.78:8080'

obtenerDatos(): Observable<any> {

  return this.http.get(this.API+'/productos/traer');
}

obtenerWeb(): Observable<any> {
  return this.http.get(this.API+'/web/traer');
}

obtenerMl(): Observable<any> {
  return this.http.get('../assets/pubMl.json');
  //return this.http.get('http://localhost:8080/producto/traer')
}

crearProducto(body): Observable<any>{
  return this.http.post('http://localhost:8080/productos/crear', body);   
  
}

crearProductos(body){
  return this.http.post('http://localhost:8080/productos/batch', body);
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

editarPubli(id,params): Observable<any>{
  return this.http.put<any>(this.API+'/web/editar/' +id , params);
}

eliminarPubli(id): Observable<any> {
  return this.http.delete<any>(this.API+'/web/borrar/' + id);
}

actuStocksWeb(body): Observable<any>{
  return this.http.post<any>(this.API+'productos/actualizar/stock',body);
}

guardar(body:any){
  //this.http.post('http://localhost:8080/productos.json',body)
  //fs.writeFileSync('http://localhost:8080/productos.json', JSON.stringify(body))

}


}

