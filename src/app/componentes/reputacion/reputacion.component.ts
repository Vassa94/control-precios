import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { MlApiService } from 'src/app/services/ml-api.service';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, NgForm, Validators, NgModel } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import *  as Papa from 'papaparse';
import * as normalize from 'normalize-strings';
import Swal from 'sweetalert2';





@Component({
  selector: 'app-reputacion',
  templateUrl: './reputacion.component.html',
  styleUrls: ['./reputacion.component.css']
})
export class ReputacionComponent implements OnInit {
  reclamo: any;
  tipoReclamo: any
  detalleReclamo: any
  masDemoradas: any
  cantMasDemoradas: any
  porcenDem: any  
  destino: String = ""
  cargando: boolean = true
  headers1: Array<string> = ["Fecha", "Nº Reclamo", "Nº Venta", "Fecha venta", "Publicacion", "Usuario", "Detalle"]
  headers1_2: Array<string> = ["fecha_reclamo", "numero_reclamo", "venta", "fecha_venta", "titulo", "usuario", "detalle"]
  headers2: Array<string> = ["Fecha", "Nº de la venta", "Publicación", "Usuario"]
  headers2_2: Array<string> = ["fecha_venta", "venta", "título", "usuario"]
  headers3: Array<string> = [ "Nº de la venta", "Usuario", "Fecha de la venta", "Publicación"]
  headers3_2: Array<string> = ["venta","usuario","fecha_venta", "titulo"]
  headers4: Array<string> = ["Nº Venta","Limite para despachar","Día despachado","Publicación", "Usuario" ]
  headers4_2: Array<string> = ["venta","tiempo_despachar","tiempo_despachado","titulo","usuario"]
  reader = new FileReader();

  constructor(private datos: MlApiService, private modalService: NgbModal) { }

  repForm = new FormGroup({
    ultimos60Dias: new FormControl(),
    mercadoenvios: new FormControl(),
    color: new FormControl(),
  })



  ngOnInit(): void {
    this.datos.obtenerDatosReclamos().subscribe((data) => {
      this.reclamo = data[0]
      this.tipoReclamo = this.mostFrequentValue(this.reclamo.reclamos, ["tipo_de_reclamo"])
      this.detalleReclamo = this.mostFrequentValue(this.reclamo.reclamos, ["detalle"])
      this.masDemoradas = this.mostFrequentValue(this.reclamo.demoras, ["tiempo_despachar"], true)
      this.cantMasDemoradas = this.delayDayCount(this.masDemoradas)
      this.porcenDem = this.porcentajeDemoradas();
      this.cargando = false

    },
      (error) => {
        console.log(error);

      });
  }


  mostFrequentValue(arr, field, splitField = false) {
    const counts = {};
    let mostFrequentValue = null;
    let highestCount = 0;
  
    arr.forEach(obj => {
      let value = obj[field];
      if (splitField) {
        value = value.split(' ')[0];
      }
      if (value in counts) {
        counts[value] += 1;
      } else {
        counts[value] = 1;
      }
      if (counts[value] > highestCount) {
        highestCount = counts[value];
        mostFrequentValue = value;
      }
    });
    
    return mostFrequentValue;
  }
  

  delayDayCount(day) {
    let count = 0;

    this.reclamo.demoras.forEach(obj => {
      const deliveryTime = obj['tiempo_despachar'];
      const deliveryDay = deliveryTime.split(' ')[0];
      if (deliveryDay === day) {
        count++;
      }
    });

    return count;
  }

  porcentajeDemoradas(){
    const demorasEnDia = this.reclamo.demoras.filter((demora) => demora.tiempo_despachar.includes(this.masDemoradas)).length;
    const porcentajeVentasDemoradasEnDia = ((demorasEnDia / this.reclamo.demoras.length) * 100).toFixed(2);
    console.log(porcentajeVentasDemoradasEnDia);
    
    return porcentajeVentasDemoradasEnDia;
  }

  downloadPDF(): void {
    const elementToPrint = document.getElementById('pdf');
    const hoy = new Date();
    const dia = hoy.getDate();
    const mes = hoy.toLocaleString('default', { month: 'short' });
    const anio = hoy.getFullYear();
    let filename = 'informe-reputación-' + dia + '-' + mes + '-' + anio + '.pdf';
    if (elementToPrint !== null) {
      const pdfWidth: number = 297;
      const pdfHeight: number = elementToPrint.clientHeight * pdfWidth / elementToPrint.clientWidth;
      const pdf = new jsPDF('l', 'mm', [297, 210]);
      pdf.html(elementToPrint, {
        callback: (doc) => {
          pdf.save(filename);
        },
        html2canvas: {
          scale: pdfWidth / elementToPrint.clientWidth,
          useCORS: true,
          width: pdfWidth,
          height: pdfHeight,
        }
      });
    }
  }

