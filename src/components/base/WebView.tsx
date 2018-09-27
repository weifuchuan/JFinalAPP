import React from 'react';
import {
	WebViewProps,
	WebView as _WebView,
	NativeSyntheticEvent,
	WebViewMessageEventData,
	WebViewHtmlSource
} from 'react-native';

export interface Props extends WebViewProps {
	handler?: string;
	on?: (payload: any) => Promise<any>;
}
export default class WebView extends React.Component<Props> {
	static defaultProps = {
		handler: `function(){}`,
		on: () => Promise.resolve(), 
	};

	private id2resolve = new Map<string, (value?: any) => void>();
	readonly post: (data: any) => Promise<any> = (data: any) => {
		return new Promise((resolve) => {
			if (this._webview) {
				const id = new Date().toString() + Math.random();
				this.id2resolve.set(id, resolve);
				this._webview.postMessage(JSON.stringify({ id, payload: data, type: 0 /* from parent to webview */ }));
			}
		});
	};
	private _webview: _WebView | null = null;
	get webview() {
		return this._webview!;
	}
	private onMessage = async (event: NativeSyntheticEvent<WebViewMessageEventData>) => {
		const msg = JSON.parse(event.nativeEvent.data);
		if (msg.type === 0) {
			const { id, result } = msg;
			if (this.id2resolve.has(id)) {
				this.id2resolve.get(id)!(result);
				this.id2resolve.delete(id);
			}
		} else {
			const { id, payload } = msg;
			const result = await this.props.on!(payload);
			this._webview!.postMessage(JSON.stringify({ id, result, type: 1 /* from webview to parent */ }));
		}
	};
	render() {
		return (
			<_WebView
				{...this.props}
				mixedContentMode={'compatibility'}
				javaScriptEnabled={true}
				domStorageEnabled={true}
				ref={(w) => (this._webview = w)}
        onMessage={this.onMessage}
        injectedJavaScript={`
					var id2resolve = {}; 
					window.document.addEventListener('message', function(e){ 
						var msg = e.data;  
            msg = JSON.parse(msg); 
            if (msg.type === 0){ 
              var payload = msg.payload; 
							var result = (${this.props.handler})(payload);
              window.postMessage(JSON.stringify({id: msg.id, result: result, type:0})); 
            }else{ 
              if (id2resolve[msg.id]){ 
                id2resolve[msg.id](msg.result); 
                delete id2resolve[msg.id]; 
              }
            } 
          });
          window.send = function (payload){ 
            return new Promise(function(resolve){ 
              var id = new Date().toString() + Math.random(); 
              id2resolve[id] = resolve; 
							window.postMessage(JSON.stringify({id: id, payload: payload, type: 1 }));  
            }); 
          }; 
        `}
			/>
		);
  }
  
}
