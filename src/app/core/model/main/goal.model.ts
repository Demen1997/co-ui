import {Action} from './action.model';

export class Goal {
  id: number;
  name: string;
  currency: string;
  currentAmount: number;
  initialAmount: number;
  isDeletable: boolean;

  validate(action: Action): boolean {
    if (action === Action.EDIT) {
      return !!this.name;
    }

    return !!this.name && this.currency !== undefined;
  }
}

export const emptyGoal: () => Goal = () => new Goal();
