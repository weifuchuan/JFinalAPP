import { Dimensions, NativeModules } from 'react-native';

export const SCREEN_WIDTH = Dimensions.get('window').width;
export const SCREEN_HEIGHT = Dimensions.get('window').height;

export function measure(
	e: any
): Promise<{
	x: number;
	y: number;
	width: number;
	height: number;
	pageX: number;
	pageY: number;
}> {
	return new Promise((resolve) => {
		NativeModules.UIManager.measure(
			e.target,
			(x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
				resolve({ x, y, width, height, pageX, pageY });
			}
		);
	});
}

export function getNoCacheValue() {
	return new Date().getMinutes().toString()[0];
}
