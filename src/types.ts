export type Category =
  | 'steamed'
  | 'street'
  | 'sweet'
  | 'specials'
  | 'drinks'
  | 'party'
  | 'partymeals';

export interface MenuItem {
  readonly id: number;
  readonly name: string;
  readonly unit: string;
  readonly price: number;
  readonly photo?: string;
  readonly pos?: string;
  readonly emoji: string;
  readonly bg: string;
  readonly desc: string;
  readonly preorder?: boolean;
  readonly minQty?: number;
  readonly hero?: boolean;
  readonly breadChoice?: boolean;
  readonly snackChoice?: boolean;
}

export type Cart = Record<number, number>;
export type BreadChoice = 'Roti' | 'Paratha';
export type SnackChoice = 'Khaman' | 'Dhokla';
export type BreadSelections = Partial<Record<number, BreadChoice>>;
export type SnackSelections = Partial<Record<number, SnackChoice>>;

export interface OrderDetails {
  name: string;
  phone: string;
  addr: string;
  note: string;
}

export interface OrderMessage {
  message: string;
  submittedIds: number[];
  total: number;
}
