# car_lease

car_lease is a Stellar Level 3 dApp for managing car leasing records through a Soroban smart contract, a React frontend, and Freighter wallet transaction signing.

This project was upgraded from a Level 1 Stellar wallet dApp into a Level 3 Soroban dApp. The frontend now connects to Freighter, prepares real Soroban contract transactions, asks the wallet to sign the transaction, and submits the signed transaction to Stellar testnet.

## Live Deployment

Network: Stellar Testnet

Contract ID:

~~~text
CB7SR3GILWNBKSOR7WR565TA6HQ55HDCJXISCPBJJVBRZVNAMYLT4KKL
~~~

Contract Explorer:

~~~text
https://stellar.expert/explorer/testnet/contract/CB7SR3GILWNBKSOR7WR565TA6HQ55HDCJXISCPBJJVBRZVNAMYLT4KKL
~~~

## Problem

Small car rental and leasing businesses often track cars, leases, and customer activity through spreadsheets or private records. This makes it hard to prove which cars are available, who leased a car, and what lease terms were used.

car_lease demonstrates how Stellar and Soroban can be used to create a transparent leasing registry. The contract stores car records, lease records, car status, owner indexes, and lease statistics on-chain.

## Why Stellar

Stellar is suitable for car lease records because leasing actions should be fast, low-cost, and easy to verify.

- Soroban smart contracts support custom leasing logic.
- Stellar testnet allows safe development without real funds.
- Contract IDs and transactions can be inspected through Stellar explorers.
- Freighter provides a simple wallet signing flow for users.

## Smart Contract

The Soroban contract is located at:

~~~text
contracts/car-lease/src/lib.rs
~~~

Main contract functions:

- add_car
- get_car
- lease_car
- get_lease
- mark_available
- active_lease_for_car
- owner_car_count
- owner_car_at
- is_available
- stats
- status_label

## Level 3 Features

- Rust Soroban workspace
- Real Soroban smart contract
- Persistent car records
- Persistent lease records
- Owner-based authorization
- Lease payment validation
- Lease period validation
- Car availability status tracking
- Contract tests with 6 passing scenarios
- Deployed contract on Stellar testnet
- React frontend dashboard
- Freighter wallet connect flow
- Freighter requestAccess support
- Freighter getAddress support
- Freighter signTransaction integration
- Soroban RPC integration
- TransactionBuilder usage
- prepareTransaction usage
- sendTransaction usage
- nativeToScVal and scValToNative conversion
- Frontend functions match contract methods
- Frontend tests for contract integration
- GitHub Actions CI workflow
- One-command Level 3 verification script

## Frontend Contract Integration

The frontend is not a mock-only dashboard. It includes real Soroban transaction integration.

Wallet service:

- connects to Freighter
- requests wallet access
- reads wallet address
- requests transaction signing with signTransaction

Contract service:

- connects to Soroban RPC
- builds transactions with TransactionBuilder
- prepares transactions with prepareTransaction
- sends signed transactions with sendTransaction
- converts contract inputs with nativeToScVal
- converts read results with scValToNative

Frontend write functions:

- addCar calls add_car
- leaseCar calls lease_car
- markAvailable calls mark_available

Frontend read functions:

- getCar calls get_car
- getLease calls get_lease
- getStats calls stats

## Project Structure

~~~text
car_lease/
  contracts/
    car-lease/
      Cargo.toml
      Makefile
      src/
        lib.rs
        test.rs
  frontend/
    src/
      App.tsx
      App.css
      contractConfig.ts
      services/
        wallet.ts
        contract.ts
        contract.test.ts
  scripts/
    deploy-and-save.ps1
    verify-level3.ps1
  .github/workflows/ci.yml
  CONTRACT_ID.txt
  DEPLOYMENT.md
  Cargo.toml
  Cargo.lock
~~~

## Contract Tests

Run contract tests from the project root:

~~~powershell
cargo test --workspace
~~~

Current contract coverage includes:

- adds car and reads car
- leases available car
- rejects lease when payment is too low
- rejects invalid lease period
- rejects double lease for the same car
- owner can mark car available again

## Frontend Tests

Run frontend tests:

~~~powershell
cd frontend
npm test
~~~

Current frontend coverage includes:

- loads deployed contract runtime config
- maps frontend functions to real contract method names
- exports real write transaction functions used by the UI
- exports real read query functions used by the UI
- shortens contract IDs and transaction hashes for dashboard display

## Build

Build Soroban contract:

~~~powershell
cargo build --workspace --target wasm32v1-none --release
~~~

Build frontend:

~~~powershell
cd frontend
npm ci
npm run build
~~~

## Deploy

Deploy the contract to Stellar testnet:

~~~powershell
.\scripts\deploy-and-save.ps1
~~~

The deployment script:

- checks required CLIs
- runs contract format check
- runs contract tests
- builds Soroban WASM
- checks only the current project identity
- deploys the car_lease contract
- saves CONTRACT_ID.txt
- saves DEPLOYMENT.md
- updates frontend/src/contractConfig.ts

The script does not print unrelated local Stellar identities from other projects.

## Verify Level 3

Run the full verification script:

~~~powershell
.\scripts\verify-level3.ps1
~~~

This script checks:

- required Level 3 files
- deployed contract ID
- Freighter requestAccess
- Freighter getAddress
- Freighter signTransaction
- TransactionBuilder
- prepareTransaction
- sendTransaction
- nativeToScVal
- scValToNative
- frontend and contract function matching
- contract tests
- Soroban WASM build
- frontend tests
- frontend build

## CI

GitHub Actions runs:

- Rust format check
- contract tests
- Soroban WASM build
- frontend dependency install
- frontend tests
- frontend build

## Tech Stack

- Stellar Soroban
- Rust
- soroban-sdk
- React
- TypeScript
- Vite
- Vitest
- Freighter API
- Stellar SDK
- GitHub Actions

## Repository

~~~text
https://github.com/disilami-dev/car_lease
~~~