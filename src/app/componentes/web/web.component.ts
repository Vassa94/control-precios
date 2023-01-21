import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import *  as Papa from 'papaparse';
import * as FileSaver from 'file-saver';
import { BDService } from 'src/app/services/bd.service';
import Swal from 'sweetalert2';
import * as normalize from 'normalize-strings';



@Component({
  selector: 'app-web',
  templateUrl: './web.component.html',
  styleUrls: ['./web.component.css']
})
export class WebComponent implements OnInit {
  web: any;
  headers: any;
  headers2: any;
  search: string = '';
  cargando: boolean = true;
  reader = new FileReader();
  selector: string = '';

  constructor(private datosSis: BDService, private modalService: NgbModal, private formModule: NgbModule) { }

  ngOnInit(): void {
    this.getProductos();
  }

  getProductos(): void {
    this.datosSis.obtenerWeb().toPromise().then((data) => {
      this.web = data;
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
        "Tags",
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
        "tags",
        "marca"];

      this.cargando = false;

    });


  }

  view(cont, row) {
    /* this.web.setValue({
      codigo: row.codigo,
      marca: row.marca,
      cod_Fabrica: row.cod_Fabrica,
      descripcion: row.descripcion,
      stock: row.stock,
      precioPublico: row.precioPublico,
    }) */
    this.modalService.open(cont, { centered: true });
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
      this.reader.readAsText(file);
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
            } else {
              for (let i = 0; i < data.length; i++) {
                if (data[i]['Codigo'] !== undefined && data[i]['Codigo'] !== null) {
                  data[i]['Codigo'] = data[i]['Codigo'].split(',');
                }
              }
              this.datosSis.listaWeb(data);
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

  lista(actualizar) {
    this.selector = "publicaciones";
    this.modalService.open(actualizar, { centered: true })
  }




}

