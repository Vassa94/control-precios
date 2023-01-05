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

  constructor(private datosSis: BDService, private modalService: NgbModal, private formModule: NgbModule) { }

  ngOnInit(): void {
    this.obtenerDatos();
  }

  obtenerDatos(){
    this.datosSis.obtenerMl().subscribe((data) =>{
      this.ml = data;
      this.headers = ["itemid",
                      "itemsku",
                      "categoryid",
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
                      "shipping",
                      "picture1",
                      "marca",
                      "modelo",
                      "peso"]
      this.headers2 = ["itemid",
                      "itemsku",
                      "categoryid",
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
                      "shipping",
                      "picture1",
                      "marca",
                      "modelo",
                      "peso"]
      this.cargando = false;
    });
  }

}
