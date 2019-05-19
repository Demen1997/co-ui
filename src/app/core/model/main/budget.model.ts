import {Action} from './action.model';

export class Budget {
  id: number;
  name: string;
  initialAmount: number;
  currentAmount: number;
  relAmount: number;
  currency: string;

  validate(action: Action): boolean {
    if (action === Action.EDIT) {
      return !!this.name;
    }

    return !!this.name && this.currency !== undefined && this.initialAmount >= 0;
  }
}

export const emptyBudget: () => Budget = () => new Budget();
