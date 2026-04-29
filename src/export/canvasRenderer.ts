import type { RenderPlan } from "./renderPlan";

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

export async function renderPlanToCanvas(
  plan: RenderPlan,
  scale = 2
): Promise<HTMLCanvasElement> {
  const logo = await loadImage(plan.logoSrc);
  const canvas = document.createElement("canvas");
  canvas.width = plan.width * scale;
  canvas.height = plan.height * scale;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context unavailable");
  }

  ctx.scale(scale, scale);
  drawQuotationSheet(ctx, plan.width, plan.height, logo);
  ctx.fillStyle = "#111827";

  for (const entry of plan.text) {
    ctx.font = `${entry.fontSize}px "Microsoft YaHei", sans-serif`;
    ctx.textAlign = entry.align ?? "left";
    ctx.fillText(entry.value, entry.x, entry.y);
  }

  return canvas;
}

function drawQuotationSheet(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  logo: HTMLImageElement
) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 1.2;
  ctx.font = '16px "Microsoft YaHei", sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const x = [60, 103, 222, 355, 432, 508, 586, 657, 728, 800, 871, 947];
  const y = [90, 190, 235, 283, 331, 379, 427, 475, 523, 547, 575, 650];

  drawRect(ctx, x[0], y[0], x[11] - x[0], y[11] - y[0]);
  ctx.drawImage(logo, 74, 95, 70, 95);

  drawLine(ctx, x[0], y[1], x[11], y[1]);
  for (let i = 2; i < y.length; i += 1) {
    drawLine(ctx, x[0], y[i], x[11], y[i]);
  }

  for (const columnX of x) {
    drawLine(ctx, columnX, y[1], columnX, y[9]);
  }
  drawLine(ctx, x[3], y[9], x[3], y[10]);
  drawLine(ctx, x[10], y[9], x[10], y[10]);
  drawLine(ctx, x[2], y[10], x[2], y[11]);

  const headers = [
    "\u5e8f\u53f7",
    "\u89c4\u683c",
    "\u5907\u6ce8",
    "\u767d\u80da\u5355\u4ef7",
    "\u767d\u80da\u6570\u91cf",
    "\u767d\u80da\u91d1\u989d",
    "\u7b80\u5355\u82b1\u7eb9\n\u5355\u4ef7",
    "\u7b80\u5355\u82b1\u7eb9\n\u6570\u91cf",
    "\u590d\u6742\u82b1\u7eb9\n\u5355\u4ef7",
    "\u590d\u6742\u82b1\u7eb9\n\u6570\u91cf",
    "\u82b1\u8272\u91d1\u989d"
  ];

  headers.forEach((label, index) => {
    drawMultilineText(ctx, label, (x[index] + x[index + 1]) / 2, 213, 16, 20);
  });

  const specs = [
    "<20\u516c\u5206",
    "28>\u5c3a\u5bf8>20\u516c\u5206",
    "35>\u5c3a\u5bf8>28\u516c\u5206",
    "45>\u5c3a\u5bf8>35\u516c\u5206",
    "60>\u5c3a\u5bf8>45\u516c\u5206",
    "\u7802\u9505/\u6c64\u9505"
  ];
  const rowCenters = [265, 313, 361, 409, 457, 505];

  rowCenters.forEach((rowY, index) => {
    drawCenteredText(ctx, String(index + 1), (x[0] + x[1]) / 2, rowY, 13);
    drawCenteredText(ctx, specs[index], (x[1] + x[2]) / 2, rowY, 13);
  });

  drawCenteredText(ctx, "\u89c6\u4fee\u590d\u96be\u5ea6\u5355\u8bae", (x[2] + x[3]) / 2, 505, 13);
  drawCenteredText(ctx, "\u5408\u8ba1", (x[0] + x[2]) / 2, 535, 18, true);
  drawCenteredText(ctx, "\u603b\u8ba1\u91d1\u989d\uff08\u672a\u7a0e\uff09", (x[3] + x[10]) / 2, 562, 18, true);
  drawCenteredText(ctx, "\u5907\u6ce8", (x[0] + x[2]) / 2, 615, 22, true);

  ctx.textAlign = "left";
  ctx.font = '13px "Microsoft YaHei", sans-serif';
  ctx.fillStyle = "#111827";
  drawMultilineText(
    ctx,
    "1\u3001\u91d1\u989d\u5747\u4e3a\u672a\u7a0e\u91d1\u989d\uff0c\u5982\u9700\u5f00\u7968\uff0c\u4e13\u7968+3%\uff0c\u666e\u7968+1%\uff1b\n2\u3001\u5229\u8d28\u4e3a\u98df\u54c1\u7ea7\u63a5\u89e6\u6750\u6599\uff0c\u53ef\u63d0\u4f9b\u68c0\u6d4b\u62a5\u544a\uff1b\n3\u3001\u8d28\u4fdd\u671f3\u4e2a\u6708\uff1b",
    225,
    598,
    13,
    22,
    "left"
  );
  drawCenteredText(ctx, "\u7b7e\u5b57\u786e\u8ba4\uff1a", 735, 672, 13);
}

function drawRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) {
  ctx.strokeRect(x, y, width, height);
}

function drawLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fontSize: number,
  bold = false
) {
  ctx.fillStyle = "#111827";
  ctx.font = `${bold ? "700 " : ""}${fontSize}px "Microsoft YaHei", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
}

function drawMultilineText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fontSize: number,
  lineHeight: number,
  align: CanvasTextAlign = "center"
) {
  ctx.fillStyle = "#111827";
  ctx.font = `${fontSize}px "Microsoft YaHei", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  text.split("\n").forEach((line, index, lines) => {
    const offset = (index - (lines.length - 1) / 2) * lineHeight;
    ctx.fillText(line, x, y + offset);
  });
}
