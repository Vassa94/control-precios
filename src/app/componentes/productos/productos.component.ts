import { Component, OnInit } from '@angular/core';
import { BDService } from 'src/app/services/bd.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';

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
        this.headers = ["Codigo Oxi","Nombre","Marca","Cod. Fabrica","Cant.","Precio actual","Stock"]
        //
        
   
      });
    }

    view(cont){

    }
  

}
