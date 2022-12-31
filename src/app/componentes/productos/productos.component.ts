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
  search: string;
  filteredProductos: Record<string, any>[]  = [];
  


  constructor(private datosSis: BDService, private modalService: NgbModal,private formModule:NgbModule) { 
    this.search = '';

  }

  

  producto= new FormGroup ({
    codigo: new FormControl('',[Validators.required, Validators.min(111111) ,Validators.max(999999)]),
    cod_Fabrica: new FormControl('',Validators.required),
    descripcion: new FormControl('',[Validators.required, Validators.maxLength(60)]),
    marca: new FormControl('',Validators.required),
    precioPublico: new FormControl('',Validators.required),
    stock: new FormControl('',Validators.required)
  })

  ngOnInit(): void {
    const search$ = new Subject<string>();
    this.getProductos();
    this.searchProduct(search$).subscribe(productos => this.filteredProductos = productos);

  }
 
  /* Obtener los datos de la base de datos y almacenarlos en la variable productos. */
  getProductos():void {
    this.datosSis.obtenerDatos().subscribe((data) => {
        this.productos = data;
        this.headers = ["Codigo Oxi","Nombre","Marca","Cod. Fabrica","Precio actual","Stock"];
        this.headers2 = ["codigo","descripcion","marca","cod_Fabrica","precioPublico","stock"];
        //console.table(this.productos);
        //console.log(this.headers2);
      });
    }

    /**
     * La función toma dos parámetros, el primero es el id del modal y el segundo es la fila de la
     * tabla
     * @param cont - es el id del modal
     * @param row - es la fila que se está editando.
     */
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

  /**
   * La función se llama cuando el usuario hace clic en el botón "Nuevo". Establece los valores del
   * formulario en cadenas vacías.
   */
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


    /**
     * Abre una ventana modal.
     * @param productNew - El nombre del modal que desea abrir.
     */
    form(productNew){
      this.new();
      this.modalService.open(productNew,{centered: true}) ;
    }

    agregarProducto(){
      console.log(this.producto.value);
      this.datosSis.guardar(this.producto.value)
      
    }

    /* Una función que se llama cuando el usuario escribe en la barra de búsqueda. Filtra los productos
    por nombre, marca, código o código de fábrica. */
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


  /**
   * Si la columna es la misma, no haga nada. Si la columna es diferente, ordene la matriz por columna
   * y ordene
   * @param event - El objeto de evento que desencadenó la ordenación.
   */
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
