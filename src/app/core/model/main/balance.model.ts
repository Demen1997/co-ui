import {Action} from './action.model';

export class Balance {
  id: number;
  name: string;
  currency: string;
  annualIncomePercentage: number;
  balance: number;

  validate(action: Action): boolean {
    if (action === Action.EDIT) {
      return !!this.name;
    }

    return !!this.name && this.currency !== undefined;
  }
}

export const emptyBalance: () => Balance = () => new Balance();
