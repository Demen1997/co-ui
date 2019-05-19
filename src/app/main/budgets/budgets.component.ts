import {Component, OnInit} from '@angular/core';
import {Budget, emptyBudget} from '../../core/model/main/budget.model';
import {Service} from '../../core/service/service';
import {Action, Result} from '../../core/model/main/action.model';
import {ConfirmationService, DialogService, DynamicDialogConfig, DynamicDialogRef, SelectItem} from 'primeng/api';
import {NotificationService} from '../../core/service/notification.service';
import {BalancesService} from '../../core/service/balances.service';
import {TransactionService} from '../../core/service/transaction.service';
import {Balance} from '../../core/model/main/balance.model';
import {finalize} from 'rxjs/operators';

@Component({
  selector: 'app-budgets',
  templateUrl: './budgets.component.html',
  styleUrls: ['./budgets.component.css'],
  providers: [
    DialogService,
    ConfirmationService,
    Service,
    {
      provide: Service.CONFIG_URL,
      useValue: `${Service.API_URL}/budgets`
    }
  ]
})
export class BudgetsComponent implements OnInit {

  constructor(private dialogService: DialogService,
              private budgetService: Service<Budget>,
              private messageService: NotificationService,
              private confirmationService: ConfirmationService) {
  }

  public static readonly ROUTER_PATH = 'budgets';
  budgets: Budget[] = [];

  private readonly updateBudgetsFunc = result => {
    if (result === Result.SUCCESS) {
      this.updateBudgets();
    }
  };

  ngOnInit() {
    this.updateBudgets();
  }

  createBudget() {
    this.dialogService.open(BudgetDialog, {
      header: 'Создать бюджет',
      data: {
        action: Action.CREATE
      }
    }).onClose.subscribe(this.updateBudgetsFunc);
  }

  edit(id: number) {
    this.dialogService.open(BudgetDialog, {
      header: `Править бюджет: ${id}`,
      data: {
        balanceId: id,
        action: Action.EDIT
      }
    }).onClose.subscribe(this.updateBudgetsFunc);
  }

  delete(id: number) {
    this.confirmationService.confirm({
      message: 'Удалить этот бюджет?',
      accept: () => {
        this.budgetService.delete(id)
          .subscribe(_ => {
            this.messageService.logSuccess('Бюджет был удален');
            this.updateBudgets();
          }, () => this.messageService.logError('Неизвестная ошибка'));
      }
    });
  }

  expend(id: number) {
    this.dialogService.open(BudgetExpendDialog, {
      header: `Потратить бюджет: ${id}`,
      data: {
        budgetId: id
      }
    }).onClose.subscribe(this.updateBudgetsFunc);
  }

  roundRelAmount(relAmount: number) {
    return relAmount.toFixed(2);
  }

  private updateBudgets() {
    this.budgetService.getAll()
      .subscribe(
        response => this.budgets = response.body ? response.body : [],
        _ => this.messageService.logError('Неизвестная ошибка')
      );
  }
}

@Component({
  template: `
    <form (ngSubmit)="confirm()">
      <div class="ui-g-12">
        <label for="budgetName">Имя бюджета</label>
        <input id="budgetName" class="field"
               type="text" pInputText placeholder="Имя бюджета"
               [(ngModel)]="budget.name" [ngModelOptions]="{standalone: true}"/>
        <br>
      </div>
      <div class="ui-g-12">
        <label for="currency">Валюта</label><br>
        <p-dropdown [options]="availableCurrencies"
                    [(ngModel)]="pickedCurrency"
                    [ngModelOptions]="{standalone: true}"
                    [disabled]="isActionEdit()"></p-dropdown>
      </div>
      <div class="ui-g-12">
        <label for="initialAmount">Начальный капитал</label>
        <input type="text" pInputText class="field" placeholder="Начальный капитал"
               [disabled]="isActionEdit()" id="initialAmount" pKeyFilter="pint"
               [(ngModel)]="budget.initialAmount" [ngModelOptions]="{standalone: true}"/>
      </div>
      <div class="ui-g-12" *ngIf="isActionEdit()">
        <label for="balance">Текущий капитал</label>
        <input type="text" pInputText class="field" disabled id="balance"
               [(ngModel)]="budget.currentAmount" [ngModelOptions]="{standalone: true}"/>
      </div>
      <div class="ui-g-6">
        <button pButton type="button" label="Применить"
                (click)="confirm()"></button>
      </div>
    </form>
  `,
  providers: [
    Service,
    {
      provide: Service.CONFIG_URL,
      useValue: `${Service.API_URL}/budgets`
    }
  ]
})
// tslint:disable-next-line
export class BudgetDialog implements OnInit {
  budget: Budget = new Budget();
  action: Action;
  availableCurrencies: SelectItem[] = [];
  pickedCurrency: string;

