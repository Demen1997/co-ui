import {Component, OnInit} from '@angular/core';
import {Balance, emptyBalance} from '../../core/model/main/balance.model';
import {ConfirmationService, DialogService, DynamicDialogConfig, DynamicDialogRef, SelectItem} from 'primeng/api';
import {NotificationService} from '../../core/service/notification.service';
import {Action, Result} from '../../core/model/main/action.model';
import {Service} from '../../core/service/service';

@Component({
  selector: 'app-balances',
  templateUrl: './balances.component.html',
  styleUrls: ['./balances.component.css'],
  providers: [
    DialogService,
    ConfirmationService,
    Service,
    {
      provide: Service.CONFIG_URL,
      useValue: `${Service.API_URL}/balances`
    }
  ]
})
export class BalancesComponent implements OnInit {
  public static readonly ROUTER_PATH = 'balances';
  balances: Balance[] = [];

  private readonly updateBalancesFunc = result => {
    if (result === Result.SUCCESS) {
      this.updateBalances();
    }
  };

  constructor(private dialogService: DialogService,
              private balanceService: Service<Balance>,
              private messageService: NotificationService,
              private confirmationService: ConfirmationService) {
  }

  ngOnInit() {
    this.updateBalances();
  }

  delete(id: number) {
    this.confirmationService.confirm({
      message: 'Хотите удалить этот счет?',
      accept: () => {
        this.balanceService.delete(id)
          .subscribe(_ => {
            this.messageService.logSuccess('Счет был удален');
            this.updateBalances();
          }, () => this.messageService.logError('Произошла ошибка при удалении счета'));
      }
    });
  }

  edit(id: number) {
    this.dialogService.open(BalanceDialog, {
      header: `Править счет: ${id}`,
      data: {
        balanceId: id,
        action: Action.EDIT
      }
    }).onClose.subscribe(this.updateBalancesFunc);
  }

  createBalance() {
    this.dialogService.open(BalanceDialog, {
      header: 'Создать счет',
      data: {
        action: Action.CREATE
      }
    }).onClose.subscribe(this.updateBalancesFunc);
  }

  private updateBalances() {
    this.balanceService.getAll()
      .subscribe(
        response => this.balances = response.body ? response.body : [],
        _ => this.messageService.logError('Неизвестная ошибка')
      );
  }
}

@Component({
  template: `
    <form (ngSubmit)="confirm()">
      <div class="ui-g-12">
        <label for="balanceName">Имя счета</label>
        <input id="balanceName" class="field"
               type="text" pInputText placeholder="Имя счета"
               [(ngModel)]="balance.name" [ngModelOptions]="{standalone: true}"/>
        <br>
      </div>
      <div class="ui-g-12">
        <label for="currency">Валюта</label><br>
        <p-dropdown [options]="availableCurrencies"
                    [(ngModel)]="pickedCurrency"
                    [ngModelOptions]="{standalone: true}"
                    [disabled]="isActionEdit()"></p-dropdown>
      </div>
      <div class="ui-g-12" *ngIf="isActionEdit()">
        <label for="balance">Текущий баланс</label>
        <input type="text" pInputText class="field" disabled id="balance"
               [(ngModel)]="balance.balance" [ngModelOptions]="{standalone: true}"/>
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
      useValue: `${Service.API_URL}/balances`
    }
  ]
})
// tslint:disable-next-line
export class BalanceDialog implements OnInit {
  balance: Balance = new Balance();
  action: Action;
  availableCurrencies: SelectItem[] = [];
  pickedCurrency: string;

  constructor(private balanceService: Service<Balance>,
              private messageService: NotificationService,
              public ref: DynamicDialogRef,
              public config: DynamicDialogConfig) {
    this.action = this.config.data.action;
  }

  ngOnInit() {
    if (this.isActionEdit()) {
      this.balanceService.get(this.config.data.balanceId)
        .subscribe(data => {
          this.balance = data;
          this.pickedCurrency = data.currency;
        });
      return;
    }

    this.balanceService.getAvailableCurrencies()
      .subscribe(
        data => {
          this.availableCurrencies = data.map(c => ({label: c, value: c}));
          this.pickedCurrency = this.availableCurrencies[0].value;
        },
        () => this.messageService.logError('Неизвестная ошибка')
      );

    this.balance = emptyBalance();
  }

  confirm() {
    if (this.action === Action.EDIT) {
      if (!this.balance.name.trim()) {
        this.messageService.logError('Введите корректное имя счета');
        this.ref.close();
      }
      this.balanceService.update(this.balance)
        .subscribe(
          _ => {
            this.messageService.logSuccess('Счет был обновлен');
            this.ref.close(Result.SUCCESS);
          },
          _ => {
            this.messageService.logError('Неизвестная ошибка');
            this.ref.close();
          }
        );
      return;
    }

    this.balance.currency = this.pickedCurrency;
    if (!this.balance.validate(this.action)) {
      this.ref.close();
      return this.messageService.logError('Введите корректные данные счета');
    }

    this.balanceService.create(this.balance)
      .subscribe(
        _ => {
          this.messageService.logSuccess('Счет был создан');
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
