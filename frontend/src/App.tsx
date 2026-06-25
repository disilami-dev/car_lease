import { useState } from "react";
import { connectWallet } from "./wallet";
import {
  addCar,
  getCar,
  leaseCar,
  getLease,
  CONTRACT_ID,
} from "./contract";

function App() {
  const [address, setAddress] = useState("");
  const [carId, setCarId] = useState("");
  const [model, setModel] = useState("");

  async function handleConnect() {
    try {
      const wallet = await connectWallet();

      if (wallet) {
        setAddress(wallet);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to connect wallet");
    }
  }

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "900px",
        margin: "0 auto",
        fontFamily: "Arial",
      }}
    >
      <h1>🚗 Car Lease dApp</h1>

      <button onClick={handleConnect}>Connect Wallet</button>

      <div style={{ marginTop: "15px" }}>
        <strong>Wallet:</strong>
        <p>{address || "Not connected"}</p>
      </div>

      <div style={{ marginTop: "15px" }}>
        <strong>Contract ID:</strong>
        <p>{CONTRACT_ID}</p>
      </div>

      <hr />

      <h2>Car Information</h2>

      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Car ID"
          value={carId}
          onChange={(e) => setCarId(e.target.value)}
          style={{ marginRight: "10px" }}
        />

        <input
          type="text"
          placeholder="Car Model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        />
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button onClick={addCar}>Add Car</button>

        <button onClick={getCar}>Get Car</button>

        <button onClick={leaseCar}>Lease Car</button>

        <button onClick={getLease}>Get Lease</button>
      </div>

      <hr />

      <h3>Available Contract Functions</h3>

      <ul>
        <li>add_car</li>
        <li>get_car</li>
        <li>lease_car</li>
        <li>get_lease</li>
      </ul>
    </div>
  );
}

export default App;