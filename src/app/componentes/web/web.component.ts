import { Component, OnInit } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { FormControl, FormGroup, NgForm, Validators, NgModel } from '@angular/forms';
import { BDService } from 'src/app/services/bd.service';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import * as normalize from 'normalize-strings';
import Swal from 'sweetalert2';
import *  as Papa from 'papaparse';
import * as FileSaver from 'file-saver';
import { concat, Observable, shareReplay, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-web',
  templateUrl: './web.component.html',
  styleUrls: ['./web.component.css']
})
export class WebComponent implements OnInit {
  /* Declaración de variables. */
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
  editando = null;
  p: number = 1;
  windowHeight = window.innerHeight;
  tableHeight = 0.69 * this.windowHeight;
  rowHeight = 42;
  productosPorPagina = Math.ceil(this.tableHeight / this.rowHeight);;

  /**
   * La función constructora se utiliza para inicializar la clase y se llama cuando se crea una
   * instancia de la clase.
   * @param {BDService} datosSis - BDServicio
   * @param {NgbModal} modalService - NgbModal,
   * @param {NgbModule} formModule - Módulo Ngb
   */
  constructor(private datosSis: BDService,
    private modalService: NgbModal,
    private formModule: NgbModule) {

  }

  /* Creando un FormGroup con FormControls. */
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

  /**
   * La función ngOnInit() es un enlace de ciclo de vida que se llama después de que Angular haya
   * inicializado todas las propiedades vinculadas a datos de una directiva.
   */
  ngOnInit(): void {
    this.getProductos();
    
  }

