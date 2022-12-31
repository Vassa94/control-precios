import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';




@Injectable({
  providedIn: 'root'
})
export class BDService {

  constructor(private http: HttpClient) { }


obtenerDatos(): Observable<any> {

  //return this.http.get('http://localhost:8080/producto/traer')
  //return this.http.get('../assets/datos.json');
  return this.http.get('../assets/productos.json');
}

obtenerWeb(): Observable<any> {
  return this.http.get('../assets/pubWeb.json');
}


guardar(body:any){
  //this.http.post('http://localhost:8080/productos.json',body)
  //fs.writeFileSync('http://localhost:8080/productos.json', JSON.stringify(body))

}


}

