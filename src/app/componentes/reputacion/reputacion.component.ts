import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { MlApiService } from 'src/app/services/ml-api.service';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'; //Importa el módulo de ng-bootstrap




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
  cargando: boolean = true
  headers1: Array<string> = ["Fecha","Nº Reclamo","Nº Venta","Fecha venta","Publicacion","Usuario","Detalle"]
  headers1_2: Array<string> = ["Fecha_reclamo","Nmero_reclamo","venta","Fecha_venta","Titulo","Usuario","Detalle"]
  headers2: Array<string> = ["Fecha","Nº de la venta","Publicación","Usuario"]
  headers2_2:Array<string> = ["Fecha_venta","venta","Titulo","Usuario"]
  headers3:Array<string> = []
  headers3_2:Array<string> = []
  headers4:Array<string> = []
  headers4_2:Array<string> = []
  constructor(private datos: MlApiService) { }

  ngOnInit(): void {
    this.datos.obtenerDatosReclamos().subscribe((data) => {
      this.reclamo = data
      console.log("datos; ", this.reclamo);
      this.tipoReclamo = this.mostFrequentValue(this.reclamo.reclamos, ["Tipo de reclamo"])
      this.detalleReclamo = this.mostFrequentValue(this.reclamo.reclamos, ["Detalle"])
      this.masDemoradas = this.mostFrequentValue(this.reclamo.demoras, ["Tiempo_despachar"], true)
      this.cantMasDemoradas = this.delayDayCount(this.masDemoradas)
      this.cargando = false

    },
    (error)=>{
      console.log(error);
      
    });
  }


  mostFrequentValue(arr, field, splitField = false) {
    const count = {};
    let mostFrequentValue = null;
    let highestCount = 0;

    arr.forEach(obj => {
      let value = obj[field];
      if (splitField) {
        value = value.split(' ')[0];
      }
      count[value] = (count[value] || 0) + 1;

      if (count[value] > highestCount) {
        highestCount = count[value];
        mostFrequentValue = value;
      }
    });

    return mostFrequentValue;
  }

  delayDayCount(day) {
    let count = 0;

    this.reclamo.demoras.forEach(obj => {
      const deliveryTime = obj['Tiempo indicado para despachar'];
      const deliveryDay = deliveryTime.split(' ')[0];
      if (deliveryDay === day) {
        count++;
      }
    });

    return count;
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





}
