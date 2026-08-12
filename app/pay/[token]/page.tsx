export default async function PaymentRequest({params}:{params:Promise<{token:string}>}){
  const {token}=await params;
  const demo={merchant:'Lowell Heating & Air LLC',amount:'$8,450.00',invoice:'INV-1007',status:'Ready for secure bank authorization'};
  return <main className="container">
    <nav className="nav"><a className="brand" href="/">CLEARRAIL</a><div className="badge">PAYMENT DEMO • NO LIVE FUNDS</div></nav>
    <section className="hero" style={{paddingTop:40,maxWidth:720}}>
      <div className="badge">VERIFIED PAYMENT REQUEST</div>
      <h1 style={{fontSize:56}}>Review before you pay.</h1>
      <p className="lead">This screen demonstrates the confirmation step ClearRail would show before handing bank authentication to a regulated payment provider.</p>
    </section>
    <div className="card" style={{maxWidth:720}}>
      <div className="kv"><b>Recipient</b><span>{demo.merchant}</span></div>
      <div className="kv"><b>Amount</b><span>{demo.amount}</span></div>
      <div className="kv"><b>Invoice</b><span>{demo.invoice}</span></div>
      <div className="kv"><b>Status</b><span>{demo.status}</span></div>
      <div className="kv"><b>Request token</b><span>{token}</span></div>
      <button className="cta" type="button" disabled>Pay from bank — sandbox coming next</button>
    </div>
    <p className="warn" style={{maxWidth:720}}>Never enter bank credentials into this demo. Production bank authentication will be hosted or tokenized by a regulated provider.</p>
  </main>;
}
