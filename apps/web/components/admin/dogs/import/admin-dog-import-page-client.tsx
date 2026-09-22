"use client";

import { useState } from "react";
import { createAdminDogsApiClient } from "@beagle/api-client";
import type { AdminFinnishKennelClubImportPreviewResponse } from "@beagle/contracts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const client = createAdminDogsApiClient();
export function AdminDogImportPageClient() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] =
    useState<AdminFinnishKennelClubImportPreviewResponse | null>(null);
  const [step, setStep] = useState<
    "upload" | "review" | "confirm" | "complete"
  >("upload");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const replace = (next: File | null) => {
    setFile(next);
    setPreview(null);
    setError(null);
    setStep("upload");
  };
  const review = async () => {
    if (!file) return;
    setBusy(true);
    const result = await client.previewFinnishKennelClubImport(file);
    setBusy(false);
    if (!result.ok) return setError(result.error);
    setPreview(result.data);
    setStep("review");
  };
  const apply = async () => {
    if (!file || !preview) return;
    setBusy(true);
    const result = await client.applyFinnishKennelClubImport(
      file,
      preview.previewDigest,
      preview.sourceFileSha256,
    );
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      setStep("review");
      return;
    }
    setStep("complete");
  };
  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Rekisteröintien tuonti</h1>
        <p className="text-sm text-muted-foreground">
          Suomen koirarekisteri, .xlsx, enintään 10 MiB
        </p>
      </div>
      <p className="text-sm">1. Lataa tiedosto 2. Tarkista 3. Vahvista</p>
      <Card>
        <CardHeader>
          <CardTitle>
            {step === "complete" ? "Tuonti valmis" : "Lataa tiedosto"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === "complete" ? (
            <>
              <p>
                Tuonti onnistui. Uudet, päivitetyt ja sukupuuhun luodut koirat
                on tallennettu.
              </p>
              <Button onClick={() => replace(null)}>Tuo toinen tiedosto</Button>
            </>
          ) : (
            <>
              <Input
                type="file"
                accept=".xlsx"
                onChange={(event) => replace(event.target.files?.[0] ?? null)}
                disabled={busy}
              />
              {file ? (
                <p className="text-sm">
                  {file.name} ({Math.ceil(file.size / 1024)} KiB)
                </p>
              ) : null}
              {step === "upload" ? (
                <Button disabled={!file || busy} onClick={() => void review()}>
                  Tarkista tiedosto
                </Button>
              ) : null}
              {preview && step === "review" ? (
                <div className="space-y-3">
                  <p>
                    {preview.rowCount} riviä, {preview.createCount} uutta,{" "}
                    {preview.updateCount} päivitystä, {preview.unchangedCount}{" "}
                    muuttumatonta, {preview.referenceCount} vain sukupuuhun
                    luotavaa.
                  </p>
                  <p>
                    {preview.blockedCount} estävää ongelmaa,{" "}
                    {
                      preview.issues.filter(
                        (issue) => issue.severity === "WARNING",
                      ).length
                    }{" "}
                    varoitusta.
                  </p>
                  <div className="max-h-72 overflow-auto text-sm">
                    {preview.rows.map((row) => (
                      <div key={row.sourceRowNumber} className="border-b py-1">
                        Rivi {row.sourceRowNumber}: {row.registrationNo ?? "-"}{" "}
                        {row.status}{" "}
                        {row.issues.map((issue) => issue.code).join(", ")}
                      </div>
                    ))}
                  </div>
                  <Button
                    disabled={!preview.applyAllowed}
                    onClick={() => setStep("confirm")}
                  >
                    Jatka vahvistukseen
                  </Button>
                </div>
              ) : null}
              {preview && step === "confirm" ? (
                <div className="space-y-3">
                  <p>
                    Vahvista tiedosto {file?.name}. Tyhjät lähdearvot eivät
                    poista tallennettuja tietoja.
                  </p>
                  <Button variant="outline" onClick={() => setStep("review")}>
                    Palaa tarkistukseen
                  </Button>
                  <Button disabled={busy} onClick={() => void apply()}>
                    Tuo rekisteritiedot
                  </Button>
                </div>
              ) : null}
              {error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
