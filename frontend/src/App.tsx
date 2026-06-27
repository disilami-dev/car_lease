import { useMemo, useState } from "react";
import * as StellarSdk from "@stellar/stellar-sdk";
import {
  getAddress,
  isConnected,
  requestAccess,
  setAllowed,
  signTransaction,
} from "@stellar/freighter-api";

type TxStatus = "idle" | "pending" | "success" | "failed";

type FreighterConnectionResponse =
  | boolean
  | {
      isConnected?: boolean;
      error?: string;
    };

type FreighterAddressResponse =
  | string
  | {
      address?: string;
      error?: string;
    };

type FreighterSignResponse =
  | string
  | {
      signedTxXdr?: string;
      signerAddress?: string;
      error?: string;
    };

type VehiclePlan = {
  name: string;
  vehicle: string;
  term: string;
  monthlyRent: number;
  mileageCap: number;
  deposit: number;
  description: string;
};

const HORIZON_URL = "https://horizon-testnet.stellar.org";
const EXPLORER_TX_URL = "https://stellar.expert/explorer/testnet/tx/";

const server = new StellarSdk.Horizon.Server(HORIZON_URL);

const vehiclePlans: VehiclePlan[] = [
  {
    name: "City Compact",
    vehicle: "Toyota Yaris / Honda Jazz",
    term: "3-day city lease",
    monthlyRent: 120,
    mileageCap: 250,
    deposit: 1,
    description:
      "Best for short-stay travellers who need a simple city car for errands, airport pickup, or hotel-to-city trips.",
  },
  {
    name: "Road Trip SUV",
    vehicle: "Mazda CX-5 / Hyundai Tucson",
    term: "7-day road-trip lease",
    monthlyRent: 320,
    mileageCap: 700,
    deposit: 2,
    description:
      "Designed for road trips, tourism routes, and longer travel plans with a higher mileage cap.",
  },
  {
    name: "Premium EV",
    vehicle: "Tesla Model 3 / BYD Seal",
    term: "5-day electric lease",
    monthlyRent: 450,
    mileageCap: 500,
    deposit: 3,
    description:
      "A premium electric vehicle lease profile for travellers who prefer clean mobility and modern cars.",
  },
];

