import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPerfilPage } from './modal-perfil.page';

describe('ModalPerfilPage', () => {
  let component: ModalPerfilPage;
  let fixture: ComponentFixture<ModalPerfilPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalPerfilPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalPerfilPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