  getProductos(): void {
    const cache$: Observable<any> = this.datosSis.obtenerWeb().pipe(
      // Caché de la respuesta
      shareReplay({ bufferSize: 1, refCount: true, windowTime: 300000 })
    );
    const http$: Observable<any> = this.datosSis.obtenerWeb().pipe(
      // Deshabilita la caché para esta petición
      tap(() => console.log('Petición HTTP en segundo plano...')),
      switchMap(() => this.datosSis.obtenerWeb()),
      // Actualiza la caché con la nueva respuesta
      tap((data) => console.log('Actualizando caché...', data)),
      shareReplay({ bufferSize: 1, refCount: true, windowTime: 300000 })
    );
    const web$: Observable<any> = concat(cache$, http$);

    web$.subscribe(
      (data) => {
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

  /**
   * Obtiene los productos de la base de datos y los guarda en la variable "web" y "webBackup"
   */
  /* getProductos(): void {
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


  }*/

  /**
   * "Obtener datos de un archivo json local y luego usar esos
   * datos para compararlos con otra matriz de datos. Luego envio el resultado de
   * esa comparación a otra matriz".
   */


  getStockLocal() {
    this.datosSis.obtenerDatos().toPromise().then((data) => {
      this.stockCodigos = this.dataReductor(data)
      for (let i = 0; i < this.web.length; i++) {
        let valor: boolean = this.stockWarning(this.web[i])
        this.warning.push(valor);
      }
    })
  }

  /**
   * Si el stock del producto de sistema es menor que el stock del producto web , devuelve verdadero, de lo contrario,
   * devuelve falso.
   */
  stockWarning(product): boolean {
    let codigos = product.codigo;
    let stockProducto = this.stockCodigos.find((s) => s.codigo === codigos[0])?.localStock;
    if (stockProducto < product.stock) {
      return true;
    }
    return false;
  }

  /* Creando una nueva matriz de objetos con las propiedades codigo y localStock. */
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

  /**
   * Toma un objeto JSON, modifica algunas de sus propiedades para amoldarlo y luego lo envía a un servidor.
   */
  dataStandardizer(data): void {
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
    let precioProm = data['Precio promocional']
    if (precio) {
      precio = precio.replace(',', '');
      precio = parseFloat(precio);
      precio = Math.floor(precio);
      data.Precio = precio;
    }
    if (precioProm) {
      precioProm = precioProm.replace(',', '');
      precioProm = parseFloat(precioProm);
      precioProm = Math.floor(precioProm);
      data['Precio promocional'] = precioProm;
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

  /**
   * Toma los datos de la variable web, los convierte en un archivo csv y luego los guarda en la
   * computadora del usuario.
   */
  csvDownload(target, nombre) {
    let data = target;
    const csvData = Papa.unparse(data);
    let date = new Date().toLocaleString();
    let fileName = nombre + date + '.csv';
    let blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
    FileSaver.saveAs(blob, fileName);
  }

  /**
   * Se llama a la función de clasificación con el valor de la propiedad por la que se va a clasificar
   * y un valor booleano que determina si el orden de clasificación es ascendente o descendente.
   * @param valor - el valor a ordenar por
   * @param {boolean} ordenInverso - booleano
   */
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

  /**
   * Lee un archivo CSV, lo analiza y luego lo envía a una función que lo enviará a un servidor.
   */
  parser(event: any) {
    let file: File = event.target.files[0];
    /* Leer un archivo CSV y analizarlo. */
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

  /**
   * Abre una ventana modal cuando el usuario hace clic en un botón.
   * @param actualizar - es el id del modal
   */
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


  /**
   * Actualizar los datos en la base de datos y luego actualizar los datos en la
   * tabla.
   * </código>
   * @param editar - es el modal que se abre.
   * @param fila - Es un objeto que contiene los datos de la fila que quiero editar.
   */
  editPublication(editar, fila) {
    /* Configuración del valor del formulario. */
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

    /* Abriendo un modal y luego enviando una solicitud al servidor. */
    this.modalService.open(editar, { centered: true, size: 'xl', backdrop: 'static' }).result.then(() => {
      /* Comprobando si el valor de la variable precioProm es nulo o indefinido. Si es así, lo pone a 0. */
      if (!(this.publicacion.value.precioProm)) {
        this.publicacion.value.precioProm = 0;
      }
      /* Crear un nuevo objeto HttpParams y luego establecer los valores de las propiedades. */
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
      /* Actualización de los datos en la base de datos. */
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
          const indice = this.web.findIndex(obj => obj.id === id);
          if (indice >= 0) {
            this.web[indice] = objetoActualizado;
          } else {
            this.web.push(objetoActualizado);
          }
          this.web = [...this.web];
        }, error => { console.log(error) })
      ).subscribe();
    });
  }

  /**
   * Quiero eliminar una publicación, pero primero quiero confirmarla.
   * @param id - identificación de la publicación
   */
  deletePublication(id) {
    /* Una alerta que le pregunta al usuario si desea eliminar una publicación. */
    Swal.fire({
      icon: 'error',
      title: 'Quiere eliminar la publicacion?',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: 'Ok',
      denyButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
        const indiceAEliminar = this.web.findIndex(producto => producto.id === id);
        // Si el objeto existe, elimínalo del array utilizando splice()
        if (indiceAEliminar !== -1) {
          this.web.splice(indiceAEliminar, 1);
        } else {
          console.log(`El objeto con ID ${id} no existe en el array`);
        }
        this.datosSis.eliminarPubli(id).pipe(
          tap(() => { }, error => { console.log(error) })
        ).subscribe();
      } else {
        Swal.fire('No se borro la publicacion', '', 'info')
      }
    });

  }

  /**
   * Toma un archivo CSV, lo analiza y luego lo guarda como un nuevo archivo CSV.
   * @param data - es la matriz de objetos que quiero exportar a CSV
   */
  exportToTiendaNube(data) {
    let encontrado: boolean;
    let cont: number = 0;
    let stock: any = [];
    let nuevos: any = [];
    let id: number = 0;
    for (let i = 0; i < data.length; i++) {
      encontrado = false;
      /* Comprobando si la url no es indefinida o nula y si es igual a los datos[i]["Identificador de
      URL"] */
      for (let j = 0; j < this.webBackup.length; j++) {

        if (this.webBackup[j].url !== undefined && this.webBackup[j].url !== null && this.webBackup[j].url === data[i]["Identificador de URL"] && (j > 0 && this.webBackup[j-1].url !== data[i]["Identificador de URL"])) {
          if (!(this.webBackup[j].precioProm)) {
            if (data[i]['Marca'] !== "Stihl") {
              data[i].Precio = this.webBackup[j].precio;
            } else {
              data[i].Precio = 0;
            }
          } else {
            //data[i]['Precio promocional'] = this.webBackup[j].precioProm;
          }
          
          if (data[i]['Nombre'].length > 0) {
            data[i]['Envío sin cargo'] = (this.webBackup[j].envio) ? "SI" : "NO";
            data[i]['Mostrar en tienda'] = (this.webBackup[j].mostrar) ? "SI" : "NO";
          }

          data[i]['Código de barras'] = this.webBackup[j].ean;
          data[i]['Peso (kg)'] = this.webBackup[j].peso.toFixed(2);
          data[i]['Alto (cm)'] = this.webBackup[j].alto.toFixed(2);
          data[i]['Ancho (cm)'] = this.webBackup[j].ancho.toFixed(2);
          data[i]['Profundidad (cm)'] = this.webBackup[j].profundidad.toFixed(2);

          encontrado = true;
          id = this.webBackup[j].id;

        }
      }
      /* Comprobando si no se encuentran los datos y si la URL no está vacía. Si ambas condiciones son
      verdaderas, llamará a la función dataStandardizer. */
      if (!encontrado && data[i]["Identificador de URL"].trim() !== "") {
        this.dataStandardizer(data[i]);

        cont++;
        nuevos.push({ 'Codigo': data[i].SKU, 'Nombre': data[i].Nombre, 'marca': data[i].Marca })
        /* Agregando los datos en la matriz. */
      } else {
        stock.push({ 'codigo': id, 'stock': parseInt(data[i]['Stock']) });
      }
    }
    /* actualizar los stocks en BD. */
    this.datosSis.actuStocksWeb(stock).pipe(
      tap(() => { }, error => { console.log(error) })
    ).subscribe();

    /* Convertir los datos en un archivo CSV y descargarlo. */
    const csvData = Papa.unparse(data);
    let date = new Date().toLocaleString();
    let fileName = 'Subir-' + date + '.csv';
    let blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
    FileSaver.saveAs(blob, fileName);

    Swal.fire({
      title: '¡Archivo generado!',
      text: 'se encontraron ' + cont + ' nuevas publicaciones',
      icon: 'success',
      showConfirmButton: true,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed && cont > 0) {
        this.csvDownload(nuevos, 'nuevos_');
      }
    });
  }

  /**
   * Filtra la matriz web por la cadena de filtro y devuelve la matriz filtrada.
   */
  tableSearchFilter() {
    let filtroMinusculas = this.filtro.toLowerCase().trim();
    this.web = this.webBackup.filter(row => {
      let nombreMinusculas = row.nombre ? row.nombre.toLowerCase() : '';
      let marcaMinusculas = row.marca ? row.marca.toLowerCase() : '';
      let codigoMinusculas = row.codigo ? row.codigo.toString().toLowerCase() : '';
      return nombreMinusculas.includes(filtroMinusculas) ||
        marcaMinusculas.includes(filtroMinusculas) ||
        codigoMinusculas.includes(filtroMinusculas);
    });
  }

  editEnvio(data) {
    this.editando = data;
    data.envio = !data.envio;
    this.publicacion.setValue({
      id: data.id,
      codigo: data.codigo,
      nombre: data.nombre,
      categoria: data.categorias,
      pack: data.pack,
      precio: data.precio,
      precioProm: data.precioProm,
      peso: data.peso,
      alto: data.alto,
      ancho: data.ancho,
      profundidad: data.profundidad,
      stock: data.stock,
      mostrar: data.mostrar,
      envio: data.envio,
      marca: data.marca.trim(),
      ean: data.ean,
      url: data.url,
    })

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
    /* Actualización de los datos en la base de datos. */
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
        const indice = this.web.findIndex(obj => obj.id === id);
        if (indice >= 0) {
          this.web[indice] = objetoActualizado;
        } else {
          this.web.push(objetoActualizado);
        }
        this.web = [...this.web];
      }, error => {
        console.log(error)
        Swal.fire({
          title: 'Hubo un error!',
          text: 'No se modifico el envio',
          icon: 'error',
          showConfirmButton: true,
        });
      })
    ).subscribe();
  }





}

