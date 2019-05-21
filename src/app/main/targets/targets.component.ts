import {Component, OnInit} from '@angular/core';
import {Action, Result} from '../../core/model/main/action.model';
import {BudgetDialog, BudgetExpendDialog} from '../budgets/budgets.component';
import {ConfirmationService, DialogService, DynamicDialogConfig, DynamicDialogRef, SelectItem} from 'primeng/api';
import {Service} from '../../core/service/service';
import {NotificationService} from '../../core/service/notification.service';
import {emptyGoal, Goal} from '../../core/model/main/goal.model';
import {Budget} from '../../core/model/main/budget.model';
import {BalancesService} from '../../core/service/balances.service';
import {TransactionService} from '../../core/service/transaction.service';
import {Balance} from '../../core/model/main/balance.model';
import {finalize} from 'rxjs/operators';

@Component({
  selector: 'app-targets',
  templateUrl: './targets.component.html',
  styleUrls: ['./targets.component.css'],
  providers: [
    DialogService,
    ConfirmationService,
    Service,
    {
      provide: Service.CONFIG_URL,
      useValue: `${Service.API_URL}/goals`
    }
  ]
})
export class TargetsComponent implements OnInit {

  public static readonly ROUTER_PATH = 'targets';

  goals: Goal[] = [];

  private readonly updateGoalsFunc = result => {
    if (result === Result.SUCCESS) {
      this.updateGoals();
    }
  };

  constructor(private dialogService: DialogService,
              private goalService: Service<Goal>,
              private balanceService: BalancesService,
              private messageService: NotificationService,
              private confirmationService: ConfirmationService) {
  }

  ngOnInit() {
    this.updateGoals();
  }

  createGoal() {
    this.dialogService.open(GoalDialog, {
      header: 'Создать цель',
      data: {
        action: Action.CREATE
      }
    }).onClose.subscribe(this.updateGoalsFunc);
  }

  edit(id: number) {
    this.dialogService.open(GoalDialog, {
      header: `Править цель: ${id}`,
      data: {
        goalId: id,
        action: Action.EDIT
      }
    }).onClose.subscribe(this.updateGoalsFunc);
  }

  delete(id: number) {
    this.confirmationService.confirm({
      message: 'Удалить эту цель?',
      accept: () => {
        this.goalService.delete(id)
          .subscribe(_ => {
            this.messageService.logSuccess('Цель была удалена');
            this.updateGoals();
          }, () => this.messageService.logError('Неизвестная ошибка'));
      }
    });
  }

  roundRelAmount(relAmount: number) {
    return relAmount.toFixed(2);
  }

  private updateGoals() {
    this.goalService.getAll()
      .subscribe(
        response => this.goals = response.body ? response.body : [],
        _ => this.messageService.logError('Неизвестная ошибка')
      );
  }

  addMoney(id: any) {
    this.goalService.get(id).subscribe(
      response => {
        this.balanceService.getAllByCurrency(response.currency)
          .subscribe(
            balancesResponse => {
              const balances = (balancesResponse.body as Balance[]);
              if (balances.length === 0) {
                this.messageService.logError('Сначала создайте баланс с валютой, соответствующей данной цели');
                return;
              }

              this.dialogService.open(GoalFillingDialog, {
                header: `Пополнить цель: ${id}`,
                data: {
                  goal: response,
                  balances
                }
              }).onClose.subscribe(this.updateGoalsFunc);
            },
            () => this.messageService.logError('Неизвестная ошибка')
          );
      },
      () => this.messageService.logError('Не удалось получить данные цели')
    );
  }
}

@Component({
  template: `
    <form (ngSubmit)="confirm()">
      <div class="ui-g-12">
        <label for="budgetName">Имя цели</label>
        <input id="budgetName" class="field"
               type="text" pInputText placeholder="Имя цели"
               [(ngModel)]="goal.name" [ngModelOptions]="{standalone: true}"/>
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
        <label for="initialAmount">Сумма цели</label>
        <input type="text" pInputText class="field" placeholder="Сумма цели"
               [disabled]="isActionEdit()" id="initialAmount" pKeyFilter="pint"
               [(ngModel)]="goal.initialAmount" [ngModelOptions]="{standalone: true}"/>
      </div>
      <div class="ui-g-12" *ngIf="isActionEdit()">
        <label for="balance">Текущий прогресс</label>
        <input type="text" pInputText class="field" disabled id="balance"
               [(ngModel)]="goal.currentAmount" [ngModelOptions]="{standalone: true}"/>
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
      useValue: `${Service.API_URL}/goals`
    }
  ]
})
// tslint:disable-next-line
export class GoalDialog implements OnInit {
  goal: Goal = new Goal();
  action: Action;
  availableCurrencies: SelectItem[] = [];
  pickedCurrency: string;

  constructor(private goalService: Service<Goal>,
              private messageService: NotificationService,
              public ref: DynamicDialogRef,
              public config: DynamicDialogConfig) {
    this.action = this.config.data.action;
  }

  ngOnInit() {
    this.goalService.getAvailableCurrencies()
      .subscribe(
        data => {
          this.availableCurrencies = data.map(c => ({label: c, value: c}));
          this.pickedCurrency = this.availableCurrencies[0].value;
        },
        () => this.messageService.logError('Неизвестная ошибка')
      );

    if (this.isActionEdit()) {
      this.goalService.get(this.config.data.goalId)
        .subscribe(data => {
          this.goal = data;
          this.pickedCurrency = data.currency;
        });
      return;
    }

    this.goalService.getAvailableCurrencies()
      .subscribe(
        data => {
          this.availableCurrencies = data.map(c => ({label: c, value: c}));
          this.pickedCurrency = this.availableCurrencies[0].value;
        },
        () => this.messageService.logError('Неизвестная ошибка')
      );

    this.goal = emptyGoal();
  }

  confirm() {
    if (this.action === Action.EDIT) {
      if (!this.goal.name.trim()) {
        this.messageService.logError('Введите корректные данные цели');
        this.ref.close();
      }
      this.goalService.update(this.goal)
        .subscribe(
          _ => {
            this.messageService.logSuccess('Цель была обновлена');
            this.ref.close(Result.SUCCESS);
          },
          _ => {
            this.messageService.logError('Неизвестная ошибка');
            this.ref.close();
          }
        );
      return;
    }

    this.goal.currency = this.pickedCurrency;
    if (!this.goal.validate(this.action)) {
      this.ref.close();
      return this.messageService.logError('Введите корректные данные цели');
    }

    this.goalService.create(this.goal)
      .subscribe(
        _ => {
          this.messageService.logSuccess('Цель была создана');
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
export class GoalFillingDialog {

  currency: string;
  goal: Goal;
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
    this.goal = this.config.data.goal;
    this.getAvailableBalances(this.config.data.balances);
  }

  confirm() {
    this.transactionService.fillGoal({
      balanceId: this.selectedBalance,
      amount: this.amount,
      description: `${new Date().toISOString()}. System payment from ${this.goal.name}`
    }, this.goal.id)
      .pipe(finalize(() => this.ref.close(Result.SUCCESS)))
      .subscribe(
        () => this.messageService.logSuccess('Транзакция создана'),
        () => this.messageService.logError('Неизвестная ошибка')
      );
  }

  private getAvailableBalances(balances: Balance[]) {
    this.availableBalances = balances.map(b => ({label: b.name, value: b.id}));
    this.selectedBalance = this.availableBalances[0].value;
    this.displayedBalance = balances[0].balance;
    this.displayedCurrency = balances[0].currency;
  }
}
