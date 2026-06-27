import { useMemo, useState } from 'react';
import './App.css';
import { connectWallet } from './services/wallet';
import {
  addCar,
  getCar,
  getContractMethods,
  getLease,
  getRuntimeConfig,
  getStats,
  leaseCar,
  markAvailable,
  shortenAddress,
  type SubmittedTransaction,
} from './services/contract';

function App() {
  const runtime = useMemo(() => getRuntimeConfig(), []);
  const methods = useMemo(() => getContractMethods(), []);

  const [walletAddress, setWalletAddress] = useState('');
  const [vin, setVin] = useState('VIN-STELLAR-001');
  const [model, setModel] = useState('Tesla Model 3');
  const [dailyRate, setDailyRate] = useState('100');

  const [carId, setCarId] = useState(1);
  const [leaseId, setLeaseId] = useState(1);
  const [startLedger, setStartLedger] = useState(10);
  const [endLedger, setEndLedger] = useState(13);
  const [payment, setPayment] = useState('300');

  const [statusMessage, setStatusMessage] = useState('Ready to connect Freighter on Stellar testnet.');
  const [lastTransaction, setLastTransaction] = useState<SubmittedTransaction | null>(null);
  const [queryResult, setQueryResult] = useState('Read results will appear here.');

  const requireWallet = async () => {
    if (walletAddress) {
      return walletAddress;
    }

    const connected = await connectWallet();
    setWalletAddress(connected);
    return connected;
  };

  const handleConnectWallet = async () => {
    try {
      setStatusMessage('Connecting Freighter wallet...');
      const connected = await connectWallet();
      setWalletAddress(connected);
      setStatusMessage('Wallet connected successfully.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Wallet connection failed.');
    }
  };

  const handleAddCar = async () => {
    try {
      const owner = await requireWallet();
      setStatusMessage('Preparing add_car transaction. Please sign in Freighter.');

      const tx = await addCar({
        owner,
        vin,
        model,
        dailyRate,
      });

      setLastTransaction(tx);
      setStatusMessage('add_car transaction submitted to Stellar testnet.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'add_car transaction failed.');
    }
  };

  const handleLeaseCar = async () => {
    try {
      const lessee = await requireWallet();
      setStatusMessage('Preparing lease_car transaction. Please sign in Freighter.');

      const tx = await leaseCar({
        lessee,
        carId,
        startLedger,
        endLedger,
        payment,
      });

      setLastTransaction(tx);
      setStatusMessage('lease_car transaction submitted to Stellar testnet.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'lease_car transaction failed.');
    }
  };

  const handleMarkAvailable = async () => {
    try {
      const owner = await requireWallet();
      setStatusMessage('Preparing mark_available transaction. Please sign in Freighter.');

      const tx = await markAvailable({
        owner,
        carId,
      });

      setLastTransaction(tx);
      setStatusMessage('mark_available transaction submitted to Stellar testnet.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'mark_available transaction failed.');
    }
  };

  const handleGetCar = async () => {
    try {
      const source = await requireWallet();
      setStatusMessage('Reading get_car through Soroban RPC simulation...');

      const result = await getCar(source, carId);
      setQueryResult(JSON.stringify(result, null, 2));
      setStatusMessage('get_car query completed.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'get_car query failed.');
    }
  };

  const handleGetLease = async () => {
    try {
      const source = await requireWallet();
      setStatusMessage('Reading get_lease through Soroban RPC simulation...');

      const result = await getLease(source, leaseId);
      setQueryResult(JSON.stringify(result, null, 2));
      setStatusMessage('get_lease query completed.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'get_lease query failed.');
    }
  };

  const handleGetStats = async () => {
    try {
      const source = await requireWallet();
      setStatusMessage('Reading stats through Soroban RPC simulation...');

      const result = await getStats(source);
      setQueryResult(JSON.stringify(result, null, 2));
      setStatusMessage('stats query completed.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'stats query failed.');
    }
  };

  return (
    <main className="app-shell">
      <section className="hero">
        <nav className="topbar">
          <div className="brand">
            <div className="brand-mark">CL</div>
            <div>
              <p>Stellar Level 3 dApp</p>
              <h1>car_lease</h1>
            </div>
          </div>

          <button className="wallet-button" onClick={handleConnectWallet}>
            {walletAddress ? shortenAddress(walletAddress) : 'Connect Freighter'}
          </button>
        </nav>

        <div className="hero-grid">
          <div>
            <p className="eyebrow">Real Soroban contract integration</p>
            <h2>Lease cars on Stellar testnet with wallet-signed contract calls.</h2>
            <p className="hero-copy">
              This Level 3 fix adds real frontend integration with Freighter, Soroban RPC,
              TransactionBuilder, prepareTransaction, sendTransaction, nativeToScVal, and
              scValToNative. The UI triggers the same functions defined in the smart contract.
            </p>

            <div className="hero-actions">
              <a href={runtime.contractExplorerUrl} target="_blank" rel="noreferrer">
                View contract
              </a>
              <button onClick={handleGetStats}>Read stats</button>
            </div>
          </div>

          <article className="deployment-card">
            <p className="card-label">Deployment</p>
            <h3>{runtime.hasDeployedContract ? 'Live on testnet' : 'Not deployed'}</h3>

            <div>
              <span>Contract</span>
              <strong>{shortenAddress(runtime.contractId)}</strong>
            </div>

            <div>
              <span>Network</span>
              <strong>{runtime.network}</strong>
            </div>

            <div>
              <span>RPC</span>
              <strong>{runtime.rpcUrl.replace('https://', '')}</strong>
            </div>
          </article>
        </div>
      </section>

      <section className="metrics-grid">
        <article>
          <p>Contract methods</p>
          <strong>{methods.length}</strong>
          <span>Frontend method matching</span>
        </article>

        <article>
          <p>Write calls</p>
          <strong>3</strong>
          <span>add, lease, mark available</span>
        </article>

        <article>
          <p>Read calls</p>
          <strong>3</strong>
          <span>get car, get lease, stats</span>
        </article>

        <article>
          <p>Wallet</p>
          <strong>{walletAddress ? 'Connected' : 'Ready'}</strong>
          <span>Freighter signTransaction</span>
        </article>
      </section>

      <section className="workspace-grid">
        <article className="panel">
          <div className="section-heading">
            <p className="eyebrow">Write transaction</p>
            <h2>Add car</h2>
          </div>

          <label>
            VIN
            <input value={vin} onChange={(event) => setVin(event.target.value)} />
          </label>

          <label>
            Model
            <input value={model} onChange={(event) => setModel(event.target.value)} />
          </label>

          <label>
            Daily rate
            <input value={dailyRate} onChange={(event) => setDailyRate(event.target.value)} />
          </label>

          <button className="primary-action" onClick={handleAddCar}>
            Sign add_car
          </button>
        </article>

        <article className="panel">
          <div className="section-heading">
            <p className="eyebrow">Write transaction</p>
            <h2>Lease car</h2>
          </div>

          <label>
            Car ID
            <input
              type="number"
              min="1"
              value={carId}
              onChange={(event) => setCarId(Number(event.target.value || 1))}
            />
          </label>

          <label>
            Start ledger
            <input
              type="number"
              min="1"
              value={startLedger}
              onChange={(event) => setStartLedger(Number(event.target.value || 1))}
            />
          </label>

          <label>
            End ledger
            <input
              type="number"
              min="1"
              value={endLedger}
              onChange={(event) => setEndLedger(Number(event.target.value || 1))}
            />
          </label>

          <label>
            Payment
            <input value={payment} onChange={(event) => setPayment(event.target.value)} />
          </label>

          <div className="button-grid">
            <button onClick={handleLeaseCar}>Sign lease_car</button>
            <button onClick={handleMarkAvailable}>Sign mark_available</button>
          </div>
        </article>
      </section>

      <section className="workspace-grid">
        <article className="panel">
          <div className="section-heading">
            <p className="eyebrow">Read contract</p>
            <h2>Query car and lease</h2>
          </div>

          <label>
            Lease ID
            <input
              type="number"
              min="1"
              value={leaseId}
              onChange={(event) => setLeaseId(Number(event.target.value || 1))}
            />
          </label>

          <div className="button-grid">
            <button onClick={handleGetCar}>Read get_car</button>
            <button onClick={handleGetLease}>Read get_lease</button>
            <button onClick={handleGetStats}>Read stats</button>
          </div>

          <pre>{queryResult}</pre>
        </article>

        <article className="panel">
          <div className="section-heading">
            <p className="eyebrow">Transaction monitor</p>
            <h2>Status</h2>
          </div>

          <div className="status-box">
            <p>{statusMessage}</p>

            {lastTransaction ? (
              <a href={lastTransaction.explorerUrl} target="_blank" rel="noreferrer">
                View transaction: {shortenAddress(lastTransaction.hash, 10, 10)}
              </a>
            ) : (
              <span>No transaction submitted yet.</span>
            )}
          </div>

          <div className="method-list">
            {methods.map((method) => (
              <span key={method}>{method}</span>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

export default App;