import { describe, expect, it } from "vitest";
import { creditAgricoleParser } from "./creditAgricole";
import { fortuneoParser } from "./fortuneo";
import { detectParser } from "./index";
import {
  CREDIT_AGRICOLE_SAMPLE,
  FORTUNEO_SAMPLE,
} from "./fixtures";

describe("creditAgricoleParser", () => {
  const result = creditAgricoleParser.parse(CREDIT_AGRICOLE_SAMPLE);

  it("parses all transaction rows", () => {
    expect(result.rows).toHaveLength(5);
  });

  it("signs debits negative and credits positive", () => {
    const loyer = result.rows.find((r) => r.label.includes("LOYER"))!;
    expect(loyer.amountCents).toBe(-54000);
    const salaire = result.rows.find((r) => r.label.includes("SALAIRE"))!;
    expect(salaire.amountCents).toBe(230000);
  });

  it("normalizes dates to ISO", () => {
    expect(result.rows[0].bookingDate).toBe("2024-03-05");
  });

  it("captures the reported closing balance", () => {
    expect(result.reportedBalanceCents).toBe(125040);
    expect(result.reportedBalanceDate).toBe("2024-03-31");
  });

  it("parses semicolon tables even when the preamble contains more commas", () => {
    const withCommaPreamble = `Export bancaire, compte courant, periode mars
Commentaire, avec, beaucoup, de, virgules
Date;Libelle;Debit euros;Credit euros
05/03/2024;PRLV LOYER FONCIA;540,00;
12/03/2024;VIREMENT SALAIRE DEMO SA;;2 300,00
`;
    const parsed = creditAgricoleParser.parse(withCommaPreamble);

    expect(parsed.rows).toHaveLength(2);
    expect(parsed.rows[0].amountCents).toBe(-54000);
    expect(parsed.warnings).toEqual([]);
  });
});

describe("fortuneoParser", () => {
  const result = fortuneoParser.parse(FORTUNEO_SAMPLE);

  it("parses rows with value dates", () => {
    expect(result.rows).toHaveLength(4);
    expect(result.rows[0].valueDate).toBe("2024-03-06");
  });

  it("keeps signed amounts from the debit/credit columns", () => {
    const lidl = result.rows.find((r) => r.label.includes("LIDL"))!;
    expect(lidl.amountCents).toBe(-4530);
    const vir = result.rows.find((r) => r.label.includes("INTERNE"))!;
    expect(vir.amountCents).toBe(20000);
  });
});

describe("detectParser", () => {
  it("routes samples to the right bank", () => {
    expect(detectParser(CREDIT_AGRICOLE_SAMPLE)?.bank).toBe("credit_agricole");
    expect(detectParser(FORTUNEO_SAMPLE)?.bank).toBe("fortuneo");
  });
});
