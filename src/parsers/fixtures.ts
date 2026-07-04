// Synthetic, fully made-up bank exports used only by tests. These are NOT real
// data. Real exports live outside Git (see .gitignore) and are never committed.

// Credit Agricole style: preamble lines, then a `;` table with split
// Debit/Credit euros columns and a trailing balance line.
export const CREDIT_AGRICOLE_SAMPLE = `Compte de cheques - Credit Agricole
Titulaire: Compte Demo
Solde au 31/03/2024;;;1 250,40

Date;Libelle;Debit euros;Credit euros
05/03/2024;PRLV LOYER FONCIA;540,00;
07/03/2024;PAIEMENT CB CARREFOUR MARKET;82,15;
12/03/2024;VIREMENT SALAIRE DEMO SA;;2 300,00
15/03/2024;PAIEMENT CB PHARMACIE DU PARC;23,90;
20/03/2024;VIREMENT INTERNE VERS LIVRET;200,00;
`;

// Fortuneo style: single header line, `;` table with split Debit/Credit and a
// value date column.
export const FORTUNEO_SAMPLE = `Date operation;Date valeur;libelle;Debit;Credit
2024-03-06;2024-03-06;CARTE LIDL;-45,30;
2024-03-08;2024-03-08;CARTE DECATHLON;-59,99;
2024-03-21;2024-03-21;VIREMENT INTERNE DEPUIS CA;;200,00
2024-03-18;2024-03-18;PRLV EDF ENERGIE;-89,00;
`;

// A second Credit Agricole export overlapping the first (same first three rows)
// plus one new row — used to prove deduplication on re-import.
export const CREDIT_AGRICOLE_SAMPLE_OVERLAP = `Date;Libelle;Debit euros;Credit euros
05/03/2024;PRLV LOYER FONCIA;540,00;
07/03/2024;PAIEMENT CB CARREFOUR MARKET;82,15;
25/03/2024;PAIEMENT CB LEROY MERLIN;134,50;
`;
