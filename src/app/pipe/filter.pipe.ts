import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filter'
  })
  export class FilterPipe implements PipeTransform {
    transform(items: any[], search: string): any[] {
      if (!items) {
        return [];
      }
  
      return items.filter(item => item.descripcion.toLowerCase().includes(search.toLowerCase()) ||
                                  item.marca.toLowerCase().includes(search.toLowerCase()) ||
                                  item.codigo.toString().toLowerCase().includes(search.toLowerCase()) ||
                                  item.cod_Fabrica.toString().toLowerCase().includes(search.toLowerCase()));
    }
  }