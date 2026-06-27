import { describe, expect, it } from 'vitest';
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
} from './contract';

describe('car_lease frontend contract integration', () => {
  it('loads deployed contract runtime config', () => {
    const runtime = getRuntimeConfig();

    expect(runtime.network).toBe('testnet');
    expect(runtime.contractId.startsWith('C')).toBe(true);
    expect(runtime.rpcUrl).toContain('soroban-testnet');
    expect(runtime.contractExplorerUrl).toContain(runtime.contractId);
    expect(runtime.hasDeployedContract).toBe(true);
  });

  it('maps frontend functions to real contract method names', () => {
    const methods = getContractMethods();

    expect(methods).toContain('add_car');
    expect(methods).toContain('get_car');
    expect(methods).toContain('lease_car');
    expect(methods).toContain('get_lease');
    expect(methods).toContain('mark_available');
    expect(methods).toContain('active_lease_for_car');
    expect(methods).toContain('owner_car_count');
    expect(methods).toContain('owner_car_at');
    expect(methods).toContain('is_available');
    expect(methods).toContain('stats');
    expect(methods).toContain('status_label');
  });

  it('exports real write transaction functions used by the UI', () => {
    expect(typeof addCar).toBe('function');
    expect(typeof leaseCar).toBe('function');
    expect(typeof markAvailable).toBe('function');
  });

  it('exports real read query functions used by the UI', () => {
    expect(typeof getCar).toBe('function');
    expect(typeof getLease).toBe('function');
    expect(typeof getStats).toBe('function');
  });

  it('shortens contract IDs and transaction hashes for dashboard display', () => {
    const value = 'CB7SR3GIWNBKSOR7WR565TA6HQ55HDCJXISCPBJJVBRZVNAMYLJ4KKL';

    expect(shortenAddress(value)).toBe('CB7SR3GI...MYLJ4KKL');
    expect(shortenAddress('')).toBe('Not available');
  });
});