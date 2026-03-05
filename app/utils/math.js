// math functions to handle amounts, dates, and more
// tldr i got tired of redeclaring these functions in every page

export function relativeTime(date) {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(diff / 60000);
  const hrs = Math.floor(min / 60);
  const d = Math.floor(hrs / 24);

  if (sec < 60) return `${sec}s ago`;
  if (min < 60) return `${min}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${d}d ago`;
}

export function date(date) {
  const d = new Date(date);
  return d.toLocaleDateString();
}
const activityLabels = {
  "ach_transfer.create": "ACH transfer created",
  "ach_transfer.failed": "ACH transfer failed",
  "ach_transfer.rejected": "ACH transfer rejected",
  "check_deposit.create": "Check deposited",
  "comment.create": "Comment added",
  "comment.destroy": "Comment deleted",
  "comment.update": "Comment updated",
  "disbursement.create": "Transfer initiated",
  "disbursement.rejected": "Transfer rejected",
  "donation.paid": "Donation received",
  "employee.create": "Employee added",
  "event.create": "Organization created",
  "increase_check.create": "Check mailed",
  "increase_check.rejected": "Check rejected",
  "invoice.create": "Invoice created",
  "invoice.paid": "Invoice paid",
  "organizer_position_invite.create": "Organizer invited",
  "raw_pending_stripe_transaction.create": "Card transaction",
  "reimbursement_expense.approved": "Expense approved",
  "reimbursement_report.approved": "Reimbursement approved",
  "reimbursement_report.create": "Reimbursement submitted",
  "reimbursement_report.review_requested": "Reimbursement review requested",
  "wire.create": "Wire transfer created",
  "wire.failed": "Wire transfer failed",
  "wire.rejected": "Wire transfer rejected",
  "wise_transfer.create": "Wise transfer created",
  "wise_transfer.failed": "Wise transfer failed",
  "wise_transfer.rejected": "Wise transfer rejected",
};

export function activityLabel(key) {
  return activityLabels[key] || key.replace(/[_.]/g, " ");
}

export function fixMoney(cents, flip = false) {
  const amount = flip ? Math.abs(cents) : cents;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount / 100);
}
