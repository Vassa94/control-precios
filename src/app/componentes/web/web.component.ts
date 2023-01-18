import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import *  as Papa  from 'papaparse';
import * as FileSaver from 'file-saver';
import * as iconv from 'iconv-lite';
import { debounceTime, map, Observable } from 'rxjs';
import { BDService } from 'src/app/services/bd.service';
import { TruefalseComponent } from '../truefalse/truefalse.component';


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

  constructor(private datosSis: BDService, private modalService: NgbModal, private formModule: NgbModule) { }

  ngOnInit(): void {
    this.getProductos();
  }

  getProductos(): void {
    this.datosSis.obtenerWeb().toPromise().then((data) => {
      this.web = data;
      this.headers = ["Nombre",
        "Categorias",
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
        "categorias",
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
    /* let dataUTF8 = data.map(element => {
      for (let key in element) {
          element[key] = new TextEncoder().encode(element[key]);
      }
      return element;
    }); */
    const csvData = Papa.unparse(data);
    let date = new Date().toLocaleString();
    let fileName = 'web_' + date + '.csv';
    let blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
    FileSaver.saveAs(blob, fileName);
  }



  
}

