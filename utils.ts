import {
	Builder,
	type TAddress,
	type TAmount,
	type TAsset,
	type TCurrencyInput,
	type TNode,
	type TNodeWithRelayChains,
} from "@paraspell/sdk";

// Dummy account, in the UI this would be the user's account.
export const ADDRESS = "5EFLoFqkhc5Wv27yEme1pAHh1L2MMAtjsBUXgnGanW9tfEQL";

// List of supported chains.
export const PATHS: ReadonlyMap<
	TNodeWithRelayChains,
	readonly TNodeWithRelayChains[]
> = new Map([
	["Polimec", ["AssetHubPolkadot"]],
	["Polkadot", ["Polimec", "AssetHubPolkadot"]],
	["AssetHubPolkadot", ["Polimec", "Polkadot"]],
] as const);

// Get the chains that can be used to transfer assets from the given chain.
export function getTransferableChains(
	chainsFrom: TNodeWithRelayChains[],
	chainFrom: TNodeWithRelayChains,
): TNodeWithRelayChains[] {
	const directChains = PATHS.get(chainFrom) ?? [];
	return chainsFrom.filter(
		(chain) => chain !== chainFrom && directChains.includes(chain),
	);
}

function relayToPara(to: TNode, amount: TAmount, address: TAddress) {
	return Builder().to(to).amount(amount).address(address);
}

function paraToRelay(
	from: Exclude<TNode, "Ethereum">,
	amount: TAmount,
	address: TAddress,
) {
	return Builder().from(from).amount(amount).address(address);
}

function paraToPara(
	from: Exclude<TNode, "Ethereum">,
	to: Exclude<TNode, "Ethereum">,
	amount: TAmount,
	address: TAddress,
	currency: TCurrencyInput,
) {
	return Builder()
		.from(from)
		.to(to)
		.currency(currency)
		.amount(amount)
		.address(address);
}

export async function createExtrinsic(
	chainFrom: TNodeWithRelayChains,
	chainTo: TNodeWithRelayChains,
	asset: TAsset,
	amount: bigint,
) {
	if (!asset.symbol) {
		throw new Error("Invalid asset");
	}

	if (
		chainFrom === "Polkadot" &&
		chainTo !== "Polkadot" &&
		chainTo !== "Kusama"
	) {
		const relay = relayToPara(chainTo, amount, ADDRESS);
		return relay.build();
	}
	if (chainFrom === "AssetHubPolkadot") {
		if (chainTo === "Polkadot") {
			const para = paraToRelay(chainFrom, amount, ADDRESS);
			return para.build();
		}
		if (chainTo === "Polimec") {
			const para = paraToPara(chainFrom, chainTo, amount, ADDRESS, {
				symbol: asset.symbol,
			});
			return para.build();
		}
		throw new Error("Invalid chain");
	}
	if (chainFrom === "Polimec" && chainTo === "AssetHubPolkadot") {
		const para = paraToPara(chainFrom, chainTo, amount, ADDRESS, {
			symbol: asset.symbol,
		});
		return para.build();
	}
	throw new Error("Invalid chain");
}
