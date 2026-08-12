export default function Home(){return <main className="container">
  <nav className="nav"><div className="brand">CLEARRAIL</div><div className="badge">MVP • NO LIVE FUNDS</div></nav>
  <section className="hero">
    <div className="badge">PAY FROM BANK • WITHOUT HOLDING CUSTOMER MONEY</div>
    <h1>Replace the check.<br/>Keep the bank.</h1>
    <p className="lead">ClearRail is a secure payment-request layer for high-value business invoices. Businesses send a verified request, customers approve a bank payment through a regulated provider, and both sides receive an auditable record.</p>
    <a className="cta" href="/dashboard">Open demo dashboard</a>
  </section>
  <div className="grid">
    <div className="card"><h2>For customers</h2><p>No checkbook. No exposing bank credentials to the merchant. Clear recipient, amount, invoice and consent before payment.</p></div>
    <div className="card"><h2>For businesses</h2><p>Lower-cost bank payments, invoice matching, immutable audit events and a clean alternative to mailed checks.</p></div>
    <div className="card"><h2>For banks</h2><p>Potential fee sharing and payment volume while the bank or regulated processor remains responsible for money movement.</p></div>
  </div>
  <p className="warn">Security boundary: this prototype does not collect routing/account numbers, store bank login credentials, hold funds, originate ACH entries, or claim regulatory status.</p>
</main>}
