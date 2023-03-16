import { Component, OnInit } from '@angular/core';
import { BDService } from 'src/app/services/bd.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, NgForm, Validators, NgModel } from '@angular/forms';
import { concat, debounceTime, map, Observable, Subject, Subscription, tap } from 'rxjs';
import * as Papa from 'papaparse';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';
import { HttpParams } from '@angular/common/http';
import { NgxPaginationModule } from 'ngx-pagination';
import { shareReplay, switchMap } from 'rxjs/operators';

@Component({
	selector: 'app-productos',
	templateUrl: './productos.component.html',
	styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {

	productos: any;
	prodBackup: any;
	headers: any;
	headers2: any;
	filtro: string = '';
	cargando: boolean = true;
	edt: boolean = false;
	reader = new FileReader();
	selector: string = '';
	p: number = 1;
	windowHeight = window.innerHeight;
	tableHeight = 0.69 * this.windowHeight;
	rowHeight = 42;
	productosPorPagina = Math.ceil(this.tableHeight / this.rowHeight);;

	constructor(private datosSis: BDService, private modalService: NgbModal) {
	}

	/* Creando un nuevo FormGroup con el nombre producto. */
	producto = new FormGroup({
		codigo: new FormControl(),
		cod_Fabrica: new FormControl(),
		descripcion: new FormControl(),
		marca: new FormControl(),
		precioPublico: new FormControl(),
		stock: new FormControl()
	})

	/* Creando un nuevo FormGroup llamado archivo. También está creando un nuevo FormControl llamado csv. */
	file = new FormGroup({
		csv: new FormControl('')
	})

	/**
	 * La función se llama cuando se inicializa el componente.Llama a la
	 * función getProductos().
	 */
	ngOnInit(): void {
		this.getProductos();
		this.productosPorPagina = 12; // Asigna el valor predeterminado
		const inputProductosPorPagina = document.getElementById('productos-por-pagina') as HTMLInputElement;
		inputProductosPorPagina.addEventListener('change', () => {
			this.p = 1; // Vuelve a la primera página cuando cambia la cantidad de productos por página
			this.productosPorPagina = parseInt(inputProductosPorPagina.value, 10);
		});
	}

	getProductos(): void {
		// Crea un Observable que emite la respuesta caché
		const cache$: Observable<any> = this.datosSis.obtenerDatos().pipe(
			// Caché de la respuesta
			shareReplay({ bufferSize: 1, refCount: true, windowTime: 300000 })
		);

		// Crea un Observable que emite la respuesta actualizada desde el servidor
		const http$: Observable<any> = this.datosSis.obtenerDatos().pipe(
			// Deshabilita la caché para esta petición
			tap(() => console.log('Petición HTTP en segundo plano...')),
			switchMap(() => this.datosSis.obtenerDatos()),
			// Actualiza la caché con la nueva respuesta
			tap((data) => console.log('Actualizando caché...', data)),
			shareReplay({ bufferSize: 1, refCount: true, windowTime: 300000 })
		);

		// Combina los dos Observables usando concat
		const productos$: Observable<any> = concat(cache$, http$);

		// Suscribe a los datos
		productos$.subscribe(
			(data) => {
				this.productos = data;
				this.prodBackup = data;
				this.headers = ["Codigo Oxi", "Nombre", "Marca", "Cod. Fabrica", "Precio actual", "Stock"];
				this.headers2 = ["codigo", "descripcion", "marca", "cod_Fabrica", "precioPublico", "stock"];
				this.cargando = false;
			},
			(error) => {
				this.cargando = false;
				Swal.fire({
					icon: 'error',
					title: 'Oops...',
					text: 'No está habilitado el backend!',
					footer: `<a href="/guia">¿Por qué tengo este problema?</a>`
				});
				console.log("Ha ocurrido un error al obtener los productos:", error);
			}
		);
	}



	/* Obtener los datos de la base de datos y almacenarlos en la variable productos. */
	/* getProductos(): void {
		this.datosSis.obtenerDatos().subscribe((data) => {
			this.productos = data;
			this.prodBackup = data;
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
					footer: `<a href="/guia">¿Por qué tengo este problema?</a>`
				})
				console.log("Ha ocurrido un error al obtener los productos:", error);
			}
		);
	} */

	/**
	 * Si el primer valor es menor que el segundo valor, devuelve -1, si el primer valor es mayor que el
	 * segundo valor, devuelve 1, de lo contrario, devuelve 0.
	 * @param valor - el valor a ordenar por
	 * @param {boolean} ordenInverso - booleano
	 */
	ordenar(valor, ordenInverso: boolean) {
		this.productos.sort((productoA, productoB) => {
			return ordenInverso ? (productoA[valor] < productoB[valor] ? 1 : -1) : (productoA[valor] > productoB[valor] ? 1 : -1);
		}, valor);
	}

	/**
	 * "This function is called when the user clicks on the 'view' button in the table. It opens a modal
	 * window with the data of the selected row."
	 * </code>
	 * @param cont - is the modal content
	 * @param row - is the row that I'm passing to the modal
	 */
	view(cont, row): void {
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

	/**
	 * This function is used to clear the form fields
	 */
	newF(): void {
		this.producto.reset();
	}

	/**
	 * It takes a file, reads it, parses it, and then sends it to another function.
	 * @param {any} event - any =&gt; The event that triggers the function.
	 */
	parser(event: any): void {
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
						//this.detectarNuevos(data);
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

	/**
	 * Toma una matriz de objetos y devuelve una matriz de objetos que no están en la matriz original
	 * @param array - Matriz de objetos
	 * @returns una matriz de objetos.
	 */
	detectarNuevos(array) {
		let nuevos: Array<any> = []
		console.log(this.productos);

		array.forEach((element) => {
			if (!this.productos.map(producto => producto.codigo).includes(parseInt(element['Código']))) {
				nuevos.push(element);
			}
		});
		console.log(nuevos);
		
		return nuevos;
	}

	/* Opening a modal for update products. */
	act(actualizar): void {
		this.selector = "precio";
		this.modalService.open(actualizar, { centered: true })
	};

	/**
	 * "This function opens a modal window when the user clicks on a button."
	 * </code>
	 * @param actualizar - is the id of the modal
	 */
	actStock(actualizar): void {
		this.selector = "stock";
		this.modalService.open(actualizar, { centered: true })
	}

	/**
	 * The function opens a modal window and calls the newF() function and let the modal ready for create a new product
	 * @param productNew - is the modal id
	 */
	form(productNew): void {
		this.newF();
		this.modalService.open(productNew, { centered: true });
	}

	/**
	 * "When the user clicks on the edit button, the modal opens and the form is populated with the data
	 * of the product that the user wants to edit."
	 * </code>
	 * @param product - is the modal that I want to open
	 */
	edit(product): void {
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

	/**
	 * Update a product in database.
	 * </code>
	 */
	actualizarProducto(): void {
		const id = this.producto.value.codigo;
		const params = new HttpParams()
			.set('codFabrica', this.producto.value.cod_Fabrica)
			.set('descripcion', this.producto.value.descripcion)
			.set('marca', this.producto.value.marca.trim())
			.set('precioPub', this.producto.value.precioPublico)
			.set('stock', this.producto.value.stock)
		console.log(params);
		console.log(id);

		this.datosSis.actualizarProducto(id, params).subscribe((data) => {
			const index = this.productos.findIndex((p) => p.codigo === id);
			this.datosSis.actualizarProducto(id, params).subscribe((data) => {
				const index = this.productos.findIndex((p) => p.codigo === id);
				this.productos[index].cod_Fabrica = this.producto.value.cod_Fabrica;
				this.productos[index].descripcion = this.producto.value.descripcion;
				this.productos[index].marca = this.producto.value.marca;
				this.productos[index].precioPublico = this.producto.value.precioPublico;
				this.productos[index].stock = this.producto.value.stock;
			});
		});
	}

	/**
	 * Add a product to the database.
	 * </code>
	 */
	agregarProducto(): void {
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

	/**
	 * It takes an array of objects, and pushes them into another array. this is for bulk operations
	 * </code>
	 * @param data - any[] = [];
	 * @returns <code>{
	 *     "codigo": "1",
	 *     "precioPublico": "1",
	 *     "cod_Fabrica": "1",
	 *     "descripcion": "1",
	 *     "marca": "1",
	 *     "stock": "1"
	 * }
	 * </code>
	 */
	agregarProductos(data): void {
		let encontrado: boolean;
		let cont: number = 0;
		const body: Array<any> = [];
		let aux: Object = {};
		for (let i = 0; i < data.length; i++) {
			encontrado = false;
			encontrado = this.productos.some((producto) => {
				return producto.codigo === parseInt(data[i]["Código"]);
			});

			/* for (let j = 0; j < this.productos.length; j++) {
				if (this.productos[j].codigo !== undefined && this.productos[j].codigo !== null && this.productos[j].codigo === parseInt(data[i]["Código"])) {
					encontrado = true;
				}
			} */
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
				if (marca !== undefined) {
					marca = marca.toLowerCase();
					marca = marca.replace(/\b[a-z]/g, function (letter) {
						return letter.toUpperCase();
					});
				}
				aux = {
					'codigo': parseInt(data[i]['Código']),
					'precioPublico': data[i]['PUBLICO'],
					'cod_Fabrica': data[i]['Cód.Fabricante'],
					'descripcion': descripcion,
					'marca': marca?.replace("(Usd)", '').trim(),
					'stock': 0
				}
				body.push(aux);
				this.productos.push(aux)
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

	/**
	 * If the variable edt is true, then the function actualizarProducto() is called, otherwise the
	 * function agregarProducto() is called.
	 * </code>
	 */
	select(): void {
		if (this.edt) {
			this.actualizarProducto();
		} else {
			this.agregarProducto();
		}
	}

	/**
	 * It deletes a product from the database and then deletes it from the array of products
	 * @param id - the id of the product to be deleted
	 */
	borrarProducto(id): void {
		this.datosSis.borrarProducto(id).subscribe((data) => { })
		for (let i = 0; i < this.productos.length; i++) {
			if (this.productos[i].codigo === id) {
				this.productos.splice(i, 1);
			}
		}
	}

	/**
	 * It takes a CSV file, parses it, and then sends the data to a database.
	 * </code>
	 * @param body - the data from the CSV file
	 */
	actualizarPrecios(body): void {
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
			
		}
	}

	/**
	 * If the first element of the array is not defined, or the first element's codigo property is not a
	 * number, or the first element's stock property is not a number, then show an error message.
	 * Otherwise, call the actuStock function and pass in the array, and then show a success message.
	 * @param body - the data from the CSV file
	 */
	actualizarStock(body): void {
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

	/**
 * It takes an array of objects, and returns an array of objects with the same keys, but with the
 * values converted to integers.
 * @param data - is the data that I get from the file
 * @param destino - is the name of the table in the database where the data will be stored
 */
	async estandarizador(data, destino): Promise<void> {
		if (destino === 'precio') {
			const result = await Swal.fire({
				title: 'Quiere agregar los productos faltantes al sistema?',
				footer: '<a href="">como debe ser mi archivo?</a>',
				showDenyButton: true,
				showCancelButton: false,
				confirmButtonText: 'Ok',
				denyButtonText: `No`,
			});

			if (result.isConfirmed) {
				const requiredKeys = ['Código', 'Descripción', 'Fábrica', 'Cód Fabricante', 'PUBLICO'];
				const hasAllKeys = requiredKeys.every(key => data[key] !== undefined);
				if (hasAllKeys) {
					this.agregarProductos(data);
				} else {
					try {
						await Swal.fire({
							title: 'Oops!',
							text: 'El csv no tiene el formato correcto',
							icon: 'error',
							footer: '<a href="">como debe ser mi archivo?</a>',
						});
					} catch (error) {
						console.log(error);
					}
				}
			} else if (result.isDenied) {
				Swal.fire('Actualizando solo precios', '', 'info')
			}
		};

		const body = this.crearArrayActualizacion(data, destino);

		if (destino === "precio") {
			this.actualizarPrecios(body);
			const nuevos = this.detectarNuevos(data)
			setTimeout(function () {
				Swal.fire({
					title: 'Hay que actualizar!',
					text: 'Se encontraron ' + nuevos.length + ' productos que no estan cargados',
					icon: 'info',
					showConfirmButton: true,
				});
			}, 2000);
	
		} else if (destino === "stock") {
			this.actualizarStock(body);
		};
	}

	/**
	 * Toma una matriz de objetos y devuelve una matriz de objetos con las mismas claves, pero con los
	 * valores de las claves redondeados al entero más cercano.
	 * @param array - la matriz de objetos que quiero actualizar
	 * @param destino - es el nombre de la tabla donde se insertarán los datos
	 * @returns Una matriz de objetos.
	 */
	crearArrayActualizacion(array, destino) {
		const valores: Array<any> = [];
		let aux: Object = {};
		let col = (destino === 'precio') ? "PUBLICO" : "Total";
		for (let i = 0; i < array.length; i++) {
			let valor = array[i][col];
			if (valor) {
				valor = parseFloat(valor);
				valor = Math.floor(valor);
				array[i][col] = valor;
			}
			if (destino === "precio" && array[i]['Código']) {
				aux = { 'codigo': parseInt(array[i]['Código']), 'precio': array[i][col] };
			} else if (destino === "stock" && array[i]['Código']) {
				aux = { 'codigo': parseInt(array[i]['Código']), 'stock': array[i][col] };
			}
			valores.push(aux);

		};
		return valores
	}

	/**
	 * It takes an array of objects, converts it to a CSV string, creates a blob, and then uses
	 * FileSaver.js to save the blob as a file.
	 */
	descargarCSV(): void {
		let data = this.productos;
		const csvData = Papa.unparse(data);
		let date = new Date().toLocaleString();
		let fileName = 'productos_' + date + '.csv';
		let blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
		FileSaver.saveAs(blob, fileName);

	}

	/**
	 * It filters the table by comparing the input value with the values of the table.
	 */
	filtrarTabla(): void {
		let filtroMinusculas = this.filtro.toLowerCase().trim();
		this.productos = this.prodBackup.filter(row => {
			let nombreMinusculas = row.descripcion ? row.descripcion.toLowerCase() : '';
			let marcaMinusculas = row.marca ? row.marca.toLowerCase() : '';
			let codigoMinusculas = row.codigo ? row.codigo.toString().toLowerCase() : '';
			return nombreMinusculas.includes(filtroMinusculas) ||
				marcaMinusculas.includes(filtroMinusculas) ||
				codigoMinusculas.includes(filtroMinusculas);
		});
	}

	/**
	 * It takes an array of objects, and returns an array of objects with only the `codigo` and
	 * `stockActual` properties
	 * @param array - Array<any> = [{codigo: '1', stock: '10'}, {codigo: '2', stock: '20'}]
	 * @returns An array of objects.
	 */
	prueba(): void {
		Swal.fire({
			icon: 'success',
			title: 'Apretaste un boton!',
			text: 'Si, es un chiste. es un boton de pruebas',
			showConfirmButton: false,
			timer: 2000
		})
	}

	backupStock(): void {
		console.log("paso");
	}

}
