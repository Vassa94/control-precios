import { Component, OnInit } from '@angular/core';
import { BDService } from 'src/app/services/bd.service';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {

  productos:any;

  constructor(private datosSis: BDService) { }

  ngOnInit(): void {
    this.getProductos();
  }
 
  getProductos():void {
    this.datosSis.obtenerDatos().subscribe((data) => {
        this.productos = data.productos;
        console.log(this.productos);        
      });
    }
  

}
