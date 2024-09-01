import "dotenv/config";
import * as ethers from "ethers";
import AAVEGOTCHI_ABI from "src/constants/abis/AavegotchiAbi.json";

const key = process.env.PRIVATE_KEY;

export const autoPet = async (event, context) => {
  if (!key) {
    throw new Error("Missing Private Key");
  }
  const provider = new ethers.JsonRpcProvider("https://polygon.llamarpc.com");
  const wallet = new ethers.Wallet(key, provider);
  const nft = new ethers.Contract(
    "0x86935F11C86623deC8a25696E1C19a8659CbF95d",
    AAVEGOTCHI_ABI,
    wallet
  );

  const data = await nft.tokenIdsWithKinship(
    "0xFa3ce52c15f19F363833b2983340325000a4636c",
    0,
    0,
    true
  );
  const lastInteracted = data[0][2];
  if (Number(lastInteracted) + 3600 * 12 < new Date().getTime() / 1000) {
    const ids = data.map((token) => token[0]);
    await nft.interact(ids);
  }
};
