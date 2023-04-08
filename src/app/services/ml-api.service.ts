import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MlApiService {
  API = 'https://api.mercadolibre.com';
  seller_id = '33953861';
  token = '';
  expires_in = 21600;
  sheet: string = '../assets/var.json';
  sheet2: string = 'C:/control_precios/control-de-precios/out/control-de-precios-win32-x64/resources/app/src/assets/var.json'
  constructor(private http: HttpClient) { }

  getNewToken() {
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    });
  
    const refresh_token = localStorage.getItem('refresh_token');
    const body = `grant_type=refresh_token&client_id=2720596362974064&client_secret=5B2NxORFWnFHyCk1zQ1h3qHAFqjc4zED&refresh_token=${refresh_token}`;
  
    this.http.post('https://api.mercadolibre.com/oauth/token', body, { headers })
      .subscribe(response => {
        const access_token = response['access_token'];
        const expires_in = response['expires_in'];
        const new_refresh_token = response['refresh_token'];
        // Guarde el nuevo token, su tiempo de expiración y el nuevo refresh token en su aplicación
      });
  }

  obtenerDatosReclamos(): Observable<any> {
    
    return this.http.get(this.sheet2);

  }

  obtenerMl(): Observable<any> {
    
    
    return this.http.get('C:/control_precios/control-de-precios/out/control-de-precios-win32-x64/resources/app/src/assetspubMl.json');
    //return this.http.get('http://localhost:8080/producto/traer')
  }



  obtenerTxt():Observable<any> {
    return this.http.get('https://drive.google.com/file/d/16xp5K_XZUsOEX8EjdI4-MjufUFucb04Z/view')
  }



}
