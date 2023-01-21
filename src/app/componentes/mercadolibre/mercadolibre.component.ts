import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BDService } from 'src/app/services/bd.service';

@Component({
  selector: 'app-mercadolibre',
  templateUrl: './mercadolibre.component.html',
  styleUrls: ['./mercadolibre.component.css']
})
export class MercadolibreComponent implements OnInit {
  ml: any;
  headers: any;
  headers2: any;
  search: string = '';
  cargando: boolean = true;
  imagen: any;

  constructor(private datosSis: BDService, private modalService: NgbModal, private formModule: NgbModule) { }

  ngOnInit(): void {
    this.obtenerDatos();
  }

  obtenerDatos(){
    this.datosSis.obtenerMl().subscribe((data) =>{
      this.ml = data;
      this.headers = ["ML Id",
                      "Codigo oxi",
                      "Id Categoria",
                      "Tipo pub",
                      "Titulo",
                      "Stock",
                      "Precio",
                      "Condición",
                      "Status",
                      "Envio gratis",
                      "Full",
                      "Retiro",
                      "Garantia",
                      "Es catalogo?",
                      "Marca",
                      "Modelo",
                      "Peso"]
      this.headers2 = ["itemid",
                      "itemsku",
                      "listingtypeid",
                      "title",
                      "availablequantity",
                      "price",
                      "condition",
                      "status",
                      "freeshipping",
                      "full",
                      "localpickup",
                      "warrantytime",
                      "cataloglisting",
                      "marca",
                      "modelo",
                      "peso"]
      this.cargando = false;
    });
  }


  abrirPreview(preview,img){
    this.imagen = "https://http2.mlstatic.com/D_NQ_NP_" + img + "-O.jpg";
    this.modalService.open(preview, { centered: true });
  }


}
