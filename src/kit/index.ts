export async function retryDo<Result>(action: () => Promise<Result>, retryCount: number): Promise<Result> {
	if (retryCount > 1) {
		try {
			return await action();
		} catch (err) {
			return await retryDo(action, retryCount - 1);
		}
	} else {
		try {
			return await action();
		} catch (err) {
			throw err;
		}
	}
}

// repeat run f by 100ms if f return false
export function repeat(f: () => boolean, timeout: number = 100) {
	const g: any = (g: any) => {
		if (f()) {
			return;
		}
		setTimeout(() => {
			g(g);
		}, timeout);
	};
	g(g); 
}

export const defaultAvatar = '/upload/avatar/x.jpg';
