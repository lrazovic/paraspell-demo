import { type TNodeWithRelayChains, getSupportedAssets } from "@paraspell/sdk";
import { PATHS, createExtrinsic, getTransferableChains } from "./utils";

const chainsFrom = Array.from(PATHS.keys());

// Value selected by the user in the UI.
const chainFrom: TNodeWithRelayChains = "Polimec";

// This will be used by the UI to display the available chains.
const chainsTo = getTransferableChains(chainsFrom, chainFrom);

// Value selected by the user in the UI.
const chainTo: TNodeWithRelayChains = "AssetHubPolkadot";

const supportedAssets = getSupportedAssets(chainFrom, chainTo);
const asset = supportedAssets[0];

const humanReadableAmount = 2n;
const amount = humanReadableAmount * 10n ** 10n;

console.log(
	`Operation: Transfer ${humanReadableAmount} ${asset.symbol} from ${chainFrom} to ${chainTo}`,
);

try {
	const ex = await createExtrinsic(chainFrom, chainTo, asset, amount);
	console.log("Extrinsic:", ex.toHuman());
} catch (error) {
	console.error("Error:", error);
}
