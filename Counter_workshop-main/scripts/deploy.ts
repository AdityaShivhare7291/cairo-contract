import { Account, CallData, Contract, RpcProvider, stark } from "starknet";
import * as dotenv from "dotenv";
import { getCompiledCode } from "./utils";
dotenv.config();

async function main() {
  const provider = new RpcProvider({
    nodeUrl: process.env.RPC_ENDPOINT,
  });

  // initialize existing predeployed account 0
  console.log("ACCOUNT_ADDRESS=", process.env.DEPLOYER_ADDRESS);
  console.log("ACCOUNT_PRIVATE_KEY=", process.env.DEPLOYER_PRIVATE_KEY);
  const privateKey0 = process.env.DEPLOYER_PRIVATE_KEY ?? "";
  const accountAddress0: string = process.env.DEPLOYER_ADDRESS ?? "";
  const account0 = new Account(provider, accountAddress0, privateKey0);
  console.log("Account connected.\n");

  // try {
  //   const nonce = await provider.getNonceForAddress(accountAddress0, 'latest');
  //   console.log(`Nonce for account: ${nonce}`);
  // } catch (error) {
  //   console.error("Error fetching nonce or account not deployed:", error);
  //   process.exit(1);
  // }

  // Declare & deploy contract
  let sierraCode, casmCode;

  try {
    ({ sierraCode, casmCode } = await getCompiledCode("workshop_counter_contract"));
  } catch (error: any) {
    console.log("Failed to read contract files");
    process.exit(1);
  }

  const myCallData = new CallData(sierraCode.abi);
  // console.log("after sierra code abi", sierraCode.abi)
  const constructor = myCallData.compile("constructor", {
    init_value: 0,
    kill_switch_address:
      "0x07442515fa7a3eae0c6e4d40498122d57496784fbf8459e7f2b3c1a963eeaf50",
    initial_owner: process.env.DEPLOYER_ADDRESS ?? "",
  });
  console.log("after constructor", { constructor })
  const deployResponse = await account0.declareAndDeploy({
    contract: sierraCode,
    casm: casmCode,
    constructorCalldata: constructor,
    salt: stark.randomAddress(),
  });

  console.log("after deploy_response", sierraCode.abi)

  // Connect the new contract instance :
  const myTestContract = new Contract(
    sierraCode.abi,
    deployResponse.deploy.contract_address,
    provider
  );
  console.log(
    `✅ Contract has been deploy with the address: ${myTestContract.address}`
  );
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });