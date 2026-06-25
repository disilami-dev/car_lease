import { requestAccess } from "@stellar/freighter-api";

export async function connectWallet() {
  const result = await requestAccess();

  if (result.error) {
    throw new Error(result.error);
  }

  return result.address;
}