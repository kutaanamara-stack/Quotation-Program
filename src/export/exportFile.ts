import { PDFDocument } from "pdf-lib";
import { buildExportFilename } from "../domain/validation";
import type { QuoteDocument } from "../types";
import { renderPlanToCanvas } from "./canvasRenderer";
import { buildRenderPlan } from "./renderPlan";

async function canvasToBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to convert canvas to blob"));
        return;
      }

      resolve(blob);
    }, type);
  });
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  showSaveFallback(url, fileName, blob);
}

export async function exportQuoteAsPng(quote: QuoteDocument) {
  const canvas = await renderPlanToCanvas(buildRenderPlan(quote), 2);
  const blob = await canvasToBlob(canvas, "image/png");
  downloadBlob(blob, buildExportFilename(quote.companyName, quote.quoteDate, "png"));
}

export async function exportQuoteAsPdf(quote: QuoteDocument) {
  const canvas = await renderPlanToCanvas(buildRenderPlan(quote), 2);
  const pngBytes = await (await canvasToBlob(canvas, "image/png")).arrayBuffer();
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([canvas.width, canvas.height]);
  const image = await pdf.embedPng(pngBytes);

  page.drawImage(image, {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height
  });

  const bytes = await pdf.save();
  downloadBlob(
    new Blob([new Uint8Array(bytes)], { type: "application/pdf" }),
    buildExportFilename(quote.companyName, quote.quoteDate, "pdf")
  );
}

function showSaveFallback(url: string, fileName: string, blob: Blob) {
  const isPng = blob.type.includes("png");
  const previousPanel = document.querySelector("[data-export-save-panel]");
  previousPanel?.remove();

  const panel = document.createElement("section");
  panel.setAttribute("data-export-save-panel", "true");
  panel.style.cssText = [
    "position:fixed",
    "inset:16px",
    "z-index:9999",
    "overflow:auto",
    "padding:16px",
    "border:1px solid #d9cbb6",
    "border-radius:18px",
    "background:#fffdf8",
    "box-shadow:0 20px 60px rgba(15,23,42,.28)",
    "font-family:Microsoft YaHei,Noto Sans SC,sans-serif",
    "color:#1f2937"
  ].join(";");

  const title = document.createElement("h2");
  title.textContent = "\u6587\u4ef6\u5df2\u751f\u6210";
  title.style.margin = "0 0 10px";

  const hint = document.createElement("p");
  hint.textContent = isPng
    ? "\u5982\u679c\u624b\u673a\u6ca1\u6709\u81ea\u52a8\u4fdd\u5b58\uff0c\u8bf7\u957f\u6309\u4e0b\u65b9\u56fe\u7247\uff0c\u9009\u62e9\u4fdd\u5b58\u5230\u76f8\u518c\u3002"
    : "\u5982\u679c\u624b\u673a\u6ca1\u6709\u81ea\u52a8\u4fdd\u5b58\uff0c\u8bf7\u70b9\u51fb\u201c\u5206\u4eab/\u4fdd\u5b58\u5230\u624b\u673a\u201d\uff0c\u6216\u6253\u5f00 PDF \u540e\u7528\u6d4f\u89c8\u5668\u4fdd\u5b58\u3002";

  const fileLabel = document.createElement("p");
  fileLabel.textContent = fileName;
  fileLabel.style.cssText = "font-weight:700;overflow-wrap:anywhere";

  const actions = document.createElement("div");
  actions.style.cssText = "display:flex;gap:10px;flex-wrap:wrap;margin:12px 0";

  const canNativeShare = canShareFile(blob, fileName);
  if (canNativeShare) {
    const shareButton = document.createElement("button");
    shareButton.type = "button";
    shareButton.textContent = "\u5206\u4eab/\u4fdd\u5b58\u5230\u624b\u673a";
    shareButton.style.cssText = buttonStyle("#166534");
    shareButton.addEventListener("click", async () => {
      try {
        const file = new File([blob], fileName, { type: blob.type });
        await navigator.share({
          files: [file],
          title: fileName
        });
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          window.alert("\u672c\u673a\u6d4f\u89c8\u5668\u4e0d\u5141\u8bb8\u76f4\u63a5\u5206\u4eab\uff0c\u8bf7\u4f7f\u7528\u4e0b\u65b9\u6253\u5f00/\u957f\u6309\u4fdd\u5b58\u65b9\u5f0f\u3002");
        }
      }
    });
    actions.append(shareButton);
  }

  const openLink = document.createElement("a");
  openLink.href = url;
  openLink.target = "_blank";
  openLink.rel = "noreferrer";
  openLink.download = fileName;
  openLink.textContent = isPng
    ? "\u6253\u5f00\u56fe\u7247"
    : "\u6253\u5f00 PDF";
  openLink.style.cssText = buttonStyle();

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.textContent = "\u5173\u95ed";
  closeButton.style.cssText = buttonStyle("#6b7280");
  closeButton.addEventListener("click", () => {
    panel.remove();
    URL.revokeObjectURL(url);
  });

  actions.append(openLink, closeButton);
  panel.append(title, hint, fileLabel, actions);

  if (isPng) {
    const image = document.createElement("img");
    image.src = url;
    image.alt = fileName;
    image.style.cssText = "width:100%;height:auto;border:1px solid #e5e7eb;border-radius:12px";
    panel.append(image);
  }

  document.body.append(panel);
}

function canShareFile(blob: Blob, fileName: string) {
  if (!("share" in navigator) || !("canShare" in navigator) || !("File" in window)) {
    return false;
  }

  try {
    const file = new File([blob], fileName, { type: blob.type });
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

function buttonStyle(background = "#b45309") {
  return [
    "display:inline-grid",
    "min-height:44px",
    "place-items:center",
    "padding:0 16px",
    "border:0",
    "border-radius:999px",
    `background:${background}`,
    "color:#fff",
    "font:inherit",
    "font-weight:700",
    "text-decoration:none"
  ].join(";");
}
