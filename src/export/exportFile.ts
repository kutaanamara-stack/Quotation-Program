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
  URL.revokeObjectURL(url);
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
