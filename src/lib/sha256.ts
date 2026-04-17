// SHA-256 helper using Web Crypto (Claim 4: Forensic Provenance)
export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export interface ProvenanceSeal {
  hash: string;
  utc: string;
  gps?: { lat: number; lng: number } | null;
  bytes: number;
  filename: string;
}

export async function buildProvenanceSeal(file: File, gps?: { lat: number; lng: number } | null): Promise<ProvenanceSeal> {
  const utc = new Date().toISOString();
  const payload = `${file.name}|${file.size}|${utc}|${gps ? `${gps.lat},${gps.lng}` : 'NO_GPS'}`;
  const hash = await sha256Hex(payload);
  return { hash, utc, gps: gps ?? null, bytes: file.size, filename: file.name };
}
