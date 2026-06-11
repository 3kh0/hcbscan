// Shared shapes for HCB API payloads consumed by the frontend.

export interface HcbUserRef {
  id: string;
  full_name: string;
  photo?: string | null;
}

export interface HcbTransactionListItem {
  id: string;
  date: string;
  memo: string;
  amount_cents: number;
  pending: boolean;
  comments: { count: number };
  receipts: { count: number; missing?: boolean };
  user: HcbUserRef | null;
}

export interface HcbTransactionDetail {
  id: string;
  object?: string;
  href?: string;
  date: string;
  memo: string;
  amount_cents: number;
  local_amount_cents?: number;
  local_currency?: string;
  status?: string;
  recurring?: boolean;
  organization: { id: string; name?: string };
  user?: HcbUserRef | null;
  card?: { id: string } | null;
  donor?: { name?: string; anonymous?: boolean } | null;
  sponsor?: { name?: string } | null;
  beneficiary?: { name?: string } | null;
}

export interface HcbActivityDetail {
  id: string;
  key: string;
  created_at: string;
  user: HcbUserRef | null;
  organization: { id: string; name: string };
  transaction?: {
    id: string;
    amount_cents: number;
    memo: string;
    type: string;
    pending: boolean;
  } | null;
}

export interface HcbActivityListItem {
  id: string;
  key: string;
  created_at: string;
  user: { id: string; full_name: string | null; photo: string | null } | null;
  organization: {
    id: string | null;
    name: string | null;
    logo: string | null;
  };
}

export interface HcbOrgSummary {
  name?: string;
  logo?: string;
}
