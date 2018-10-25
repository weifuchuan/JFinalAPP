import React from "react";
import { TextProps, Text } from 'react-native';

export default (props: TextProps & { children: string }) => {
	return <Text {...props} style={{ color: '#000', ...props.style as any ? props.style as any : {} }} />;
};