  reputationDayRange(): string {
    const hoy = new Date();
    const fechaRestada = new Date(hoy.getTime() - 60 * 24 * 60 * 60 * 1000);

    const dia = fechaRestada.getDate();
    const mes = fechaRestada.toLocaleString('default', { month: 'short' });
    const anio = fechaRestada.getFullYear();

    return `${dia} de ${mes} ${anio}`;
  }

  edit(modalName) {
    this.modalService.open(modalName, { centered: true })
  }

  editRep() {
    let body = {
      id: 1,
      ultimos60Dias: this.repForm.value.ultimos60Dias,
      mercadoenvios: this.repForm.value.mercadoenvios,
      color: this.repForm.value.color,
    }
    this.reclamo.ultimos60Dias=this.repForm.value.ultimos60Dias;
    this.reclamo.mercadoenvios=this.repForm.value.mercadoenvios;
    this.reclamo.color=this.repForm.value.color;
    this.datos.cargarDatosVentas(body).subscribe((data) => { },
      (error) => { error.error.text })

  }

  updateArrays(csv, destino) {
    this.destino = destino;
    this.modalService.open(csv, { centered: true })
  }

  parser(event: any) {
    let file: File = event.target.files[0];
    /* Leer un archivo CSV y analizarlo. */
    if (file) {
      this.reader.readAsText(file, 'UTF-8');
      this.reader.onload = (event: any) => {
        let content = event.target.result;
        content = normalize(content, { form: 'NFD' });
        Papa.parse(content, {
          header: true,
          encoding: "UTF-8",
          complete: (results) => {
            let data = results.data;
            data = this.editarCampos(data,this.destino)
            switch (this.destino) {
              case 'reclamos':
                this.datos.cargarReclamos(data).subscribe((data) => { },
                  (error) => { error.error.text })
                break;
              case 'mediaciones':
                this.datos.cargarMediaciones(data).subscribe((data) => { },
                  (error) => { error.error.text })
                break;
              case 'cancelaciones':
                this.datos.cargarCancelaciones(data).subscribe((data) => { },
                  (error) => { error.error.text })
                break;
              case 'demoras':
                this.datos.cargarDemoras(data).subscribe((data) => { },
                  (error) => { error.error.text })
                break;
              
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

  editarCampos(arr, campo): any[] {
    let nuevoArr: Array<any> = [];
    console.log(arr[0]["Publicacion"]);
    
    switch (campo) {
      case "reclamos":
        arr.forEach((obj) => {
          nuevoArr.push({
            fecha_reclamo: obj["Fecha del reclamo"],
            numero_reclamo: obj["Número de reclamo"],
            venta: obj["# de la venta"],
            fecha_venta: obj["Fecha de la venta"],
            titulo: obj["Título de la publicación"],
            usuario: obj["Usuario comprador"],
            tipo_de_reclamo: obj["Tipo de reclamo"],
            detalle: obj["Detalle del reclamo"],
          });
        });
        break;
      case "mediaciones":
        arr.forEach((obj) => {
          nuevoArr.push({
            fecha_venta: obj["Fecha de la venta"],
            venta: obj["# de la venta"],
            título: obj["Publicacion"],
            usuario: obj["Usuario comprador"]
          });
        });
        console.log(nuevoArr);
        
        break;
      case "cancelaciones":
        arr.forEach((obj) => {
          nuevoArr.push({
            fecha_venta: obj["Fecha de la venta"],
            venta: obj["# de la venta"],
            titulo: obj["Título de la publicación"],
            usuario: obj["Usuario comprador"],
          });
        });
        break;
      case "demoras":
        arr.forEach((obj) => {
          nuevoArr.push({
            fecha_venta: obj["Fecha de la venta"],
            venta: obj["# de la venta"],
            titulo: obj["Título de la publicación"],
            usuario: obj["Usuario comprador"],
            forma_de_envio: obj["Forma de envío"],
            tiempo_despachar: obj["Tiempo indicado para despachar"],
            tiempo_despachado: obj["Tiempo en el que despachaste"],
          });
        });
        break;
      default:
        console.log("Campo no reconocido");
        break;
    }
    nuevoArr = nuevoArr.filter(obj => {
      return !Object.values(obj).some(value => value === null || value === "");
    });
    this.reclamo[campo] = nuevoArr;
    return nuevoArr;
  }
  


}
