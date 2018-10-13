import { Toast } from 'antd-mobile-rn';
import { action, observable } from 'mobx';
import { inject, observer } from 'mobx-react/native';
import React from 'react';
import { ActivityIndicator, BackHandler, StyleSheet, View, ViewStyle, NetInfo } from 'react-native';
import { Toolbar } from 'react-native-material-ui';
import { retryDo } from '../../kit';
import { Store } from '../../store';
import { addArticle, req, updateArticle } from '../../store/web';
import { ICON_BLUE } from '../base/color';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../base/kit';
import WebView from '../base/WebView';
import Router from '../Router';
const cheerio: CheerioAPI = require('react-native-cheerio');

interface Props {
	store?: Store;
	type: 'share' | 'feedback' | 'project';
	isEdit?: boolean;
	id?: number;
}

interface Draft {
	title: string;
	project: string | number;
	content: string;
}

@inject('store')
@observer
export default class AddArticle extends React.Component<Props> {
	@observable html = '';
	@observable loading = false;
	webview: WebView | null = null;
	readyFunctions: (() => void)[] = [];

	render() {
		return (
			<View style={styles.container}>
				<Toolbar
					leftElement={'arrow-back'}
					centerElement={`${this.props.isEdit ? '编辑' : '创建'}${this.props.type === 'project'
						? '项目'
						: this.props.type === 'share' ? '分享' : '反馈'}`}
					onLeftElementPress={async () => {
						await this.saveDraft();
						Router.pop();
					}}
					style={{ container: { backgroundColor: ICON_BLUE } }}
				/>
				<View style={{ flex: 1 }}>
					<WebView
						ref={(r) => (this.webview = r)}
						source={{ html: this.html, baseUrl: 'http://www.jfinal.com' }}
						on={this.onWebViewPostMsg}
						handler={this.webviewHandler}
					/>
				</View>
				<ActivityIndicator animating={this.loading} style={styles.loading} color={ICON_BLUE} />
			</View>
		);
	}

	onWebViewPostMsg = async (payload: any) => {
		if (payload.action === 'ready') {
			this.loading = false;
			for (let f of this.readyFunctions) f();
			this.readyFunctions.splice(0, this.readyFunctions.length);
		} else if (payload.action === 'submit') {
			Toast.loading('保存中..', 0);
			let ret;
			if (this.props.isEdit) {
				ret = await updateArticle(
					this.props.type,
					this.props.id!,
					payload.article.title,
					payload.article.content,
					payload.article.project
				);
			} else {
				ret = await addArticle(
					this.props.type,
					payload.article.title,
					payload.article.content,
					payload.article.project
				);
			}
			Toast.hide();
			if (ret.isOk) {
				this.props.store!.localStorage.remove({ key: 'draft', id: this.props.type });
				this.props.store!.emitEditArticleOk(this.props.type);
				Router.pop();
			} else {
				Toast.fail(ret.get('msg'));
			}
		}
	};

	fetchArticle = async () => {
		if (this.loading)
			return await new Promise((resolve) => {
				this.readyFunctions.push(async () => {
					resolve(await this.webview!.post({ action: 'get' }));
				});
			});
		else return await this.webview!.post({ action: 'get' });
	};

	saveDraft = async () => {
		if (this.props.isEdit || this.loading) return;
		const localStore = this.props.store!.localStorage;
		await localStore.save({ key: 'draft', id: this.props.type, data: await this.fetchArticle() });
	};

	loadDraft = async (draft?: Draft) => {
		const localStore = this.props.store!.localStorage;
		const f = async () => {
			try {
				if (draft) {
					this.webview!.post({ action: 'loadDraft', draft });
				} else {
					draft = await localStore.load({ key: 'draft', id: this.props.type });
					if (draft) this.webview!.post({ action: 'loadDraft', draft });
				}
			} catch (e) {}
		};
		if (this.loading) this.readyFunctions.push(f);
		else await f();
	};

	webviewHandler = `function(msg){ 
		if (msg.action === 'get'){
			var title = $("#title").val().trim(); 
			var project = $("#project").val(); 
			var content = editor.getValue(); 
			if (project){
				project = Number.parseInt(project); 
			}
			return {title: title, project: project, content: content}; 
		}else if (msg.action === 'loadDraft'){
			$(document).ready(function(){
				var draft = msg.draft; 
				$("#title").val(draft.title);
				$("#project").val(draft.project.toString());
				editor.setValue(draft.content); 
			});
		}
	}`;

