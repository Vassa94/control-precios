import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MercadolibreComponent } from './mercadolibre.component';

describe('MercadolibreComponent', () => {
  let component: MercadolibreComponent;
  let fixture: ComponentFixture<MercadolibreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MercadolibreComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MercadolibreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
