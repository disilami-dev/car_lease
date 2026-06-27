export const CONTRACT_CONFIG = {
  network: 'testnet',
  networkPassphrase: 'Test SDF Network ; September 2015',
  rpcUrl: 'https://soroban-testnet.stellar.org',
  explorerBaseUrl: 'https://stellar.expert/explorer/testnet',
  contractId: 'CB7SR3GILWNBKSOR7WR565TA6HQ55HDCJXISCPBJJVBRZVNAMYLT4KKL',
  deployerPublicKey: 'GAFKXA32DMUQOBURCCHW67EKOAS6JJTTSWUEJ3POS3IKF5U355HIQSDM',
  deployedAt: '2026-06-27T21:06:01Z',
  projectName: 'car_lease',
  repository: 'https://github.com/disilami-dev/car_lease'
} as const;

export const hasDeployedContract = CONTRACT_CONFIG.contractId.length > 0;

export const getContractExplorerUrl = () =>
  CONTRACT_CONFIG.explorerBaseUrl + '/contract/' + CONTRACT_CONFIG.contractId;
