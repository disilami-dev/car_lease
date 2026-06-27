import * as StellarSdk from '@stellar/stellar-sdk';
import {
  CONTRACT_CONFIG,
  getContractExplorerUrl,
  hasDeployedContract,
} from '../contractConfig';
import { signWithFreighter } from './wallet';

const SDK = StellarSdk as any;

export type AddCarInput = {
  owner: string;
  vin: string;
  model: string;
  dailyRate: string;
};

export type LeaseCarInput = {
  lessee: string;
  carId: number;
  startLedger: number;
  endLedger: number;
  payment: string;
};

export type MarkAvailableInput = {
  owner: string;
  carId: number;
};

export type SubmittedTransaction = {
  hash: string;
  status: string;
  explorerUrl: string;
};

export type RuntimeConfig = {
  network: string;
  rpcUrl: string;
  contractId: string;
  contractExplorerUrl: string;
  deployedAt: string;
  hasDeployedContract: boolean;
};

const getServer = () => {
  const ServerClass = SDK.SorobanRpc?.Server || SDK.rpc?.Server;

  if (!ServerClass) {
    throw new Error('Soroban RPC Server class was not found in @stellar/stellar-sdk.');
  }

  return new ServerClass(CONTRACT_CONFIG.rpcUrl, { allowHttp: false });
};

const getContract = () => {
  return new SDK.Contract(CONTRACT_CONFIG.contractId);
};

const buildAddressScVal = (address: string) => {
  return new SDK.Address(address).toScVal();
};

const buildStringScVal = (value: string) => {
  return SDK.nativeToScVal(value, { type: 'string' });
};

const buildU32ScVal = (value: number) => {
  return SDK.nativeToScVal(value, { type: 'u32' });
};

const buildI128ScVal = (value: string) => {
  return SDK.nativeToScVal(BigInt(value || '0'), { type: 'i128' });
};

const buildTransaction = async (sourcePublicKey: string, operation: unknown) => {
  const server = getServer();
  const sourceAccount = await server.getAccount(sourcePublicKey);

  const transaction = new SDK.TransactionBuilder(sourceAccount, {
    fee: SDK.BASE_FEE,
    networkPassphrase: CONTRACT_CONFIG.networkPassphrase,
  })
    .addOperation(operation)
    .setTimeout(60)
    .build();

  return server.prepareTransaction(transaction);
};

const submitSignedTransaction = async (signedXdr: string): Promise<SubmittedTransaction> => {
  const server = getServer();
  const signedTransaction = new SDK.Transaction(signedXdr, CONTRACT_CONFIG.networkPassphrase);
  const sendResult = await server.sendTransaction(signedTransaction);

  if (!sendResult.hash) {
    throw new Error(sendResult.errorResultXdr || 'Transaction was rejected by Soroban RPC.');
  }

  return {
    hash: sendResult.hash,
    status: sendResult.status || 'PENDING',
    explorerUrl: `${CONTRACT_CONFIG.explorerBaseUrl}/tx/${sendResult.hash}`,
  };
};

const invokeContract = async (
  sourcePublicKey: string,
  method: string,
  args: unknown[],
): Promise<SubmittedTransaction> => {
  const contract = getContract();
  const operation = contract.call(method, ...args);
  const preparedTransaction = await buildTransaction(sourcePublicKey, operation);
  const signedXdr = await signWithFreighter(preparedTransaction.toXDR(), sourcePublicKey);

  return submitSignedTransaction(signedXdr);
};

const simulateContract = async (sourcePublicKey: string, method: string, args: unknown[]) => {
  const server = getServer();
  const contract = getContract();
  const operation = contract.call(method, ...args);
  const sourceAccount = await server.getAccount(sourcePublicKey);

  const transaction = new SDK.TransactionBuilder(sourceAccount, {
    fee: SDK.BASE_FEE,
    networkPassphrase: CONTRACT_CONFIG.networkPassphrase,
  })
    .addOperation(operation)
    .setTimeout(60)
    .build();

  const simulation = await server.simulateTransaction(transaction);

  if (simulation.error) {
    throw new Error(simulation.error);
  }

  return simulation.result?.retval;
};

export const getRuntimeConfig = (): RuntimeConfig => {
  return {
    network: CONTRACT_CONFIG.network,
    rpcUrl: CONTRACT_CONFIG.rpcUrl,
    contractId: CONTRACT_CONFIG.contractId,
    contractExplorerUrl: getContractExplorerUrl(),
    deployedAt: CONTRACT_CONFIG.deployedAt,
    hasDeployedContract,
  };
};

export const shortenAddress = (value: string, prefix = 8, suffix = 8) => {
  if (!value) {
    return 'Not available';
  }

  if (value.length <= prefix + suffix + 3) {
    return value;
  }

  return `${value.slice(0, prefix)}...${value.slice(-suffix)}`;
};

export const addCar = async (input: AddCarInput): Promise<SubmittedTransaction> => {
  return invokeContract(input.owner, 'add_car', [
    buildAddressScVal(input.owner),
    buildStringScVal(input.vin),
    buildStringScVal(input.model),
    buildI128ScVal(input.dailyRate),
  ]);
};

export const leaseCar = async (input: LeaseCarInput): Promise<SubmittedTransaction> => {
  return invokeContract(input.lessee, 'lease_car', [
    buildAddressScVal(input.lessee),
    buildU32ScVal(input.carId),
    buildU32ScVal(input.startLedger),
    buildU32ScVal(input.endLedger),
    buildI128ScVal(input.payment),
  ]);
};

export const markAvailable = async (input: MarkAvailableInput): Promise<SubmittedTransaction> => {
  return invokeContract(input.owner, 'mark_available', [
    buildAddressScVal(input.owner),
    buildU32ScVal(input.carId),
  ]);
};

export const getCar = async (sourcePublicKey: string, carId: number): Promise<unknown> => {
  const result = await simulateContract(sourcePublicKey, 'get_car', [buildU32ScVal(carId)]);

  return result ? SDK.scValToNative(result) : null;
};

export const getLease = async (sourcePublicKey: string, leaseId: number): Promise<unknown> => {
  const result = await simulateContract(sourcePublicKey, 'get_lease', [buildU32ScVal(leaseId)]);

  return result ? SDK.scValToNative(result) : null;
};

export const getStats = async (sourcePublicKey: string): Promise<unknown> => {
  const result = await simulateContract(sourcePublicKey, 'stats', []);

  return result ? SDK.scValToNative(result) : null;
};

export const getContractMethods = () => [
  'add_car',
  'get_car',
  'lease_car',
  'get_lease',
  'mark_available',
  'active_lease_for_car',
  'owner_car_count',
  'owner_car_at',
  'is_available',
  'stats',
  'status_label',
];