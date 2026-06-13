export default function Loading() {
  return (
    <main className="live-loading-screen" aria-busy="true" aria-live="polite">
      <div className="live-loading-card">
        <span />
        <strong>Carregando</strong>
      </div>
    </main>
  );
}
