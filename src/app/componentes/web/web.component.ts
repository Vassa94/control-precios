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
  stockCodigos: Array<any> = [];
  headers: any;
  headers2: any;
  filtro: string = '';
  cargando: boolean = true;
  reader = new FileReader();
  selector: string = '';
  warning: Array<boolean> = [];

  constructor(private datosSis: BDService, private modalService: NgbModal, private formModule: NgbModule) {
    
  }

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
      this.getStockLocal();
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

  getStockLocal(): void {
    this.datosSis.obtenerDatos().toPromise().then((data) => {
      this.stockCodigos = this.dataReductor(data)
      for (let i = 0; i < this.web.length; i++) {
        let valor: boolean = this.stockWarning(this.web[i])
        this.warning.push(valor);
      }
    })    
  }

  stockWarning(product) {
    let codigos = product.codigo;
    
    let stockProducto = this.stockCodigos.find((s) => s.codigo === codigos[0])?.localStock;
     // Busca el stock correspondiente al código actual de product en stockCodigo
    if (stockProducto < product.stock) {
      return true; // Si encuentra al menos un código con stock menor que el correspondiente en stockCodigo, retorna true
    }
    return false; // Si llega aquí, es porque todos los códigos tienen stock igual o mayor que el correspondiente en stockCodigo
  }



  dataReductor(array: Array<any>): Array<any> {
    let stock: Array<any> = [];
    array.forEach((a) => {
      let codigo = a.codigo;
      let localStock = a.stock;
      let producto = { codigo, localStock };
      stock.push(producto);
    })

    return stock;
  }

  /* viewProduct(cont, row) {
    this.modalService.open(cont, { centered: true });
  } */

  dataStandardizer(data) {
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

  csvDownload() {
    let data = this.web;
    const csvData = Papa.unparse(data);
    let date = new Date().toLocaleString();
    let fileName = 'web_' + date + '.csv';
    let blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
    FileSaver.saveAs(blob, fileName);
  }

  sort(valor, ordenInverso: boolean) {
    this.web.sort((productoA, productoB) => {
      if (productoA[valor] < productoB[valor]) {
        return ordenInverso ? 1 : -1;
      } else if (productoA[valor] > productoB[valor]) {
        return ordenInverso ? -1 : 1;
      } else {
        return 0;
      }
    }, valor);
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
              this.exportToTiendaNube(data);
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

  modalStock(actualizar) {
    this.selector = "stock"
    this.modalService.open(actualizar, { centered: true })
  }

  /*  lista(actualizar) {     //desarrollo. no uso
     this.selector = "publicaciones";
     this.modalService.open(actualizar, { centered: true })
   }
  */
  exportToWeb(actualizar) {
    this.selector = "exportar";
    this.modalService.open(actualizar, { centered: true })
  }

  editPublication(editar, fila) {
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
        tap(() => {
          const objetoActualizado = {
            id: id,
            nombre: this.publicacion.value.nombre,
            categorias: this.publicacion.value.categoria,
            pack: parseInt(this.publicacion.value.pack),
            precio: parseInt(this.publicacion.value.precio),
            precioProm: parseInt(this.publicacion.value.precioProm),
            peso: parseFloat(this.publicacion.value.peso),
            alto: parseFloat(this.publicacion.value.alto),
            ancho: parseFloat(this.publicacion.value.ancho),
            profundidad: parseFloat(this.publicacion.value.profundidad),
            stock: parseInt(this.publicacion.value.stock),
            codigo: [this.publicacion.value.codigo],
            mostrar: this.publicacion.value.mostrar,
            envio: this.publicacion.value.envio,
            tags: '',
            marca: this.publicacion.value.marca,
            url: this.publicacion.value.url,
            ean: this.publicacion.value.ean,
          };

          // Buscar índice del objeto en el array que se está visualizando en pantalla
          const indice = this.web.findIndex(obj => obj.id === id);

          if (indice >= 0) {
            // Si el objeto existe en el array, actualizar valores del objeto
            this.web[indice] = objetoActualizado;
          } else {
            // Si el objeto no existe en el array, agregar el objeto al array
            this.web.push(objetoActualizado);
          }

          // Actualizar la variable del array con el nuevo array actualizado
          this.web = [...this.web];

        }, error => { console.log(error) })
      ).subscribe();

    });

  }

  deletePublication(id) {
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

  exportToTiendaNube(data) {
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
        this.dataStandardizer(data[i]);
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

  tableSearchFilter() {
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

