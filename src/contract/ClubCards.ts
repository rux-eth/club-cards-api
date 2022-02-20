import * as dotenv from "dotenv";
import conMain from "./CC-Main";
import conRink from "./CC-Rink";
dotenv.config();
if (!(process.env.NODE_ENV === "test" || "development" || "production")) {
  throw Error("No NODE_ENV Specified. Configure in environment variables");
}
let conAddress, conABI, network;
if (process.env.NODE_ENV === "production") {
  conAddress = conMain.address;
  conABI = conMain.abi;
  network = "mainnet";
} else {
  conAddress = conRink.address;
  conABI = conRink.abi;
  network = "rinkeby";
}

export { conAddress, conABI, network };
