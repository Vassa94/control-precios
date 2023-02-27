import { Component, OnInit } from '@angular/core';
import { BDService } from 'src/app/services/bd.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, NgForm, Validators, NgModel } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, map, Observable, Subject, Subscription } from 'rxjs';
import { FilterPipe } from 'src/app/pipe/filter.pipe';
import * as Papa from 'papaparse';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';
import { HttpParams } from '@angular/common/http';



@Component({
	selector: 'app-productos',
	templateUrl: './productos.component.html',
	styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {

	productos: any;
	ProdBackup: any;
	headers: any;
	headers2: any;
	filtro: string = '';
	filteredProductos: Record<string, any>[] = [];
	cargando: boolean = true;
	edt: boolean = false;
	actualizador: any;
	csvFile: any;
	reader = new FileReader();
	selector: string = '';



	constructor(private datosSis: BDService, private modalService: NgbModal, private formModule: NgbModule) {
		
	}



	producto = new FormGroup({
		codigo: new FormControl(),
		cod_Fabrica: new FormControl(),
		descripcion: new FormControl(),
		marca: new FormControl(),
		precioPublico: new FormControl(),
		stock: new FormControl()
	})

	file = new FormGroup({
		csv: new FormControl('')
	})

	ngOnInit(): void {
		const search$ = new Subject<string>();
		this.getProductos();
			

	}

	/* Obtener los datos de la base de datos y almacenarlos en la variable productos. */
	getProductos(): void {
		this.datosSis.obtenerDatos().subscribe((data) => {
			this.productos = data;
			this.ProdBackup = data;
			this.headers = ["Codigo Oxi", "Nombre", "Marca", "Cod. Fabrica", "Precio actual", "Stock"];
			this.headers2 = ["codigo", "descripcion", "marca", "cod_Fabrica", "precioPublico", "stock"];
			this.cargando = false;
		},
		(error) => {
            this.cargando = false;
			Swal.fire({
				icon: 'error',
				title: 'Oops...',
				text: 'No esta habilitado el backend!',
				footer: `<a routerLink="'guia'">¿Por qué tengo este problema?</a>`
			})
            console.log("Ha ocurrido un error al obtener los productos:", error);
        }
    );
	}

	view(cont, row) {
		this.producto.setValue({
			codigo: row.codigo,
			marca: row.marca,
			cod_Fabrica: row.cod_Fabrica,
			descripcion: row.descripcion,
			stock: row.stock,
			precioPublico: row.precioPublico,
		})
		this.modalService.open(cont, { centered: true });
	}

	newF() {
		this.producto.setValue({
			codigo: " ",
			marca: " ",
			cod_Fabrica: " ",
			descripcion: " ",
			stock: " ",
			precioPublico: " ",
		})
	}

	parser(event: any) {
		let file: File = event.target.files[0];
		if (file) {
			this.reader.readAsText(file, 'ISO-8859-3');
			this.reader.onload = (event: any) => {
				let content = event.target.result;
				Papa.parse(content, {
					header: true,
					complete: (results) => {
						let data = results.data;
						this.estandarizador(data, this.selector);
					}
				});
			}
		} else {
			Swal.fire({
				icon: 'error',
				title: 'Oops...',
				text: 'Debes cargar un archivo!',
				footer: '<a href="">Why do I have this issue?</a>'
			})
		}
	}

	act(actualizar) {
		this.selector = "precio";
		this.modalService.open(actualizar, { centered: true })
	};

	actStock(actualizar) {
		this.selector = "stock";
		this.modalService.open(actualizar, { centered: true })
	}

	form(productNew) {
		this.newF();
		this.modalService.open(productNew, { centered: true });
	}

	edit(product) {
		this.edt = true;
		this.producto.setValue({
			codigo: this.producto.value.codigo,
			marca: this.producto.value.marca,
			cod_Fabrica: this.producto.value.cod_Fabrica,
			descripcion: this.producto.value.descripcion,
			stock: this.producto.value.stock,
			precioPublico: this.producto.value.precioPublico
		})
		this.modalService.open(product, { centered: true });
	}


	actualizarProducto() {
		const id = this.producto.value.codigo;
		const params = new HttpParams()
			.set('codFabrica', this.producto.value.cod_Fabrica)
			.set('descripcion', this.producto.value.descripcion)
			.set('marca', this.producto.value.marca)
			.set('precioPub', this.producto.value.precioPublico)
			.set('stock', this.producto.value.stock)
		console.log(params);
		console.log(id);

		this.datosSis.actualizarProducto(id, params).subscribe((data) => { });
	}

	agregarProducto() {
		console.log("paso 1");

		const body = {
			codigo: this.producto.value.codigo,
			marca: this.producto.value.marca,
			cod_Fabrica: this.producto.value.cod_Fabrica,
			descripcion: this.producto.value.descripcion,
			stock: this.producto.value.stock,
			precioPublico: this.producto.value.precioPublico
		};
		console.table(body)
		this.datosSis.crearProducto(body).subscribe((data) => { });
		Swal.fire({
			title: '¡Genial!',
			text: 'Producto Agregado',
			icon: 'success',
			showConfirmButton: false,
			timer: 1500,
		});
	}

	agregarProductos(data) {
		let encontrado: boolean;
		let cont: number = 0;
		const body: any[] = [];
		let aux = {};
		for (let i = 0; i < data.length; i++) {
			encontrado = false;
			for (let j = 0; j < this.productos.length; j++) {
				if (this.productos[j].codigo !== undefined && this.productos[j].codigo !== null && this.productos[j].codigo === parseInt(data[i]["Código"])) {
					encontrado = true;
				}
			}
			if (!encontrado && data[i]["Código"].trim() !== "") {
				cont++;
				let valor = data[i]['PUBLICO'];
				if (valor) {
					valor = parseFloat(valor);
					valor = Math.floor(valor);
					data[i]['PUBLICO'] = valor;
				}
				let descripcion = data[i]['Descripción'];
				descripcion = descripcion.toLowerCase();
				descripcion = descripcion.replace(/\b[a-z]/g, function (letter) {
					return letter.toUpperCase();
				});
				let marca = data[i]['Fábrica'];
				marca = marca.toLowerCase();
				marca = marca.replace(/\b[a-z]/g, function (letter) {
					return letter.toUpperCase();
				});
				aux = {
					'codigo': parseInt(data[i]['Código']),
					'precioPublico': data[i]['PUBLICO'],
					'cod_Fabrica': data[i]['Cód.Fabricante'],
					'descripcion': descripcion,
					'marca': marca.replace("(Usd)", ''),
					'stock': 0
				}
				body.push(aux);
			}
		}
		this.datosSis.crearProductos(body).subscribe((data) => { });
		setTimeout(function () {
			Swal.fire({
				title: 'Productos agregados!',
				text: 'se cargaron ' + cont + ' productos nuevos',
				icon: 'success',
				showConfirmButton: true,
			});
		}, 4000);


	}

	select() {
		if (this.edt) {
			this.actualizarProducto();
		} else {
			this.agregarProducto();
		}
	}

	borrarProducto(id) {
		this.datosSis.borrarProducto(id).subscribe((data) => { })
		for (let i = 0; i < this.productos.length; i++) {
			if (this.productos[i].codigo === id) {
				this.productos.splice(i, 1);
			}
		}
	}



	actualizarPrecios(body) {
		if (!body[0].codigo || !body[0].precio) {
			Swal.fire({
				title: 'Oops...',
				text: 'El CSV no tiene la estructura correcta',
				icon: 'error',
				footer: 'Revisa que el archivo subido sea el correcto'
			});
		} else {
			this.datosSis.actuProductos(body).subscribe((data) => { });
			this.datosSis.actuWeb(body).subscribe((data) => { });
			Swal.fire({
				title: '¡Genial!',
				text: 'Precios actualizados',
				icon: 'success',
				showConfirmButton: false,
				timer: 2500,
			});
		}
	}

	actualizarStock(body) {
		if (!body[0] || typeof body[0].codigo !== "number" || typeof body[0].stock !== "number") {
			Swal.fire({
				title: 'Oops...',
				text: 'El CSV no tiene la estructura correcta',
				icon: 'error',
				footer: 'Revisa que el archivo subido sea el correcto'
			});
		} else {
			this.datosSis.actuStock(body).subscribe((data) => { });
			Swal.fire({
				title: '¡Genial!',
				text: 'Stock actualizado',
				icon: 'success',
				showConfirmButton: false,
				timer: 2500,
			});
		}
	}

	estandarizador(data, destino) {
		const body: any[] = [];
		let aux = {};
		let col = (destino === 'precio') ? "PUBLICO" : "Total";
		if (destino === 'precio') {
			Swal.fire({
				title: 'Quiere agregar los productos faltantes al sistema?',
				footer: '<a href="">como debe ser mi archivo?</a>',
				showDenyButton: true,
				showCancelButton: false,
				confirmButtonText: 'Ok',
				denyButtonText: `No`,

			}).then((result) => {
				/* Read more about isConfirmed, isDenied below */
				if (result.isConfirmed) {
					this.agregarProductos(data);
				} else if (result.isDenied) {
					Swal.fire('Actualizando solo precios', '', 'info')
				}
			})
		}
		for (let i = 0; i < data.length; i++) {
			let valor = data[i][col];
			if (valor) {
				valor = parseFloat(valor);
				valor = Math.floor(valor);
				data[i][col] = valor;
			}
			if (destino === "precio" && data[i]['Código']) {
				aux = { 'codigo': parseInt(data[i]['Código']), 'precio': data[i][col] };
			} else if (destino === "stock" && data[i]['Código']) {
				aux = { 'codigo': parseInt(data[i]['Código']), 'stock': data[i][col] };
			}
			body.push(aux);

		}
		
		if (destino === "precio") {
			this.actualizarPrecios(body);
		} else if (destino === "stock") {
			this.actualizarStock(body);
			
		}




	}

	descargarCSV() {
		let data = this.productos;
		const csvData = Papa.unparse(data);
		let date = new Date().toLocaleString();
		let fileName = 'productos_' + date + '.csv';
		let blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
		FileSaver.saveAs(blob, fileName);

	}

	searchProduct = (text$: Observable<string>) =>
		text$.pipe(

			debounceTime(200),
			map((term: string) => term === '' ? []
				: this.productos.filter(v => v.descripcion.toLowerCase().includes(term.toLowerCase()) ||
					v.marca.toLowerCase().includes(term.toLowerCase()) ||
					v.codigo.toString().toLowerCase().includes(term.toLowerCase()) ||
					v.cod_Fabrica.toString().toLowerCase().includes(term.toLowerCase()))
					.slice(0, 10))
		)

		filtrarTabla() {
			let filtroMinusculas = this.filtro.toLowerCase(); 
			this.productos = this.ProdBackup.filter(row => { 
			let nombreMinusculas = row.nombre ? row.nombre.toLowerCase() : ''; 
			let marcaMinusculas = row.marca ? row.marca.toLowerCase() : ''; 
			let codigoMinusculas = row.codigo ? row.codigo.toString().toLowerCase(): ''; 
			return nombreMinusculas.includes(filtroMinusculas) ||
			marcaMinusculas.includes(filtroMinusculas) ||
			codigoMinusculas.includes(filtroMinusculas); 
			});
			
			}


}
