import { Component, OnInit } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { FormControl, FormGroup, NgForm, Validators, NgModel } from '@angular/forms';
import { BDService } from 'src/app/services/bd.service';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import * as normalize from 'normalize-strings';
import Swal from 'sweetalert2';
import *  as Papa from 'papaparse';
import * as FileSaver from 'file-saver';
import { tap } from 'rxjs';

@Component({
  selector: 'app-web',
  templateUrl: './web.component.html',
  styleUrls: ['./web.component.css']
})
export class WebComponent implements OnInit {
  web: any;
  webBackup: any;
  headers: any;
  headers2: any;
  filtro: string = '';
  cargando: boolean = true;
  reader = new FileReader();
  selector: string = '';
  modificaEnvio: boolean = false;

  constructor(private datosSis: BDService, private modalService: NgbModal, private formModule: NgbModule) { }

  publicacion = new FormGroup({
    id: new FormControl(),
    codigo: new FormControl(),
    nombre: new FormControl(),
    categoria: new FormControl(),
    pack: new FormControl(),
    precio: new FormControl(),
    precioProm: new FormControl(),
    peso: new FormControl(),
    alto: new FormControl(),
    ancho: new FormControl(),
    profundidad: new FormControl(),
    stock: new FormControl(),
    mostrar: new FormControl(),
    envio: new FormControl(),
    marca: new FormControl(),
    ean: new FormControl(),
    url: new FormControl(),
  })

  ngOnInit(): void {
    this.getProductos();
  }

