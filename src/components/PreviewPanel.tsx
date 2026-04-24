import { useEffect, useRef } from "react";
import type { RenderPlan } from "../export/renderPlan";
import { renderPlanToCanvas } from "../export/canvasRenderer";

type PreviewPanelProps = {
  plan: RenderPlan;
};

export function PreviewPanel({ plan }: PreviewPanelProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let disposed = false;

    renderPlanToCanvas(plan, 1).then((canvas) => {
      if (disposed || !hostRef.current) {
        return;
      }

      hostRef.current.innerHTML = "";
      hostRef.current.appendChild(canvas);
    });

    return () => {
      disposed = true;
    };
  }, [plan]);

  return (
    <section className="panel">
      <h2>正式文件预览</h2>
      <div ref={hostRef} className="preview-host" />
    </section>
  );
}
