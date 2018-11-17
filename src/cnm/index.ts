import { NativeModules } from 'react-native';

const NotificationOpener: {
	openIfNotOpened(): void;
	isOpened(): Promise<Boolean>;
} =
	NativeModules.NotificationOpener;

export { NotificationOpener };
