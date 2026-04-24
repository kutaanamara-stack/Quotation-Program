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
  const [template, logo] = await Promise.all([
    loadImage(plan.templateSrc),
    loadImage(plan.logoSrc)
  ]);
  const canvas = document.createElement("canvas");
  canvas.width = plan.width * scale;
  canvas.height = plan.height * scale;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context unavailable");
  }

  ctx.scale(scale, scale);
  ctx.drawImage(template, 0, 0, plan.width, plan.height);
  ctx.drawImage(logo, 74, 95, 70, 95);
  ctx.fillStyle = "#111827";

  for (const entry of plan.text) {
    ctx.font = `${entry.fontSize}px "Microsoft YaHei", sans-serif`;
    ctx.textAlign = entry.align ?? "left";
    ctx.fillText(entry.value, entry.x, entry.y);
  }

  return canvas;
}
