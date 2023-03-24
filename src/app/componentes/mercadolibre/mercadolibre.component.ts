import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BDService } from 'src/app/services/bd.service';

@Component({
  selector: 'app-mercadolibre',
  templateUrl: './mercadolibre.component.html',
  styleUrls: ['./mercadolibre.component.css']
})
export class MercadolibreComponent implements OnInit {
  ml: Array<any> = [];
  mlBackup: Array<any> = []; 
  headers: Array<string> = [];
  headers2: Array<string> = [];
  filtro: string = '';
  cargando: boolean = true;
  imagen: string = '';
  p: number = 1;
	windowHeight = window.innerHeight;
	tableHeight = 0.69 * this.windowHeight;
	rowHeight = 42;
	productosPorPagina = Math.ceil(this.tableHeight / this.rowHeight);

  constructor(private datosSis: BDService, private modalService: NgbModal, private formModule: NgbModule) { }

  ngOnInit(): void {
    this.obtenerDatos();
  }

  obtenerDatos(){
    this.datosSis.obtenerMl().subscribe((data) =>{
      this.ml = data;
      this.mlBackup = data;
      this.headers = ["ML Id",
                      "Codigo oxi",                      
                      "Tipo pub",
                      "Titulo",
                      "Stock",
                      "Precio",
                      "Status",
                      "Envio",
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

  filtrarTabla(): void {
		let filtroMinusculas = this.filtro.toLowerCase().trim();
		this.ml = this.mlBackup.filter(row => {
			let nombreMinusculas = row.title ? row.title.toLowerCase() : '';
			let marcaMinusculas = row.marca ? row.marca.toLowerCase() : '';
			let codigoMinusculas = row.itemsku ? row.itemsku.toString().toLowerCase() : '';
			return nombreMinusculas.includes(filtroMinusculas) ||
				marcaMinusculas.includes(filtroMinusculas) ||
				codigoMinusculas.includes(filtroMinusculas);
		});
	}


}
