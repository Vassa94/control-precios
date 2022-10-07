import { Component, OnInit } from '@angular/core';
import { BDService } from 'src/app/services/bd.service';
import { Oximercedes } from 'src/app/interface/inter';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {

  productos:any;
  headers:any;
  objectKeys: any;
  


  constructor(private datosSis: BDService) { 
    this.objectKeys = Object.keys;

  }

  ngOnInit(): void {
    this.getProductos();

  }
 
  getProductos():void {
    this.datosSis.obtenerDatos().subscribe((data) => {
        this.productos = data;
        this.headers = Object.keys(data[0]);
        
   
      });
    }
  

}
