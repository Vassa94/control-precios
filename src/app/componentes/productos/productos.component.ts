import { Component, OnInit } from '@angular/core';
import { BDService } from 'src/app/services/bd.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, NgForm, Validators, NgModel } from '@angular/forms';
import {NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, map, Observable, Subject } from 'rxjs';
import { FilterPipe } from 'src/app/pipe/filter.pipe';

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
  search: string;
  filteredProductos: Record<string, any>[]  = [];
  


  constructor(private datosSis: BDService, private modalService: NgbModal,private formModule:NgbModule) { 
    this.search = '';

  }

  

  producto= new FormGroup ({
    codigo: new FormControl(),
    cod_Fabrica: new FormControl(),
    descripcion: new FormControl(),
    marca: new FormControl(),
    precioPublico: new FormControl(),
    stock: new FormControl()
  })

  ngOnInit(): void {
    const search$ = new Subject<string>();
    this.getProductos();
    this.searchProduct(search$).subscribe(productos => this.filteredProductos = productos);

  }
 
  getProductos():void {
    this.datosSis.obtenerDatos().subscribe((data) => {
        this.productos = data;
        this.headers = ["Codigo Oxi","Nombre","Marca","Cod. Fabrica","Precio actual","Stock"];
        this.headers2 = ["codigo","descripcion","marca","cod_Fabrica","precioPublico","stock"];
        console.table(this.productos);
        console.log(this.headers2);
        
        
        
   
      });
    }

    view(cont,row){
      this.producto.setValue({
        codigo: row.codigo,
        marca: row.marca,
        cod_Fabrica: row.cod_Fabrica,
        descripcion: row.descripcion,
        stock: row.stock,
        precioPublico: row.precioPublico,
      })
      this.modalService.open(cont, { centered: true });
    }

  new() {
    this.producto.setValue({
      codigo: " ",
      marca: " ",
      cod_Fabrica: " ",
      descripcion: " ",
      stock: " ",
      precioPublico: " ",
    })
  }


    form(productNew){
      this.new();
      this.modalService.open(productNew,{centered: true}) ;
    }

    agregarProducto(){

    }

    searchProduct = (text$: Observable<string>) =>
    text$.pipe(
      
      debounceTime(200),
      map((term: string) => term === '' ? []
        : this.productos.filter(v => v.descripcion.toLowerCase().includes(term.toLowerCase()) ||
                                    v.marca.toLowerCase().includes(term.toLowerCase()) ||
                                    v.codigo.toString().toLowerCase().includes(term.toLowerCase()) ||
                                    v.cod_Fabrica.toString().toLowerCase().includes(term.toLowerCase()))
                                    .slice(0, 10))
    )


  sort(event) {
    this.productos.sort((a, b) => {
      if (a[event.column] < b[event.column]) {
        return event.order === 'asc' ? -1 : 1;
      } else if (a[event.column] > b[event.column]) {
        return event.order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }
  

}
