import * as dotenv from "dotenv";
import conMain from "./CC-Main";
import conKovan from "./CC-Kovan";
dotenv.config();
interface ContractInfo {
  address: string;
  abi: any;
}
if (!(process.env.NODE_ENV === "test" || "development" || "production")) {
  throw Error("No NODE_ENV Specified. Configure in environment variables");
}
const contractData: ContractInfo =
  process.env.NODE_ENV === "production" ? conMain : conKovan;

export default contractData;
