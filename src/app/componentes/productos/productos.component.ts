import { Component, OnInit } from '@angular/core';
import { BDService } from 'src/app/services/bd.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {

  productos:any;
  headers:any;
  headers2:any;
  index:number = 0;


  constructor(private datosSis: BDService, private modalService: NgbModal,) { 
    

  }

  fichaProducto = new FormGroup({
    identificador: new FormControl(),
    codigo: new FormControl(),
    marca: new FormControl(),
    codFabrica: new FormControl(),
    nombre: new FormControl(),
    cant: new FormControl(),
    precioAct: new FormControl(),
    peso: new FormControl(),
    alto: new FormControl(),
    ancho: new FormControl(),
    prof: new FormControl(),
    stock: new FormControl(),
    mostrar: new FormControl(),
    tags: new FormControl()
  });

  ngOnInit(): void {
    this.getProductos();

    

  }
 
  getProductos():void {
    this.datosSis.obtenerDatos().subscribe((data) => {
        this.productos = data;
        this.headers = ["Codigo Oxi","Nombre","Marca","Cod. Fabrica","Cant.","Precio actual","Stock"]
        this.headers2 = ["codigoOxi","nombre","marca","codFabrica","cant","precioAct","stock"]
        
   
      });
    }

    view(cont,i){
      this.index = i;
      /*this.fichaProducto.setValue({
        identificador: this.productos[i].identificador,
        codigo: this.productos[i].identificador,
        marca: this.productos[i].identificador,
        codFabrica: this.productos[i].identificador,
        nombre: this.productos[i].identificador,
        cant: this.productos[i].identificador,
        precioAct: this.productos[i].identificador,
        peso: this.productos[i].identificador,
        alto: this.productos[i].identificador,
        ancho: this.productos[i].identificador,
        prof: this.productos[i].identificador,
        stock: this.productos[i].identificador,
        mostrar: this.productos[i].identificador,
        tags: this.productos[i].identificador
      });*/
      console.log(this.productos[this.index]);
      
      this.modalService.open(cont, { centered: true , size: 'lg'});
    }
  

}