  getProductos(): void {
    this.datosSis.obtenerWeb().toPromise().then((data) => {
      this.web = data;
      this.webBackup = data;
      this.headers = ["Nombre",
        "Precio",
        "Oferta",
        "Peso",
        "Alto",
        "Ancho",
        "Prof.",
        "Stock",
        "Codigo",
        "Mostrar",
        "Envio g.",
        "Marca"];
      this.headers2 = ["nombre",
        "precio",
        "precioProm",
        "peso",
        "alto",
        "ancho",
        "profundidad",
        "stock",
        "codigo",
        "mostrar",
        "envio",
        "marca"];

      this.cargando = false;

    },
      (error) => {
        this.cargando = false;
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'No esta habilitado el backend!',
          footer: `<a href="/guia">¿Por qué tengo este problema?</a>`
        })
        console.log("Ha ocurrido un error al obtener los productos:", error);
      }
    );
  }

  view(cont, row) {
    this.modalService.open(cont, { centered: true });
  }

  estandarizador(data) {
    let cod: number[] = [];


    if (data.SKU) {
      let sku = data.SKU.split(',');
      for (let j = 0; j < sku.length; j++) {
        cod.push(parseInt(sku[j]));
      }
    }
    data["Mostrar en tienda"] = (data["Mostrar en tienda"] === 'SI') ? true : false;
    data["Envío sin cargo"] = (data["Envío sin cargo"] === 'SI') ? true : false;
    let precio = data.Precio;
    if (precio) {
      precio = precio.replace(',', '');
      precio = parseFloat(precio);
      precio = Math.floor(precio);
      data.Precio = precio;

    }

    const body = {
      "nombre": data.Nombre,
      "categorias": data["Categorías"],
      "nomProp1": data["Nombre de propiedad 1"],
      "valProp1": data["Valor de propiedad 1"],
      "nomProp2": data["Nombre de propiedad 2"],
      "valProp2": data["Valor de propiedad 2"],
      "nomProp3": data["Nombre de propiedad 3"],
      "valProp3": data["Valor de propiedad 3"],
      "pack": 1,
      "precio": data["Precio"],
      "precioProm": data["Precio promocional"],
      "peso": parseFloat(data["Peso (kg)"]),
      "alto": parseFloat(data["Alto (cm)"]),
      "ancho": parseFloat(data["Ancho (cm)"]),
      "profundidad": parseFloat(data["Profundidad (cm)"]),
      "stock": parseFloat(data["Stock"]),
      "codigo": cod,
      "mostrar": data["Mostrar en tienda"],
      "envio": data["Envío sin cargo"],
      "tags": data["Tags"],
      "marca": data["Marca"],
      "url": data["Identificador de URL"],
      "ean": data["Código de barras"]
    }
    this.datosSis.crearPubli(body).pipe(
      tap(() => { }, error => { console.log(error) })
    ).subscribe();
  }

  descargarCSV() {
    let data = this.web;
    const csvData = Papa.unparse(data);
    let date = new Date().toLocaleString();
    let fileName = 'web_' + date + '.csv';
    let blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
    FileSaver.saveAs(blob, fileName);
  }

  parser(event: any) {
    let file: File = event.target.files[0];
    if (file) {
      this.reader.readAsText(file, 'ISO-8859-3');
      this.reader.onload = (event: any) => {
        let content = event.target.result;
        content = normalize(content, { form: 'NFD' });
        Papa.parse(content, {
          header: true,
          encoding: "UTF-8",
          complete: (results) => {
            let data = results.data;
            if (this.selector === "stock") {
              this.datosSis.stockWeb(data);
            } else if (this.selector === "publicaciones") {
              for (let i = 0; i < data.length; i++) {
                if (data[i]['Codigo'] !== undefined && data[i]['Codigo'] !== null) {
                  data[i]['Codigo'] = data[i]['Codigo'].split(',');
                }
              }
              this.datosSis.listaWeb(data);
            } else {
              this.export(data);
            }
          }
        });
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Debes cargar un archivo!',
        footer: '<a href="">Por que tengo este problema?</a>'
      })
    }
  }

  stock(actualizar) {
    this.selector = "stock"
    this.modalService.open(actualizar, { centered: true })
  }

  lista(actualizar) {     //desarrollo. no uso
    this.selector = "publicaciones";
    this.modalService.open(actualizar, { centered: true })
  }

  exp(actualizar) {
    this.selector = "exportar";
    this.modalService.open(actualizar, { centered: true })
  }

  editarPublicacion(editar, fila) {
    this.publicacion.setValue({
      id: fila.id,
      codigo: fila.codigo,
      nombre: fila.nombre,
      categoria: fila.categorias,
      pack: fila.pack,
      precio: fila.precio,
      precioProm: fila.precioProm,
      peso: fila.peso,
      alto: fila.alto,
      ancho: fila.ancho,
      profundidad: fila.profundidad,
      stock: fila.stock,
      mostrar: fila.mostrar,
      envio: fila.envio,
      marca: fila.marca,
      ean: fila.ean,
      url: fila.url,
    })


    this.modalService.open(editar, { centered: true, size: 'xl', backdrop: 'static' }).result.then(() => {
      if (!(this.publicacion.value.precioProm)) {
        this.publicacion.value.precioProm = 0;
      }
      const params = new HttpParams()
        .set("SKU", this.publicacion.value.codigo)
        .set("nombre", this.publicacion.value.nombre)
        .set("categoria", this.publicacion.value.categoria)
        .set("pack", parseInt(this.publicacion.value.pack))
        .set("precio", parseInt(this.publicacion.value.precio))
        .set("precioProm", parseInt(this.publicacion.value.precioProm))
        .set("peso", parseFloat(this.publicacion.value.peso))
        .set("alto", parseFloat(this.publicacion.value.alto))
        .set("ancho", parseFloat(this.publicacion.value.ancho))
        .set("profundidad", parseFloat(this.publicacion.value.profundidad))
        .set("stock", parseInt(this.publicacion.value.stock))
        .set("mostrar", this.publicacion.value.mostrar)
        .set("envio", this.publicacion.value.envio)
        .set("marca", this.publicacion.value.marca)
        .set("ean", this.publicacion.value.ean)
        .set("identificador", this.publicacion.value.url)

      const id = this.publicacion.value.id;

      this.datosSis.editarPubli(id, params).pipe(
        tap(() => { }, error => { console.log(error) })
      ).subscribe();

    });

  }

  eliminarPubli(id) {
    Swal.fire({
      icon: 'error',
      title: 'Quiere eliminar la publicacion?',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: 'Ok',
      denyButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.datosSis.eliminarPubli(id).pipe(
          tap(() => { }, error => { console.log(error) })
        ).subscribe();
      } else {
        Swal.fire('No se borro la publicacion', '', 'info')
      }
    });

  }

  export(data) {
    let encontrado: boolean;
    let cont: number = 0;
    let stock: any = [];
    let id: number = 0;
    for (let i = 0; i < data.length; i++) {
      encontrado = false;
      for (let j = 0; j < this.web.length; j++) {
        if (this.web[j].url !== undefined && this.web[j].url !== null && this.web[j].url === data[i]["Identificador de URL"]) {
          if (!(this.web[j].precioProm)) {
            if (data[i]['Marca'] !== "Stihl") {
              data[i].Precio = this.web[j].precio;
            } else {
              data[i].Precio = 0;
            }
          } else {
            //data[i]['Precio promocional'] = this.web[j].precioProm;
          }
          data[i]['Envío sin cargo'] = (this.web[j].envio) ? "SI" : "NO";
          data[i]['Mostrar en tienda'] = (this.web[j].mostrar) ? "SI" : "NO";
          data[i]['Código de barras'] = this.web[j].ean;

          encontrado = true;
          id = this.web[j].id;
        }
      }
      if (!encontrado && data[i]["Identificador de URL"].trim() !== "") {
        this.estandarizador(data[i]);
        cont++;
      } else {
        stock.push({ 'codigo': id, 'stock': parseInt(data[i]['Stock']) });
      }
    }
    this.datosSis.actuStocksWeb(stock).pipe(
      tap(() => { }, error => { console.log(error) })
    ).subscribe();

    const csvData = Papa.unparse(data);
    let date = new Date().toLocaleString();
    let fileName = 'Subir-' + date + '.csv';
    let blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
    FileSaver.saveAs(blob, fileName);

    Swal.fire({
      title: '¡Archivo generado!',
      text: 'se cargaron ' + cont + ' publicaciones',
      icon: 'success',
      showConfirmButton: true,
    });
  }

  filtrarTabla() {
    let filtroMinusculas = this.filtro.toLowerCase();
    this.web = this.webBackup.filter(row => {
      let nombreMinusculas = row.nombre ? row.nombre.toLowerCase() : '';
      let marcaMinusculas = row.marca ? row.marca.toLowerCase() : '';
      let codigoMinusculas = row.codigo ? row.codigo.toString().toLowerCase() : '';
      return nombreMinusculas.includes(filtroMinusculas) ||
        marcaMinusculas.includes(filtroMinusculas) ||
        codigoMinusculas.includes(filtroMinusculas);
    });
  }


}

