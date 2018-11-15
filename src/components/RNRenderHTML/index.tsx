import HTMLClass, { Props } from './index.d';
import React from 'react';
const HTMLC: typeof HTMLClass = require('react-native-render-html').default;

export default function HTML(props: Props) {
	return (
		<HTMLC
			emSize={16}
			ptSize={1.6}
			baseFontStyle={{ fontSize: 16, color: '#000' }}
			textSelectable
			tagsStyles={{ a: { textDecorationLine: 'none' }, strong: { color: '#c00', fontWeight: 'normal' } }}
			{...props}
		/>
	);
}
