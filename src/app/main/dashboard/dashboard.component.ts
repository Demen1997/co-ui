import {Component, OnInit} from '@angular/core';
import {Service} from '../../core/service/service';
import {Budget} from '../../core/model/main/budget.model';
import {NotificationService} from '../../core/service/notification.service';
import {ExchangeRate, ExchangeService} from '../../core/service/exchange.service';
import {finalize} from 'rxjs/operators';

const randomColor = () => '#' + ('000000' + Math.floor(0x1000000 * Math.random()).toString(16)).slice(-6);

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="ui-g-5"></div>
    <div class="ui-g-2">
      <h1>Статистика</h1>
    </div>
    <div class="ui-g-5">
      <div class="ui-g-8"></div>
      <div class="ui-g-4">
        1 USD = {{usdRate}} RUB
        <br>
        1 EUR = {{eurRate}} RUB
      </div>
    </div>
    <div class="ui-g-12">
      <div class="ui-g-5"></div>
      <div class="ui-g-2">
        <h2>Бюджеты</h2>
      </div>
      <div class="ui-g-5"></div>
    </div>
    <div class="ui-g-6">
      <p-chart type="pie" [data]="data"></p-chart>
    </div>
    <div class="ui-g-6">
      <p-chart type="doughnut" [data]="data"></p-chart>
    </div>
    <div class="ui-g-12">
      <div class="ui-g-5"></div>
      <div class="ui-g-2">
        <h2>Счета</h2>
      </div>
      <div class="ui-g-5"></div>
    </div>
    <div class="ui-g-12">
      <div class="ui-g-2"></div>
      <div class="ui-g-2">
        Date from: <br>
        <p-calendar [(ngModel)]="dateFrom"></p-calendar>
      </div>
      <div class="ui-g-2">
        Date to: <br>
        <p-calendar [(ngModel)]="dateTo"></p-calendar>
      </div>
      <div class="ui-g-4"></div>
      <div class="ui-g-2">
        <br>
        <p-button (onClick)="updateBar()" label="Обновить/показать график"></p-button>
      </div>
    </div>
    <div class="ui-g-2"></div>
    <div class="ui-g-8">
      <p-chart type="bar" [data]="barData" [hidden]="barData === undefined"></p-chart>
    </div>
    <div class="ui-g-2"></div>
  `,
  providers: [
    Service,
    {
      provide: Service.CONFIG_URL,
      useValue: Service.API_URL + '/budgets'
    }
  ]
})
export class DashboardComponent {
  public static readonly ROUTER_PATH = 'dashboard';
  data: any;
  barData: any;
  budgets: Budget[] = [];
  usdRate: number;
  eurRate: number;
  dateFrom: Date = new Date();
  dateTo: Date = new Date();

  constructor(private budgetService: Service<Budget>,
              private messageService: NotificationService,
              private exchangeService: ExchangeService) {
    this.initDate();
    this.exchangeService.getUSDExchange()
      .pipe(
        finalize(() => {
          this.exchangeService.getEURExchange()
            .pipe(
              finalize(() => {
                this.budgetService.getAll()
                  .subscribe(response => {
                    this.budgets = response.body;
                    this.updateCharts();
                  }, () => this.messageService.logError('Не удалось получить данные бюджета'));
              })
            )
            .subscribe(data => this.eurRate = (data as ExchangeRate).rates.RUB, _ => this.eurRate = 70);
        })
      )
      .subscribe(data => this.usdRate = (data as ExchangeRate).rates.RUB, _ => this.usdRate = 60);
  }

  private initDate() {
    this.dateFrom.setHours(0);
    this.dateFrom.setMinutes(0);
    this.dateFrom.setSeconds(0);
    this.dateFrom.setMilliseconds(0);
    this.dateTo.setDate(this.dateFrom.getDate() + 1);
  }

  private updateCharts() {
    const labels = this.budgets.map(b => b.name);
    const datasets = [
      {
        data: this.budgets.map(b => {
          switch (b.currency) {
            case 'USD':
              b.initialAmount *= this.usdRate;
              b.currentAmount *= this.usdRate;
              break;
            case 'EUR':
              b.initialAmount *= this.eurRate;
              b.currentAmount *= this.eurRate;
              break;
            case 'RUB':
            default:
              break;
          }
          return b;
        }).map(b => b.initialAmount - b.currentAmount),
        backgroundColor: this.budgets.map(_ => randomColor()),
      }
    ];

    this.data = {
      labels,
      datasets
    };
  }

  updateBar() {
    if (this.dateFrom === undefined || this.dateTo === undefined) {
      return;
    }

    this.exchangeService.getBudgetInfo(Math.round(this.dateFrom.getTime() / 1000), Math.round(this.dateTo.getTime() / 1000))
      .subscribe(data => {
        this.barData = {
          labels: (data as { name: string }[]).map(b => b.name),
          datasets: [
            {
              label: 'Приход',
              backgroundColor: '#42A5F5',
              borderColor: '#1E88E5',
              data: (data as { currency: string, income: number }[]).map(b => {
                switch (b.currency) {
                  case 'USD':
                    b.income *= this.usdRate;
                    break;
                  case 'EUR':
                    b.income *= this.eurRate;
                    break;
                  case 'RUB':
                  default:
                    break;
                }
                return b;
              }).map(b => b.income)
            },
            {
              label: 'Расход',
              backgroundColor: '#9CCC65',
              borderColor: '#7CB342',
              data: (data as { currency: string, outcome: number }[]).map(b => {
                switch (b.currency) {
                  case 'USD':
                    b.outcome *= this.usdRate;
                    break;
                  case 'EUR':
                    b.outcome *= this.eurRate;
                    break;
                  case 'RUB':
                  default:
                    break;
                }
                return b;
              }).map(b => b.outcome)
            }
          ]
        };
      }, console.error);
  }
}
