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


guardar(body:any){
  //this.http.post('http://localhost:8080/productos.json',body)
  //fs.writeFileSync('http://localhost:8080/productos.json', JSON.stringify(body))

}


}

