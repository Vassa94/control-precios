import { Component, OnInit } from '@angular/core';
import { BDService } from 'src/app/services/bd.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, NgForm, Validators, NgModel } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, map, Observable, Subject, Subscription } from 'rxjs';
import { FilterPipe } from 'src/app/pipe/filter.pipe';
import * as Papa from 'papaparse';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';
import { HttpParams } from '@angular/common/http';



@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {

  productos: any;
  headers: any;
  headers2: any;
  search: string;
  filteredProductos: Record<string, any>[] = [];
  cargando: boolean = true;
  edt: boolean = false;
  actualizador: any;
  csvFile: any;
  reader = new FileReader();
  selector: string = '';



  constructor(private datosSis: BDService, private modalService: NgbModal, private formModule: NgbModule) {
    this.search = '';
  }



  producto = new FormGroup({
    codigo: new FormControl(),
    cod_Fabrica: new FormControl(),
    descripcion: new FormControl(),
    marca: new FormControl(),
    precioPublico: new FormControl(),
    stock: new FormControl()
  })

  file = new FormGroup({
    csv: new FormControl('')
  })

  ngOnInit(): void {
    const search$ = new Subject<string>();
    this.getProductos();
    this.searchProduct(search$).subscribe(productos => this.filteredProductos = productos);

  }

  /* Obtener los datos de la base de datos y almacenarlos en la variable productos. */
  getProductos(): void {
    this.datosSis.obtenerDatos().subscribe((data) => {
      this.productos = data;
      this.headers = ["Codigo Oxi", "Nombre", "Marca", "Cod. Fabrica", "Precio actual", "Stock"];
      this.headers2 = ["codigo", "descripcion", "marca", "cod_Fabrica", "precioPublico", "stock"];
      this.cargando = false;
    });
  }

  view(cont, row) {
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

  newF() {
    this.producto.setValue({
      codigo: " ",
      marca: " ",
      cod_Fabrica: " ",
      descripcion: " ",
      stock: " ",
      precioPublico: " ",
    })
  }

  parser(event: any) {
    let file: File = event.target.files[0];
    if (file) {
      this.reader.readAsText(file, 'ISO-8859-3');
      this.reader.onload = (event: any) => {
        let content = event.target.result;
        Papa.parse(content, {
          header: true,
          complete: (results) => {
            let data = results.data;
            this.estandarizador(data, this.selector);
          }
        });
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Debes cargar un archivo!',
        footer: '<a href="">Why do I have this issue?</a>'
      })
    }
  }

  act(actualizar) {
    this.selector = "precio";
    this.modalService.open(actualizar, { centered: true })
  };

  actStock(actualizar) {
    this.selector = "stock";
    this.modalService.open(actualizar, { centered: true })
  }

  form(productNew) {
    this.newF();
    this.modalService.open(productNew, { centered: true });
  }

  edit(product) {
    this.edt = true;
    this.producto.setValue({
      codigo: this.producto.value.codigo,
      marca: this.producto.value.marca,
      cod_Fabrica: this.producto.value.cod_Fabrica,
      descripcion: this.producto.value.descripcion,
      stock: this.producto.value.stock,
      precioPublico: this.producto.value.precioPublico
    })
    this.modalService.open(product, { centered: true });
  }


  actualizarProducto() {
    const id = this.producto.value.codigo;
    const params = new HttpParams()
      .set('codFabrica', this.producto.value.cod_Fabrica)
      .set('descripcion', this.producto.value.descripcion)
      .set('marca', this.producto.value.marca)
      .set('precioPub', this.producto.value.precioPublico)
      .set('stock', this.producto.value.stock)
    console.log(params);
    console.log(id);

    this.datosSis.actualizarProducto(id, params).subscribe((data) => { });
  }

  agregarProducto() {
    const body = {
      codigo: this.producto.value.codigo,
      marca: this.producto.value.marca,
      cod_Fabrica: this.producto.value.cod_Fabrica,
      descripcion: this.producto.value.descripcion,
      stock: this.producto.value.stock,
      precioPublico: this.producto.value.precioPublico
    };
    console.table(body)
    this.datosSis.crearProducto(body).subscribe((data) => { });
    Swal.fire({
      title: '¡Genial!',
      text: 'Producto Agregado',
      icon: 'success',
      showConfirmButton: false,
      timer: 1500,
    });
  }

  select() {
    if (this.edt) {
      this.actualizarProducto();
      console.log("edito");

    } else {
      //this.agregarProducto();
      console.log("nuevo");

    }
  }

  borrarProducto(id) {
    this.datosSis.borrarProducto(id).subscribe((data) => { })
    for (let i = 0; i < this.productos.length; i++) {
      if (this.productos[i].codigo === id) {
        this.productos.splice(i, 1);
      }
    }
  }



  actualizarPrecios(body) {
    if (!body[0].codigo || !body[0].precio) {
      console.table(body);
      Swal.fire({
        title: 'Oops...',
        text: 'El CSV no tiene la estructura correcta',
        icon: 'error',
        footer: 'Revisa que el archivo subido sea el correcto'
      });
    } else {
      this.datosSis.actuProductos(body).subscribe((data) => { });
      this.datosSis.actuWeb(body).subscribe((data) => { });
      Swal.fire({
        title: '¡Genial!',
        text: 'Precios actualizados',
        icon: 'success',
        showConfirmButton: false,
        timer: 2500,
      });
    }
  }

  actualizarStock(body) {
    if (!body[0].codigo || !body[0].stock) {
      Swal.fire({
        title: 'Oops...',
        text: 'El CSV no tiene la estructura correcta',
        icon: 'error',
        footer: 'Revisa que el archivo subido sea el correcto'
      });
    } else {
      this.datosSis.actuStock(body).subscribe((data) => { });
      Swal.fire({
        title: '¡Genial!',
        text: 'Stock actualizado',
        icon: 'success',
        showConfirmButton: false,
        timer: 2500,
      });
    }
  }

  estandarizador(data, destino) {
    const body: any[] = [];
    let aux = {};
    let col = (destino === 'precio') ? "PUBLICO" : "Total";
    for (let i = 0; i < data.length; i++) {
      let valor = data[i][col];
      if (valor) {
        valor = parseFloat(valor);
        valor = Math.floor(valor);
        data[i][col] = valor;
      }
      if (destino === "precio" && data[i]['Código']) {
        aux = { 'codigo': parseInt(data[i]['Código']), 'precio': data[i][col] };
      } else if (destino === "stock" && data[i]['Código']) {
        aux = { 'codigo': parseInt(data[i]['Código']), 'stock': data[i][col] };
      }
      body.push(aux);
      
    }
    console.table(body);
    if (destino === "precio") {
      this.actualizarPrecios(body);
    } else if (destino === "stock") {
      this.actualizarStock(body);
    }

  }

  descargarCSV() {
    let data = this.productos;
    const csvData = Papa.unparse(data);
    let date = new Date().toLocaleString();
    let fileName = 'productos_' + date + '.csv';
    let blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
    FileSaver.saveAs(blob, fileName);

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
