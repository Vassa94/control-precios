import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class BDService {

  constructor(private http: HttpClient) { }


obtenerDatos(): Observable<any> {

  
  return this.http.get('../assets/datos.json');
  
  
}

}

