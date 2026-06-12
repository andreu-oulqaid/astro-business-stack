export function formatLeadLabel(leadNumber: number): string {
  return `lead${leadNumber}`;
}

/** Internal Notion/email identifiers — never exposed in the UI or public API. */
export function leadInternalName(leadNumber: number): string {
  return formatLeadLabel(leadNumber);
}

export function leadInternalEmail(leadNumber: number): string {
  return `${formatLeadLabel(leadNumber)}@sandbox.internal`;
}
