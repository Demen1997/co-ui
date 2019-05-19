import {Component, OnInit} from '@angular/core';
import {ConfirmationService, DialogService, DynamicDialogConfig, DynamicDialogRef, SelectItem} from 'primeng/api';
import {Service} from '../../core/service/service';
import {NotificationService} from '../../core/service/notification.service';
import {Balance} from '../../core/model/main/balance.model';
import {TransactionService} from '../../core/service/transaction.service';
import {Transaction} from '../../core/model/main/transaction.model';
import {finalize} from 'rxjs/operators';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css'],
  providers: [
    DialogService,
    ConfirmationService,
    Service,
    {
      provide: Service.CONFIG_URL,
      useValue: Service.API_URL + '/balances'
    }
  ]
})
export class PaymentsComponent implements OnInit {
  public static readonly ROUTER_PATH = 'payments';

  userBalances: SelectItem[] = [];
  balancesCriteria: number[];
  transactions: Transaction[] = [];

  constructor(private balanceService: Service<Balance>,
              private messageService: NotificationService,
              private transactionService: TransactionService,
              private dialogService: DialogService) {
  }

  ngOnInit() {
    this.balanceService.getAll()
      .subscribe(
        response => {
          const responseBody = (response.body as Balance[]);
          this.userBalances = responseBody
            .map(b => ({label: b.name, value: b.id}));
          this.balancesCriteria = responseBody.map(b => b.id);
          this.updateTransactionTable();
        },
        () => this.messageService.logError('Ошибка при получении счетов пользователя'));
  }

  createPayment() {
    if (this.userBalances.length === 0) {
      return this.messageService.logError('Сначала создайте счет');
    }

    const ref = this.dialogService.open(PaymentDialog, {
      header: 'Новый платеж',
      width: '30%',
      height: '65%',
      data: {
        balances: this.userBalances
      }
    });

    ref.onClose.subscribe(() => this.updateTransactionTable());
  }

  updateTransactionTable() {
    if (this.balancesCriteria.length === 0) {
      this.transactions = [];
      return;
    }

    this.transactionService.getTransactions(this.balancesCriteria)
      .subscribe(response => this.transactions = response, () => this.messageService.logError('Неизвестная ошибка'));
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
          <p-dropdown id="balance" [options]="balances" [(ngModel)]="selectedBalance"
                      [ngModelOptions]="{standalone: true}" (onChange)="updateSelectedBalance()"></p-dropdown>
        </div>
        <div class="ui-g-3">{{displayedBalance}} {{displayedCurrency}}</div>
      </div>
      <hr size="1">
      <div class="ui-g-12" style="padding-top: 20px;">
        <div><label for="amount">Введите сумму</label></div>
      </div>
      <div class="ui-g-12" style="padding-bottom: 30px">
        <div class="ui-inputgroup">
          <span class="ui-inputgroup-addon">$</span>
          <input id="amount" type="text" pInputText placeholder="Сумма" pKeyFilter="money"
                 [(ngModel)]="amount" [ngModelOptions]="{standalone: true}">
          <p-selectButton [options]="incomeExpenseSwitcher" [(ngModel)]="transactionType"
                          [ngModelOptions]="{standalone: true}"></p-selectButton>
        </div>
      </div>
      <hr size="1">
      <div class="ui-g-12" style="padding-top: 30px">
        <label for="description">Описание</label>
      </div>
      <div class="ui-g-12">
        <textarea pInputTextarea [(ngModel)]="description"
                  [ngModelOptions]="{standalone: true}"
                  id="description" autoResize="false">
        </textarea>
      </div>
      <div class="ui-g-12" style="padding-top: 30px">
        <p-button label="Применить"></p-button>
      </div>
    </form>
  `,
  providers: []
})
// tslint:disable-next-line
export class PaymentDialog implements OnInit {

  balances: SelectItem[];
  selectedBalance: number;
  description: string;

  incomeExpenseSwitcher = [
    {
      label: '+',
      value: true
    },
    {
      label: '-',
      value: false
    }
  ];
  transactionType = true;

  displayedBalance: number;
  displayedCurrency: string;
  amount: number;

  constructor(private messageService: NotificationService,
              public ref: DynamicDialogRef,
              public config: DynamicDialogConfig,
              private balanceService: Service<Balance>,
              private transactionService: TransactionService) {
    this.balances = this.config.data.balances;
    this.selectedBalance = this.balances[0].value;
  }

  ngOnInit() {
    this.updateDisplayedBalance();
  }

  confirm() {
    if (this.description.length > 64) {
      return this.messageService.logError('Описание не должно быть длиннее, чем 64 символа');
    }

    this.transactionService.sendTransaction({
      balanceId: this.selectedBalance,
      amount: (this.transactionType ? 1 : -1) * this.amount,
      description: this.description
    }).pipe(
      finalize(() => this.ref.close())
    ).subscribe(
      () => this.messageService.logSuccess('Транзакция успешно создана'),
      () => this.messageService.logError('Неизвестная ошибка')
    );
  }

  private updateDisplayedBalance() {
    this.balanceService.get(this.selectedBalance).subscribe(response => {
      this.displayedBalance = response.balance;
      this.displayedCurrency = response.currency;
    }, _ => this.messageService.logError('Неизвестная ошибка'));
  }

  updateSelectedBalance() {
    this.updateDisplayedBalance();
  }
}