	htmlBuild(projects: [string, number][] = []) {
		return `
		<!DOCTYPE html>
		<html>
		<link href="https://cdn.bootcss.com/amazeui/2.7.2/css/amazeui.min.css" rel="stylesheet">
		<link href="https://cdn.bootcss.com/simditor/2.3.6/styles/simditor.min.css" rel="stylesheet">

		<script src="https://cdn.bootcss.com/jquery/2.2.4/jquery.min.js"></script>
		<!--<script src="https://simditor.tower.im/assets/scripts/mobilecheck.js"></script>-->
		<script>
			window.mobilecheck = function() {
				var check = false;
				(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
				return check; }
		</script>
		<style>
		
		</style>
		<body>

		<div class="am-form" >
			<fieldset  >
				${this.props.type === 'project'
					? `
				<div class="am-form-group">
					<label for="project">名称</label>
					<input type="text" class="" id="project">
				</div>
				`
					: ``}	
				<div class="am-form-group">
					<label for="title">标题</label>
					<input type="text" class="" id="title">
				</div>			
				${this.props.type === 'project'
					? ``
					: `
				<div class="am-form-group">
					<label for="project">关联项目</label>
					<select id="project">
						<option value="">请选择</option>
						${projects.reduce((prev, curr) => prev + `<option value="${curr[1]}">${curr[0]}</option>`, '')}
					</select>
					<span class="am-form-caret"></span>
				</div>
				`}				
				<div class="am-form-group">
					<label for="content">正文</label>
					<textarea id="content"></textarea>
				</div>          
				<button id="submit" class="am-btn am-btn-primary">提交</button>
			</fieldset>
		</div>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/simple-module/2.0.6/simple-module.js"></script>
		<script src="https://cdn.bootcss.com/mycolorway-simple-hotkeys/1.0.3/hotkeys.min.js"></script>
		<script src="https://cdn.bootcss.com/simditor/2.3.6/lib/simditor.min.js"></script>
		<script>
			$(document).ready(function () {
				try{
					window.editor = new Simditor({
						textarea: $('#content'),
						toolbar: [
							'title',
							'bold',
							'italic',
							'underline',
							'strikethrough',
							'fontScale',
							'color',
							'ol',
							'ul',
							'blockquote',
							'code',
							'table',
							'link',
							'image',
							'hr',
							'indent',
							'outdent',
							'alignment',
						], 
					});
				}catch(e){}
				$("#submit").click(function(){ 
					var title = $("#title").val().trim(); 
					var project = $("#project").val().trim(); 
					var content = editor.getValue(); 
					if (title.length < 3 || title.length > 100){
						alert("标题长度要求在3到100个字符"); 
						return; 
					}
					if (!project){
						alert("请选择关联项目"); 
						return; 
					}
					if (${this.props.type !== 'project'})
						project = Number.parseInt(project); 
					send({action:"submit", article: { title: title, project: project, content: content }})
						.then(function(result){

						}); 
				}); 

				var f = function(f){
					if (window.send){
						window.send({ action: "ready" }); 
					}else{
						setTimeout(function(){
							f(f); 
						}, 100);
					}
				}
				f(f);
			});
		</script>
		</body>
		</html>
		`;
	}

	componentDidMount() {
		action(async () => {
			this.loading = true;
			if (this.props.isEdit)
				try {
					const html = await retryDo(
						async () => await req.GET_HTML(`/my/${this.props.type}/edit?id=${this.props.id}`),
						3
					);
					const $ = cheerio.load(html);
					const draft: Draft = { title: '', content: '', project: '' };
					draft.title = $(`input[name="${this.props.type}.title"]`).attr('value');
					draft.content = $(`script[name="${this.props.type}.content"]`).html()!;
					if (this.props.type === 'project') {
						draft.project = $(`input[name="${this.props.type}.name"]`).attr('value');
						this.html = this.htmlBuild();
					} else {
						draft.project = Number.parseInt($('.related-project-name option[selected]').attr('value'));
						this.html = this.htmlBuild(
							$('.related-project-name').find('option').toArray().slice(1).map((elem): [
								string,
								number
							] => {
								return [ $(elem).text(), Number.parseInt($(elem).attr('value')) ];
							})
						);
					}
					this.loadDraft(draft);
				} catch (e) {
					Toast.fail('网络异常！');
				}
			else
				try {
					if (this.props.type === 'project') {
						this.html = this.htmlBuild();
					} else {
						const html = await retryDo(async () => await req.GET_HTML('/my/share/add'), 3);
						const $ = cheerio.load(html);
						this.html = this.htmlBuild(
							$('.related-project-name').find('option').toArray().slice(1).map((elem): [
								string,
								number
							] => {
								return [ $(elem).text(), Number.parseInt($(elem).attr('value')) ];
							})
						);
					}
					this.loadDraft();
				} catch (e) {
					Toast.fail('网络异常！');
				}
		})();
		setTimeout(async () => {
			if (this.loading) {
				const info = await NetInfo.getConnectionInfo();
				if ((info.type === 'unknown' || info.type === 'none') && this.loading) {
					this.loading = false;
					Toast.fail('网络异常', 2);
					Router.pop();
				} else this.onWebViewPostMsg({ action: 'ready' });
			}
		}, 1000 * 15);
		BackHandler.addEventListener('hardwareBackPress', this.onBack);
	}

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.onBack);
	}

	onBack = async () => {
		if (!this.loading) await this.saveDraft();
		Router.pop();
	};
}

const styles = StyleSheet.create({
	container: { flex: 1 } as ViewStyle,
	loading: {
		position: 'absolute',
		width: SCREEN_WIDTH,
		height: SCREEN_HEIGHT,
		justifyContent: 'center',
		alignItems: 'center'
	} as ViewStyle
});
