import { Contract } from "@stellar/stellar-sdk";

export const CONTRACT_ID =
  "CAH7LXFNKELYUK4U7KRMUH34QPSATWT3J73MBGIG4DAVLVRA7O3QSX6N";

export const contract = new Contract(CONTRACT_ID);

export async function addCar() {
  console.log("Contract:", CONTRACT_ID);
  console.log("Function:", "add_car");

  return contract;
}

export async function getCar() {
  console.log("Contract:", CONTRACT_ID);
  console.log("Function:", "get_car");

  return contract;
}

export async function leaseCar() {
  console.log("Contract:", CONTRACT_ID);
  console.log("Function:", "lease_car");

  return contract;
}

export async function getLease() {
  console.log("Contract:", CONTRACT_ID);
  console.log("Function:", "get_lease");

  return contract;
}