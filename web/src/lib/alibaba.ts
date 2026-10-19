import crypto from "crypto";

const ENDPOINT = "https://eco.taobao.com/router/rest";

export function alibabaStatus() {
  return {
    configured: Boolean(process.env.ALIBABA_APP_KEY && process.env.ALIBABA_APP_SECRET),
    authorized: Boolean(process.env.ALIBABA_SESSION),
  };
}

function timestamp() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(new Date()).replace("T", " ");
}

function sign(params: Record<string, string>, secret: string) {
  const base = Object.keys(params)
    .filter((key) => key !== "sign")
    .sort()
    .map((key) => key + params[key])
    .join("");
  return crypto.createHmac("md5", secret).update(base, "utf8").digest("hex").toUpperCase();
}

export async function alibabaCall(method: string, fields: Record<string, string>) {
  const appKey = process.env.ALIBABA_APP_KEY ?? "";
  const secret = process.env.ALIBABA_APP_SECRET ?? "";
  const session = process.env.ALIBABA_SESSION ?? "";
  if (!appKey || !secret) {
    throw new Error("Renseignez ALIBABA_APP_KEY et ALIBABA_APP_SECRET.");
  }
  const params: Record<string, string> = {
    method,
    app_key: appKey,
    sign_method: "hmac",
    timestamp: timestamp(),
    format: "json",
    v: "2.0",
    ...fields,
    ...(session ? { session } : {}),
  };
  params.sign = sign(params, secret);
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
    body: new URLSearchParams(params),
  });
  const data = (await response.json()) as {
    error_response?: { msg?: string; sub_msg?: string; code?: number };
  };
  if (data.error_response) {
    throw new Error(data.error_response.sub_msg || data.error_response.msg || "Alibaba a refusé l'appel.");
  }
  return data;
}

export async function getAlibabaProduct(productId: string) {
  const id = productId.trim();
  if (!id) throw new Error("Indiquez l'identifiant produit Alibaba.");
  return alibabaCall("alibaba.icbu.product.get", { language: "ENGLISH", product_id: id });
}
