import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-circulo',
  template: `
    <div [ngClass]="{ 'circulo-verde': verde, 'circulo-rojo': !verde }"
          style="align-items: center; justify-content: center;">
    </div>
  `,
  styles: [`
    .circulo-verde {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: green;
      margin: auto;
      display: flex;
    }
    .circulo-rojo {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: red;
      margin: auto;
      display: flex;
    }
  `]
})
export class TruefalseComponent {
  @Input() verde: boolean | undefined;
}
