# car_lease

car_lease is a Stellar Level 3 dApp for managing car leasing records on Stellar testnet.

The project includes a Soroban smart contract, React frontend, Freighter wallet integration, verification scripts, deployment records, documentation, and GitHub Actions CI.

## Contract Deployment

<pre>
Network: Stellar testnet
Contract ID: CB7SR3GILWNBKSOR7WR565TA6HQ55HDCJXISCPBJJVBRZVNAMYLT4KKL
Contract Explorer: https://stellar.expert/explorer/testnet/contract/CB7SR3GILWNBKSOR7WR565TA6HQ55HDCJXISCPBJJVBRZVNAMYLT4KKL
</pre>

## Level 3 Scope

<pre>
Soroban smart contract
Contract tests
Contract WASM build
React frontend
Freighter wallet integration
Soroban transaction flow
Frontend tests
Verification script
Deployment script
GitHub Actions CI
Documentation
</pre>

## Repository Structure

<pre>
car_lease
|-- .github
|   +-- workflows
|       +-- ci.yml
|-- contracts
|   +-- car-lease
|-- docs
|-- evidence
|-- frontend
|-- scripts
|-- CONTRACT_ID.txt
|-- DEPLOYMENT.md
|-- Cargo.toml
|-- Cargo.lock
|-- README.md
|-- vercel.json
+-- .gitignore
</pre>

## Smart Contract Features

<pre>
add_car
get_car
lease_car
get_lease
mark_available
active_lease_for_car
owner_car_count
owner_car_at
is_available
stats
status_label
</pre>

## Local Setup

<pre>
cd frontend
npm install
npm run dev
</pre>

## Contract Tests

<pre>
cargo test --workspace
</pre>

## Contract WASM Build

<pre>
cargo build --workspace --target wasm32v1-none --release
</pre>

## Frontend Tests

<pre>
cd frontend
npm test
</pre>

## Frontend Build

<pre>
cd frontend
npm run build
</pre>

## Full Verification

<pre>
powershell -ExecutionPolicy Bypass -File scripts/verify-level3.ps1
</pre>

## Documentation

<pre>
docs/ARCHITECTURE.md
docs/QUALITY_AND_VERIFICATION.md
docs/DEPLOYMENT_NOTES.md
docs/LOCAL_RUN_GUIDE.md
evidence/SUBMISSION_CHECKLIST.md
</pre>

## Generated Files Policy

<pre>
target/
node_modules/
dist/
.vite/
contracts/**/test_snapshots/
*.tsbuildinfo
frontend/vite.config.js
frontend/vite.config.d.ts
</pre>

## Repository

<pre>
https://github.com/disilami-dev/car_lease
</pre>

## License

MIT
