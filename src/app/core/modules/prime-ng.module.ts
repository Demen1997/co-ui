import {NgModule} from '@angular/core';
import {
  ButtonModule, CalendarModule,
  ChartModule,
  DropdownModule,
  InputTextModule,
  KeyFilterModule,
  MessageService,
  MultiSelectModule,
  PasswordModule,
  ProgressBarModule,
  SelectButtonModule
} from 'primeng/primeng';
import {ToastModule} from 'primeng/toast';
import {TableModule} from 'primeng/table';

@NgModule({
  exports: [
    ButtonModule,
    InputTextModule,
    KeyFilterModule,
    PasswordModule,
    MultiSelectModule,
    ToastModule,
    TableModule,
    DropdownModule,
    InputTextModule,
    SelectButtonModule,
    ProgressBarModule,
    ChartModule,
    CalendarModule
  ],
  providers: [
    MessageService
  ]
})
export class PrimeNgModule {
}