  constructor(private budgetService: Service<Budget>,
              private messageService: NotificationService,
              public ref: DynamicDialogRef,
              public config: DynamicDialogConfig) {
    this.action = this.config.data.action;
  }

  ngOnInit() {
    if (this.isActionEdit()) {
      this.budgetService.get(this.config.data.balanceId)
        .subscribe(data => {
          this.budget = data;
          this.pickedCurrency = data.currency;
        });
      return;
    }

    this.budgetService.getAvailableCurrencies()
      .subscribe(
        data => {
          this.availableCurrencies = data.map(c => ({label: c, value: c}));
          this.pickedCurrency = this.availableCurrencies[0].value;
        },
        () => this.messageService.logError('Неизвестная ошибка')
      );

    this.budget = emptyBudget();
  }

  confirm() {
    if (this.action === Action.EDIT) {
      if (!this.budget.name.trim()) {
        this.messageService.logError('Введите корректные данные бюджета');
        this.ref.close();
      }
      this.budgetService.update(this.budget)
        .subscribe(
          _ => {
            this.messageService.logSuccess('Бюджет был обновлен');
            this.ref.close(Result.SUCCESS);
          },
          _ => {
            this.messageService.logError('Неизвестная ошибка');
            this.ref.close();
          }
        );
      return;
    }

    this.budget.currency = this.pickedCurrency;
    if (!this.budget.validate(this.action)) {
      this.ref.close();
      return this.messageService.logError('Введите корректные данные бюджета');
    }

    this.budgetService.create(this.budget)
      .subscribe(
        _ => {
          this.messageService.logSuccess('Бюджет был создан');
          this.ref.close(Result.SUCCESS);
        },
        error => {
          this.messageService.logError('Неизвестная ошибка');
          this.ref.close(Result.FAIL);
        });
  }

  isActionEdit() {
    return this.action === Action.EDIT;
  }
}

@Component({
  template: `
    <form (ngSubmit)="confirm()">
      <div class="ui-g-12">
        <div><label for="balance">Выберите счет: </label></div>
      </div>
      <div class="ui-g-12" style="padding-bottom: 30px">
        <div class="ui-g-9">
          <p-dropdown id="balance" [options]="availableBalances" [(ngModel)]="selectedBalance"
                      [ngModelOptions]="{standalone: true}"></p-dropdown>
        </div>
        <div class="ui-g-3">{{displayedBalance}} {{displayedCurrency}}</div>
      </div>
      <hr size="1">
      <div class="ui-g-12" style="padding-top: 20px;">
        <div><label for="amount">Сумма</label></div>
      </div>
      <div class="ui-g-12" style="padding-bottom: 30px">
        <div class="ui-inputgroup">
          <span class="ui-inputgroup-addon">$</span>
          <input id="amount" type="text" pInputText placeholder="Сумма" pKeyFilter="money"
                 [(ngModel)]="amount" [ngModelOptions]="{standalone: true}">
        </div>
      </div>
      <div class="ui-g-12" style="padding-top: 30px">
        <p-button label="Применить"></p-button>
      </div>
    </form>
  `,
  providers: [
    Service,
    {
      provide: Service.CONFIG_URL,
      useValue: `${Service.API_URL}/budgets`
    }
  ]
})
// tslint:disable-next-line
export class BudgetExpendDialog {

  currency: string;
  budget: Budget;
  availableBalances: SelectItem[];
  selectedBalance: number;
  displayedBalance: number;
  displayedCurrency: string;
  amount: number;

  constructor(private balanceService: BalancesService,
              private transactionService: TransactionService,
              private budgetService: Service<Budget>,
              private messageService: NotificationService,
              public ref: DynamicDialogRef,
              public config: DynamicDialogConfig) {
    this.budgetService.get(this.config.data.budgetId).subscribe(
      response => {
        this.budget = response;
        this.getAvailableBalances(response.currency);
      },
      () => this.messageService.logError('Не удалось получить данные бюджета')
    );
  }

  confirm() {
    this.transactionService.expendBudget({
      balanceId: this.selectedBalance,
      amount: -this.amount,
      description: `${new Date().toISOString()}. System payment from ${this.budget.name}`
    }, this.budget.id)
      .pipe(finalize(() => this.ref.close(Result.SUCCESS)))
      .subscribe(
        () => this.messageService.logSuccess('Транзакция создана'),
        () => this.messageService.logError('Неизвестная ошибка')
      );
  }

  private getAvailableBalances(currency: string) {
    this.balanceService.getAllByCurrency(currency)
      .subscribe(
        response => {
          const balances = (response.body as Balance[]);
          this.availableBalances = balances.map(b => ({label: b.name, value: b.id}));
          this.selectedBalance = this.availableBalances[0].value;
          this.displayedBalance = balances[0].balance;
          this.displayedCurrency = balances[0].currency;
        },
        () => this.messageService.logError('Неизвестная ошибка')
      );
  }
}

