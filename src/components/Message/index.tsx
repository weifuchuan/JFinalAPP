import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Store } from '../../store';
import Router from '../Router';
import { ICON_BLUE } from '../base/color';
import { inject, observer } from 'mobx-react/native';
import { Toolbar } from 'react-native-material-ui';
import WebView from '../base/WebView';
import { req } from '../../store/web';
import { observable, runInAction } from 'mobx';
import { Modal } from 'antd-mobile-rn';
const cheerio: CheerioAPI = require('react-native-cheerio');

interface Props {
	store?: Store;
	type: 'fans' | 'follow';
	accountId?: number;
}

@inject('store')
@observer
class Friends extends Component<Props> {
	@observable nickName = '我';
	@observable html = '';
	webview: WebView | null = null;

	render() {
		return (
			<View style={styles.container}>
				<Toolbar
					leftElement={'arrow-back'}
					centerElement={this.props.type === 'fans' ? `${this.nickName}的粉丝` : `关注${this.nickName}的人`}
					onLeftElementPress={() => Router.pop()}
					style={{ container: { backgroundColor: ICON_BLUE } }}
				/>
				<WebView
					on={this.on}
					source={{ html: this.html, baseUrl: req.baseUrl }}
          ref={(r) => (this.webview = r)}
          originWhitelist={[]}
          startInLoadingState 
				/>
			</View>
		);
	}

	on = async (payload: any) => {
		if (payload.action === 'openUser') {
      const id: number = payload.id;
      if (this.props.store!.me && this.props.store!.me!.id === payload.id) {
				Modal.alert('跳转到我的主页？', '将无法返回此页', [
					{ text: '确认', onPress: () => Router.me() },
					{ text: '取消', onPress: () => null }
				]);
			} else 
			Router.user(id);
		} else if (payload.action === 'addFriend') {
			return (await req.GET('/friend/add', { friendId: payload.id })).data;
		} else if (payload.action === 'deleteFriend') {
			return (await req.GET('/friend/delete', { friendId: payload.id })).data;
		} else if (payload.action === 'openPage') {
			this.fetch(payload.p);
		}
	};

	htmlBuild = ($: CheerioStatic) => {
		return `
    <html>
    <head>
      ${$('head').html()}
      <style>          
        .friends span {
          visibility: visible;
        }
      </style>
    </head>
    <body>
      <div class="friends" > 
        ${$('div.friends').html()!}
      </div>
      <script src="https://cdn.bootcss.com/zepto/1.2.0/zepto.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/zepto.touch@1.0.3/zepto.touch.min.js"></script>
      <script >  
        $(document).ready(function(){ 
          var cnt = 0; 
          $('a[href^="/user/"]').each(function(){
            try{
              var href = $(this).attr('href');
              if (/^\\/user\\/\\d+$/.test(href)){
                cnt++;
                $(this).attr('href', null);
                var id = Number.parseInt(href.substring(href.lastIndexOf('/') + 1)); 
                $(this).on('tap', function(e){
                  e.preventDefault(); 
                  e.stopPropagation();           
                  send({action: "openUser", id: id}); 
                });
              }
            }catch(e){}
          }); 
          $('span[onclick]').each(function(){
            try{
              var onclick = $(this).attr('onclick');
              $(this).attr('onclick', null); 
              var id = Number.parseInt(onclick.match(/\\d+/)[0]); 
              var isAddFriend = onclick.startsWith('addFriend'); 
              $(this).on('tap', function (){
                var self = this; 
                if (isAddFriend){
                  send({action: "addFriend", id: id}).then(function(res){
                    if (res.state === 'ok'){ 
                      $(self).text("取消互粉"); 
                    }else{
                      alert(res.msg); 
                    }
                  }); 
                  isAddFriend = false;
                }else{
                  send({action: "deleteFriend", id: id}).then(function(res){
                    if (res.state === 'ok'){ 
                      $(self).text("+关注"); 
                    }else{
                      alert(res.msg); 
                    }
                  }); 
                  isAddFriend = true;
                }
              });
            }catch(e){}
          }); 
          $('.jf-paginate a[href*="?p="]').each(function(){
            try{
              var href = $(this).attr('href');
              $(this).attr('href', null);
              var p = Number.parseInt(href.substring(href.lastIndexOf('=') + 1)); 
              $(this).on('tap', function(e){
                e.preventDefault(); 
                e.stopPropagation();
                send({action: "openPage", p: p}); 
              }); 
            }catch(e){}
          });
        })
      </script>
    </body>
    </html>
    `;
	};

	fetch = async (p?: number) => {
		let uri = this.props.accountId ? `/user/${this.props.type}/${this.props.accountId}` : `/my/${this.props.type}`;
		uri = p ? uri + `?p=${p}` : uri;
		const html = await req.GET_HTML(uri);
		const $ = cheerio.load(html);
		runInAction(() => {
			if (this.props.accountId) this.nickName = $('span.nick-name').text();
      this.html = this.htmlBuild($);
    });
    console.log(this.html); 
	};

	componentDidMount() {
		this.fetch();
	}
}

// define your styles
const styles = StyleSheet.create({
	container: {
		flex: 1
	}
});

//make this component available to the app
export default Friends;
