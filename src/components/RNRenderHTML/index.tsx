import HTMLClass, { Props } from './index.d';
import React from 'react';
const HTMLC: typeof HTMLClass = require('react-native-render-html').default;

export default (props: Props) => (
	<HTMLC
		emSize={18}
		ptSize={1.7}
		baseFontStyle={{ fontSize: 18, color: '#000' }}
		textSelectable
		tagsStyles={{ a: { textDecorationLine: 'none' }, strong: { color: '#c00', fontWeight: 'normal' } }}
		{...props}
	/>
);
