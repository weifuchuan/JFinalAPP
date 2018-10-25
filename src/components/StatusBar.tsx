import { StatusBar as _StatusBar, StatusBarStyle } from 'react-native';

const barStyleStack: [StatusBarStyle, boolean][] = [ [ 'dark-content', true ] ];
const backgroundColorStack: [string, boolean][] = [ [ '#EAEAEF', true ] ];

const StatusBar = {
	pushBarStyle(style: StatusBarStyle, animated: boolean = true) {
		_StatusBar.setBarStyle(style, animated);
		barStyleStack.push([ style, animated ]);
	},
	popBarStyle() {
		if (barStyleStack.length === 1) {
			barStyleStack.push([ 'dark-content', true ]);
		}
		barStyleStack.pop();
		const [ style, animated ] = barStyleStack[barStyleStack.length - 1];
		_StatusBar.setBarStyle(style, animated);
	},
	pushBackgroundColor(color: string, animated: boolean = true) {
		_StatusBar.setBackgroundColor(color, animated);
		backgroundColorStack.push([ color, animated ]);
	},
	popBackgroundColor() {
		if (backgroundColorStack.length === 1) {
			backgroundColorStack.push([ '#EAEAEF', true ]);
		}
		backgroundColorStack.pop();
		const [ color, animated ] = backgroundColorStack[backgroundColorStack.length - 1];
		_StatusBar.setBackgroundColor(color, animated);
	},
	source: _StatusBar
};

export default StatusBar;
