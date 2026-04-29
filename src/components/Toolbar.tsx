type ToolbarProps = {
  onReset: () => void;
  onExportPdf: () => void;
  onExportPng: () => void;
  exportDisabled: boolean;
};

export function Toolbar({
  onReset,
  onExportPdf,
  onExportPng,
  exportDisabled
}: ToolbarProps) {
  return (
    <section className="toolbar">
      <button type="button" onClick={onReset}>
        恢复默认
      </button>
      <button type="button" onClick={onExportPdf} disabled={exportDisabled}>
        导出 PDF
      </button>
      <button type="button" onClick={onExportPng} disabled={exportDisabled}>
        导出图片
      </button>
    </section>
  );
}
