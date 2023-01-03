import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
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
      console.log(this.headers2);

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



  filtrarTabla($event) {
    // Obtiene el término de búsqueda del cuadro de búsqueda
    let busqueda = $event.target.value.toLowerCase();

    // Itera sobre cada fila de la tabla
    let filas = Array.from(document.querySelectorAll("tbody tr"));
    for (let fila of filas) {
      let celdas = Array.from(fila.querySelectorAll("td"));
      let coincidencias = 0;

      // Compara el valor de cada celda con el término de búsqueda
      for (let celda of celdas) {
        if (celda.innerHTML.toLowerCase().includes(busqueda)) {
          coincidencias++;
        }
      }

      // Muestra la fila si hay al menos una coincidencia
      let row: HTMLTableRowElement = fila;
      if (coincidencias > 0) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    }
  }
}

