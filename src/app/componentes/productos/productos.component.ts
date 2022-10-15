import { Component, OnInit } from '@angular/core';
import { BDService } from 'src/app/services/bd.service';
import { Oximercedes } from 'src/app/interface/inter';
import { DataTablesModule, DataTableDirective } from 'angular-datatables';


@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {

  productos:any;
  headers:any;
  objectKeys: any;
  dtOptions: DataTables.Settings = {};


  constructor(private datosSis: BDService) { 
    this.objectKeys = Object.keys;

  }

  ngOnInit(): void {
    this.getProductos();

    this.dtOptions = {
      pagingType: 'full_numbers'
    };

  }
 
  getProductos():void {
    this.datosSis.obtenerDatos().subscribe((data) => {
        this.productos = data;
        this.headers = Object.keys(data[0]);
        
   
      });
    }
  

}
