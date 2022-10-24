import { Component, Input } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { finalize, Subscription } from 'rxjs';
import { ProgresoComponent } from './progreso/progreso.component';
import { Papa } from 'ngx-papaparse';



@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent  {

  files: any[] = [];

  @Input()
    requiredFileType:string = 'file';

    fileName = '';
    uploadProgress:number = 0;
    uploadSub: Subscription = new Subscription();

    constructor(private http: HttpClient, private papa: Papa) {
      const csvData = '"Identificador de URL WEB","Codigo Oxi","Marca","Cod. Fabrica","Nombre","Cant.","Precio actual","Precio nuevo","Peso (kg)","Alto (cm)","Ancho (cm)","Profundidad (cm)","Stock","Código de barras","QR","Mostrar","Tags"';
      
      let options = {
        complete: (results, file) => {
            console.log('Parsed: ', results, file);
        }
      };
      this.papa.parse(csvData,options);
    }
/*
    onFileDropped($event) {
      this.prepareFilesList($event);
    }
  
    //handle file from browsing
    /* 
    fileBrowseHandler(files) {
      this.prepareFilesList(files);
    }
  
    /**
     * Delete file from files list
     * @param index (File index)
     *//*
    deleteFile(index: number) {
      this.files.splice(index, 1);
    }*/
  
    /**
     * Simulate the upload process
     *//*
    uploadFilesSimulator(index: number) {
      setTimeout(() => {
        if (index === this.files.length) {
          return;
        } else {
          const progressInterval = setInterval(() => {
            if (this.files[index].progress === 100) {
              clearInterval(progressInterval);
              this.uploadFilesSimulator(index + 1);
            } else {
              this.files[index].progress += 5;
            }
          }, 200);
        }
      }, 1000);
    }*/
  
    /**
     * Convert Files list to normal array list
     * @param files (Files List)
     *//*
    prepareFilesList(files: Array<any>) {
      for (const item of files) {
        item.progress = 0;
        this.files.push(item);
      }
      this.uploadFilesSimulator(0);
    }
  */
    /**
     * format bytes
     * @param bytes (File size in bytes)
     * @param decimals (Decimals point)
     *//*
    formatBytes(bytes, decimals) {
      if (bytes === 0) {
        return '0 Bytes';
      }
      const k = 1024;
      const dm = decimals <= 0 ? 0 : decimals || 2;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }*/

    


}