function shortAddress(address: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

function readConnectionStatus(result: FreighterConnectionResponse) {
  if (typeof result === "boolean") return result;
  return Boolean(result.isConnected);
}

function readAddress(result: FreighterAddressResponse) {
  if (typeof result === "string") return result;
  return result.address ?? "";
}

function readSignedXdr(result: FreighterSignResponse) {
  if (typeof result === "string") return result;
  return result.signedTxXdr ?? "";
}

function App() {
  const [publicKey, setPublicKey] = useState("");
  const [balance, setBalance] = useState("0.00");
  const [selectedPlan, setSelectedPlan] = useState(vehiclePlans[0].name);
  const [lessorAddress, setLessorAddress] = useState("");
  const [amount, setAmount] = useState(vehiclePlans[0].deposit.toString());
  const [memo, setMemo] = useState("car_lease");
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState("");
  const [message, setMessage] = useState(
    "Connect your Freighter wallet to start a testnet lease payment."
  );
  const [activity, setActivity] = useState<string[]>([
    "car_lease loaded on Stellar Testnet.",
  ]);

  const activePlan = useMemo(() => {
    return (
      vehiclePlans.find((plan) => plan.name === selectedPlan) ?? vehiclePlans[0]
    );
  }, [selectedPlan]);

  const txLink = txHash ? `${EXPLORER_TX_URL}${txHash}` : "";

  function addActivity(item: string) {
    setActivity((current) => [item, ...current].slice(0, 7));
  }

  function selectPlan(plan: VehiclePlan) {
    setSelectedPlan(plan.name);
    setAmount(plan.deposit.toString());
    setMemo(`lease_${plan.name}`.replace(/\s+/g, "_").slice(0, 28));
    addActivity(`Selected lease plan: ${plan.name}.`);
  }

  async function getWalletAddressWithFallback() {
    console.log("Connect button clicked.");

    try {
      const requestResult = (await requestAccess()) as FreighterAddressResponse;
      const requestedAddress = readAddress(requestResult);

      if (requestedAddress) {
        console.log("Address from requestAccess:", requestedAddress);
        return requestedAddress;
      }
    } catch (error) {
      console.warn("requestAccess failed, trying setAllowed + getAddress.", error);
    }

    await setAllowed();

    const addressResult = (await getAddress()) as FreighterAddressResponse;
    const walletAddress = readAddress(addressResult);

    if (walletAddress) {
      console.log("Address from getAddress:", walletAddress);
      return walletAddress;
    }

    return "";
  }

  async function connectWallet() {
    try {
      setTxHash("");
      setTxStatus("idle");
      setMessage("Opening Freighter connection request...");
      addActivity("Connect button clicked. Waiting for Freighter.");

      try {
        const connectedResult = (await isConnected()) as FreighterConnectionResponse;
        const hasFreighter = readConnectionStatus(connectedResult);

        if (!hasFreighter) {
          addActivity("Freighter extension may not be detected yet.");
        }
      } catch {
        addActivity("Freighter connection check skipped.");
      }

      const walletAddress = await getWalletAddressWithFallback();

      if (!walletAddress) {
        setTxStatus("failed");
        setMessage(
          "Could not read wallet address. Unlock Freighter, switch to Testnet, then click Connect again."
        );
        addActivity("Wallet connection failed: address unavailable.");
        return;
      }

      setPublicKey(walletAddress);
      setMessage("Wallet connected successfully.");
      addActivity(`Connected lessee wallet ${shortAddress(walletAddress)}.`);
      await fetchBalance(walletAddress);
    } catch (error) {
      console.error("Wallet connection failed:", error);
      setTxStatus("failed");
      setMessage(
        "Wallet connection failed or was rejected. Unlock Freighter, allow localhost, switch to Testnet, then try again."
      );
      addActivity("Wallet connection failed or was rejected.");
    }
  }

  function disconnectWallet() {
    setPublicKey("");
    setBalance("0.00");
    setTxStatus("idle");
    setTxHash("");
    setMessage("Wallet disconnected from the app UI.");
    addActivity("Wallet disconnected from the app UI.");
  }

  async function fetchBalance(address = publicKey) {
    try {
      if (!address) {
        setMessage("Connect wallet first before refreshing balance.");
        return;
      }

      const account = await server.loadAccount(address);
      const nativeBalance = account.balances.find(
        (item) => item.asset_type === "native"
      );

      const readableBalance = nativeBalance
        ? Number(nativeBalance.balance).toFixed(2)
        : "0.00";

      setBalance(readableBalance);
      setMessage("Balance refreshed from Stellar Testnet.");
      addActivity(`Balance refreshed: ${readableBalance} XLM.`);
    } catch (error) {
      console.error(error);
      setTxStatus("failed");
      setMessage(
        "Could not fetch balance. Make sure your Freighter account is funded on Stellar Testnet."
      );
      addActivity("Balance fetch failed.");
    }
  }

  async function sendLeasePayment() {
    try {
      setTxHash("");
      setTxStatus("pending");
      setMessage("Preparing lease initiation transaction...");

      if (!publicKey) {
        setTxStatus("failed");
        setMessage("Please connect your Freighter wallet first.");
        addActivity("Lease payment failed: wallet not connected.");
        return;
      }

      if (!lessorAddress || !lessorAddress.startsWith("G")) {
        setTxStatus("failed");
        setMessage("Please enter a valid Stellar Testnet lessor address starting with G.");
        addActivity("Lease payment failed: invalid lessor address.");
        return;
      }

      const numericAmount = Number(amount);

      if (!numericAmount || numericAmount <= 0) {
        setTxStatus("failed");
        setMessage("Please enter a valid XLM amount greater than 0.");
        addActivity("Lease payment failed: invalid amount.");
        return;
      }

      if (numericAmount > Number(balance)) {
        setTxStatus("failed");
        setMessage("Insufficient XLM balance for this testnet lease payment.");
        addActivity("Lease payment failed: insufficient balance.");
        return;
      }

      setMessage("Loading lessee account from Stellar Testnet...");
      const sourceAccount = await server.loadAccount(publicKey);

      const safeMemo = memo.trim()
        ? memo.trim().replace(/\s+/g, "_").slice(0, 28)
        : "car_lease";

      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: lessorAddress,
            asset: StellarSdk.Asset.native(),
            amount: numericAmount.toString(),
          })
        )
        .addMemo(StellarSdk.Memo.text(safeMemo))
        .setTimeout(180)
        .build();

      setMessage("Please approve the lease payment in Freighter...");

      const signedResult = (await signTransaction(transaction.toXDR(), {
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })) as FreighterSignResponse;

      const signedXdr = readSignedXdr(signedResult);

      if (!signedXdr) {
        setTxStatus("failed");
        setMessage("Freighter did not return a signed transaction.");
        addActivity("Lease payment failed: missing signed transaction XDR.");
        return;
      }

      const signedTransaction = StellarSdk.TransactionBuilder.fromXDR(
        signedXdr,
        StellarSdk.Networks.TESTNET
      );

      setMessage("Submitting lease payment to Stellar Testnet...");
      addActivity("Lease payment signed by Freighter.");

      const submittedTx = await server.submitTransaction(signedTransaction);

      setTxHash(submittedTx.hash);
      setTxStatus("success");
      setMessage(
        "Lease initiation payment sent successfully. Transaction hash is visible below."
      );
      addActivity(`Success: ${numericAmount} XLM sent for ${activePlan.name}.`);

      await fetchBalance(publicKey);
    } catch (error) {
      console.error(error);
      setTxStatus("failed");
      setMessage(
        "Transaction failed or was rejected. Check Freighter Testnet mode, balance, lessor address, and amount."
      );
      addActivity("Lease payment failed or was rejected.");
    }
  }

  return (
    <main className="app">
      <nav className="topbar">
        <div>
          <p className="eyebrow">Stellar Level 1 dApp</p>
          <h1>car_lease</h1>
        </div>

        <div className="wallet-actions">
          {publicKey ? (
            <>
              <button className="ghost-button" onClick={() => fetchBalance()}>
                Refresh Balance
              </button>
              <button className="danger-button" onClick={disconnectWallet}>
                Disconnect
              </button>
            </>
          ) : (
            <button className="primary-button" onClick={connectWallet}>
              Connect Freighter
            </button>
          )}
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Mobility leasing on Stellar Testnet</p>
          <h2>Start a vehicle lease with a signed XLM testnet payment.</h2>
          <p>
            This Level 1 version proves the required Stellar fundamentals:
            Freighter connection, XLM balance display, payment signing, and
            transaction feedback with a Stellar Expert link.
          </p>
        </div>

        <div className="hero-card">
          <span>Network</span>
          <strong>Stellar Testnet</strong>
          <small>No real XLM is used</small>
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <span>Selected Vehicle</span>
          <strong>{activePlan.name}</strong>
        </div>
        <div className="stat-card">
          <span>Lease Term</span>
          <strong>{activePlan.term}</strong>
        </div>
        <div className="stat-card">
          <span>Mileage Cap</span>
          <strong>{activePlan.mileageCap} km</strong>
        </div>
        <div className="stat-card">
          <span>Suggested Deposit</span>
          <strong>{activePlan.deposit} XLM</strong>
        </div>
      </section>

      <section className="grid">
        <div className="panel wallet-panel">
          <div className="panel-header">
            <p className="eyebrow">Lessee Wallet</p>
            <h3>Connected Account</h3>
          </div>

          {publicKey ? (
            <>
              <div className="address-box">{publicKey}</div>
              <div className="metric-row">
                <div>
                  <span>XLM Balance</span>
                  <strong>{balance}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>Connected</strong>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              Connect Freighter to show your lessee address and XLM balance.
            </div>
          )}
        </div>

        <div className="panel vehicle-panel">
          <div className="panel-header">
            <p className="eyebrow">Vehicle Listing</p>
            <h3>Choose Lease Plan</h3>
          </div>

          <div className="vehicle-list">
            {vehiclePlans.map((plan) => (
              <button
                key={plan.name}
                className={
                  plan.name === selectedPlan
                    ? "vehicle-button active"
                    : "vehicle-button"
                }
                onClick={() => selectPlan(plan)}
              >
                <strong>{plan.name}</strong>
                <span>{plan.vehicle}</span>
                <small>
                  {plan.term} · {plan.mileageCap} km cap · {plan.deposit} XLM deposit
                </small>
              </button>
            ))}
          </div>

          <div className="vehicle-detail">
            <span>{activePlan.description}</span>
          </div>
        </div>

        <div className="panel payment-panel">
          <div className="panel-header">
            <p className="eyebrow">Lease Payment</p>
            <h3>Send Testnet XLM</h3>
          </div>

          <label>
            Lessor Address
            <input
              value={lessorAddress}
              onChange={(event) => setLessorAddress(event.target.value)}
              placeholder="Paste funded Testnet lessor G... address"
            />
          </label>

          <label>
            Lease Initiation Amount in XLM
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="1"
              type="number"
              min="0"
              step="0.1"
            />
          </label>

          <label>
            Memo
            <input
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
              maxLength={28}
              placeholder="car_lease"
            />
          </label>

          <button
            className="primary-button full-width"
            onClick={sendLeasePayment}
            disabled={txStatus === "pending"}
          >
            {txStatus === "pending" ? "Sending..." : "Start Lease Payment"}
          </button>

          <p className="hint">
            The destination lessor account must already exist and be funded on
            Stellar Testnet.
          </p>
        </div>

        <div className="panel status-panel">
          <div className="panel-header">
            <p className="eyebrow">Transaction Monitor</p>
            <h3>Status</h3>
          </div>

          <div className={`status-card ${txStatus}`}>
            <span>{txStatus.toUpperCase()}</span>
            <p>{message}</p>
          </div>

          {txHash && (
            <div className="tx-box">
              <span>Transaction Hash</span>
              <code>{txHash}</code>
              <a href={txLink} target="_blank" rel="noreferrer">
                View on Stellar Expert
              </a>
            </div>
          )}

          <div className="activity-feed">
            <h4>Lease Activity Feed</h4>
            {activity.map((item, index) => (
              <p key={`${item}-${index}`}>{item}</p>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
