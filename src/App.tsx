function App() {
  return (
    <main className="app-shell">
      <header className="hero">
        <h1>餐具修复报价工具</h1>
        <p>内部填写报价并导出正式图片或 PDF。</p>
      </header>

      <section className="toolbar" aria-label="导出操作">
        <button type="button">导出 PDF</button>
        <button type="button">导出图片</button>
      </section>
    </main>
  );
}

export default App;
