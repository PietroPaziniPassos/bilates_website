import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// O iOS não usa favicon SVG na tela inicial; o fundo é escuro porque a câmera é amarela.
export default async function AppleIcon() {
  const svg = await readFile(join(process.cwd(), "app/icon.svg"));
  const src = `data:image/svg+xml;base64,${svg.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#171610" }}>
        <img src={src} width={124} height={124} alt="" />
      </div>
    ),
    size,
  );
}
