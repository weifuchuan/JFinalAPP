import { YellowBox } from 'react-native';
declare var global: any;
declare var window: any;

if (__DEV__) {
	console.ignoredYellowBox = [ 'Warning: isMounted(...) is deprecated', 'Require cycle' ];

	// ignore yellow box
	YellowBox.ignoreWarnings([ 'Warning: isMounted(...) is deprecated', 'Require cycle' ]);

	// debug network
	global.XMLHttpRequest = global.originalXMLHttpRequest ? global.originalXMLHttpRequest : global.XMLHttpRequest;
	global.FormData = global.originalFormData ? global.originalFormData : global.FormData;

	fetch; // Ensure to get the lazy property

	// if (window.__FETCH_SUPPORT__) {
	// 	// it's RNDebugger only to have
	// 	window.__FETCH_SUPPORT__.blob = false;
	// }
	//  else {
	// 	/*
	//  * Set __FETCH_SUPPORT__ to false is just work for fetch.
	//  * If you're using another way you can just use the native Blob and remove the else statement
	//  */
	global.Blob = global.originalBlob ? global.originalBlob : global.Blob;
	global.FileReader = global.originalFileReader ? global.originalFileReader : global.FileReader;
	// }
}

import * as React from 'react';
import { Provider } from 'mobx-react';
import App from './components';
import store from './store';

export default () => (
	<Provider store={store}>
		<App />
	</Provider>
);
