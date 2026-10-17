import QRCode from "qrcode";

export async function generateQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 400,
    color: {
      dark: "#101828",
      light: "#FFFFFF",
    },
  });
}

export async function generateQrSvgString(text: string): Promise<string> {
  return QRCode.toString(text, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 2,
    color: {
      dark: "#101828",
      light: "#FFFFFF",
    },
  });
}

export function getBusinessJoinUrl(slug: string, baseUrl?: string): string {
  const base = baseUrl || process.env.APP_BASE_URL || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/b/${slug}`;
}
