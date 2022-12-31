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
  web:any;
  headers: any;
  headers2:any;
  search: string = '';
  cargando: boolean = true;

  constructor(private datosSis: BDService, private modalService: NgbModal,private formModule:NgbModule) { }

  ngOnInit(): void {
    this.getProductos();
  }

  getProductos():void {
    this.datosSis.obtenerWeb().toPromise().then((data) => {
        this.web = data;
        this.headers = ["URL",
                        "Nombre",
                        "Categorias",
                        "Precio",
                        "Precio Promocional",
                        "Peso",
                        "Alto (cm)",
                        "Ancho (cm)",
                        "Profundidad (cm)",
                        "Stock",
                        "Codigo",
                        "Mostrar en tienda",
                        "Envio Gratis",
                        "Tags",
                        "Marca"];
        this.headers2 = ["url",
                        "nombre",
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

  searchProduct = (text$: Observable<string>) =>
    text$.pipe(
      
      debounceTime(200),
      map((term: string) => term === '' ? []
        : this.web.filter(v => v.nombre.toLowerCase().includes(term.toLowerCase()) ||
                                    v.marca.toLowerCase().includes(term.toLowerCase()) ||
                                    v.codigo.toString().toLowerCase().includes(term.toLowerCase()) ||
                                    v.tags.toString().toLowerCase().includes(term.toLowerCase()))
                                    .slice(0, 10))
    )

    sort(event) {
      this.web.sort((a, b) => {
        if (a[event.column] < b[event.column]) {
          return event.order === 'asc' ? -1 : 1;
        } else if (a[event.column] > b[event.column]) {
          return event.order === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    view(cont,row){
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

}
