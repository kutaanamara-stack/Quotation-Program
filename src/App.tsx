const title = "\u9910\u5177\u4fee\u590d\u62a5\u4ef7\u5de5\u5177";
const subtitle = "\u5185\u90e8\u586b\u5199\u62a5\u4ef7\u5e76\u5bfc\u51fa\u6b63\u5f0f\u56fe\u7247\u6216 PDF\u3002";
const exportActionsLabel = "\u5bfc\u51fa\u64cd\u4f5c";
const exportPdfLabel = "\u5bfc\u51fa PDF";
const exportImageLabel = "\u5bfc\u51fa\u56fe\u7247";

function App() {
  return (
    <main className="app-shell">
      <header className="hero">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </header>

      <section className="toolbar" aria-label={exportActionsLabel}>
        <button type="button">{exportPdfLabel}</button>
        <button type="button">{exportImageLabel}</button>
      </section>
    </main>
  );
}

export default App;
