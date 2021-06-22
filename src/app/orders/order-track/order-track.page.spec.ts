import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OrderTrackPage } from './order-track.page';

describe('OrderTrackPage', () => {
  let component: OrderTrackPage;
  let fixture: ComponentFixture<OrderTrackPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderTrackPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderTrackPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
