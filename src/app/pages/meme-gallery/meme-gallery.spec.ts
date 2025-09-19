import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemeGallery } from './meme-gallery';

describe('MemeGallery', () => {
  let component: MemeGallery;
  let fixture: ComponentFixture<MemeGallery>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MemeGallery]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemeGallery);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
