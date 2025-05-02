export const throttle = <T extends (...args: any[]) => any>(callback: T, delay: number) => {
	let wait = false;
	let pendingArgs: Parameters<T> | null = null;

	return function (...args: Parameters<T>): void {
		if (!wait) {
			// Execute immediately
			callback(...args);
			wait = true;

			// Reset after delay
			setTimeout(() => {
				wait = false;
				// If we have pending arguments, call again with those
				if (pendingArgs) {
					const argsToUse = pendingArgs;
					pendingArgs = null;
					callback(...argsToUse);
					wait = true;
					setTimeout(() => {
						wait = false;
					}, delay);
				}
			}, delay);
		} else {
			// Store the most recent arguments to use when throttle allows execution again
			pendingArgs = args;
		}
	};
};
