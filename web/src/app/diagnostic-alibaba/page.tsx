"use client";

import { useState } from "react";

type Result = { ok: boolean; status: string; code?: string | null; detailCode?: string | null };
const labels: Record<string, string> = {
  accepted: "Connexion acceptée : Alibaba a répondu avec succès.",
  api_rejected: "Alibaba a répondu, mais a refusé la requête. L'autorisation ou les paramètres doivent être vérifiés.",
  authorization_missing: "Aucun jeton Alibaba enregistré.",
  invalid_response: "Réponse Alibaba inattendue.",
  request_failed: "La requête n'a pas abouti. Vérifier le jeton, la signature et les journaux serveur.",
  request_denied: "Test refusé par la protection de sécurité.",
  refresh_unavailable: "Alibaba refuse le jeton actuel et aucun jeton de renouvellement n’est enregistré.",
  refresh_failed: "Alibaba refuse le jeton actuel et le renouvellement automatique a échoué.",
};
export default function AlibabaDiagnosticPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  async function test() {
    setLoading(true); setResult(null);
    try {
      const init = await fetch("/api/alibaba/connection-test", { cache: "no-store", credentials: "same-origin" });
      if (!init.ok) throw new Error("unavailable");
      const { csrf } = await init.json() as { csrf: string };
      const response = await fetch("/api/alibaba/connection-test", {
        method: "POST", credentials: "same-origin", cache: "no-store",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
        body: "{}",
      });
      const data = await response.json() as Result;
      setResult(data);
    } catch { setResult({ ok: false, status: "request_failed" }); }
    finally { setLoading(false); }
  }
  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Diagnostic Alibaba — version de test</h1>
      <p className="mt-5">Ce test consulte uniquement l'API Alibaba. Il ne publie aucun produit et ne passe aucune commande.</p>
      <button type="button" disabled={loading} onClick={test}
        className="mt-8 rounded-lg bg-black px-5 py-3 text-white disabled:opacity-50">
        {loading ? "Test en cours…" : "Tester la connexion Alibaba"}
      </button>
      {result && <section role="status" className="mt-8 rounded-lg border p-5">
        <p className="font-semibold">{labels[result.status] || "Résultat inconnu."}</p>
        {result.code && <p className="mt-2 text-sm">Code API : {result.code}</p>}
        {result.detailCode && <p className="mt-2 text-sm">Code détail : {result.detailCode}</p>}
      </section>}
      <p className="mt-8 text-sm">Aucun jeton, mot de passe ou clé secrète n'est affiché ici.</p>
    </main>
  );
}
