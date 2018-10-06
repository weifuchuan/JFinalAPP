import React from 'react';
import {  TouchableWithoutFeedbackProps } from 'react-native';
import { RippleFeedback } from 'react-native-material-ui';
// import { Platform, TouchableNativeFeedback, TouchableOpacity } from 'react-native';

// const Touchable = Platform.OS === 'android' ? TouchableNativeFeedback : TouchableOpacity;

// export default Touchable;

export default (
	props: TouchableWithoutFeedbackProps & {
		color?: string;
		borderless?: boolean;
		children: JSX.Element;
	}
) => {
	return <RippleFeedback {...props} />;
};
