export type AggroComp = { aggro: boolean };

export function aggro(): AggroComp {
	return {
		aggro: false,
	}
}