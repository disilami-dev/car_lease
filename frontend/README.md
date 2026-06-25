# Car Lease dApp

## Problem
Traditional vehicle leasing processes rely on intermediaries, paperwork, and centralized systems, making leasing agreements less transparent and harder to verify.

## Solution
Car Lease dApp is a decentralized vehicle leasing platform built on Stellar Soroban that allows users to register cars, create lease agreements, and retrieve lease information on-chain.

## Why Stellar
Stellar Soroban enables fast, low-cost, and secure smart contract execution, making decentralized leasing agreements practical and accessible.

## Target User
- Car owners who want to lease vehicles transparently
- Renters looking for verifiable leasing agreements
- Small vehicle rental businesses
- Developers learning Soroban smart contracts

## Live Demo

- Network: Stellar Testnet

- **Contract ID**
  ```
  CAH7LXFNKELYUK4U7KRMUH34QPSATWT3J73MBGIG4DAVLVRA7O3QSX6N
  ```

- **Transaction**
  https://stellar.expert/explorer/testnet/tx/8f80804ea53f742d9d956f5b6b533a25f273e149d1dabbedc42df2df26e75989

- **Contract Explorer**
  https://lab.stellar.org/r/testnet/contract/CAH7LXFNKELYUK4U7KRMUH34QPSATWT3J73MBGIG4DAVLVRA7O3QSX6N

## Features

### Smart Contract Functions

- `add_car`
  - Register a vehicle on-chain

- `get_car`
  - Retrieve vehicle information

- `lease_car`
  - Create a leasing agreement

- `get_lease`
  - Retrieve lease details

### Frontend Features

- Connect Freighter Wallet
- Display connected Stellar address
- Display deployed contract ID
- Vehicle information form
- Smart contract function mapping
- Stellar Testnet integration

## Project Structure

```text
car-lease-dapp/
│
├── contract/
│   ├── Cargo.toml
│   ├── Cargo.lock
│   ├── README.md
│   └── contracts/
│       └── car-lease/
│           ├── Cargo.toml
│           └── src/
│               ├── lib.rs
│               └── test.rs
│
└── frontend/
    ├── src/
    │   ├── App.tsx
    │   ├── contract.ts
    │   └── wallet.ts
    └── package.json
```

## Smart Contract Testing

```bash
cargo test
```

Result:

```text
test_add_and_get_car ... ok
test_lease_car ... ok

2 passed; 0 failed
```

## How to Run

### 1. Clone Repository

```bash
git clone https://github.com/yourname/car-lease-dapp.git
cd car-lease-dapp
```

### 2. Build Smart Contract

```bash
cd contract/contracts/car-lease

stellar contract build
```

### 3. Run Tests

```bash
cargo test
```

### 4. Deploy Contract

```bash
stellar contract deploy \
--source deployer \
--network testnet \
--wasm target/wasm32v1-none/release/car_lease.wasm
```

### 5. Run Frontend

```bash
cd frontend

npm install

npm run dev
```

Open:

```text
http://localhost:5173
```

or

```text
http://localhost:5174
```

### 6. Connect Wallet

Install Freighter Wallet:

https://www.freighter.app/

- Select Testnet
- Connect wallet
- Approve the dApp

## Tech Stack

- Smart Contract: Rust + Soroban SDK
- Frontend: React + TypeScript + Vite
- Blockchain SDK: @stellar/stellar-sdk
- Wallet: Freighter
- Network: Stellar Testnet

## Deployment Information

| Item | Value |
|--------|--------|
| Network | Stellar Testnet |
| Contract Name | Car Lease Contract |
| Contract ID | CAH7LXFNKELYUK4U7KRMUH34QPSATWT3J73MBGIG4DAVLVRA7O3QSX6N |
| Functions | add_car, get_car, lease_car, get_lease |

## Future Improvements

- Real on-chain contract invocation from frontend
- Lease payment support
- Vehicle ownership verification
- Multi-user leasing marketplace
- Lease expiration management
- Enhanced UI/UX

## Team

- Disi
- Email: disilami604@gmail.com
