import { takeItems, takeItems2, Item } from './kit';

test('takeItems', () => {
	const result = takeItems(html);
	expect(result.currPage).toEqual(1);
	expect(result.totalPage).toEqual(255);
	expect(result.items.length).toEqual(15);
	expect(result.items.map((item) => item.avatar)).toEqual([
		'/upload/avatar/18/94138.jpg',
		'/upload/avatar/8/44168.jpg',
		'/upload/avatar/4/23945.jpg',
		'/upload/avatar/2/10386.jpg',
		'/upload/avatar/2/10450.jpg',
		'/upload/avatar/x.jpg',
		'/upload/avatar/15/78318.jpg',
		'/upload/avatar/x.jpg',
		'/upload/avatar/18/94138.jpg',
		'/upload/avatar/18/92834.jpg',
		'/upload/avatar/x.jpg',
		'/upload/avatar/11/59351.jpg',
		'/upload/avatar/7/36973.jpg',
		'/upload/avatar/x.jpg',
		'/upload/avatar/7/36973.jpg'
	]);
	expect(result.items.map((item) => item.title)).toEqual([
		'JFinal的if和Vue的if冲突了',
		'Db.update中, 创建表user_del表like user表',
		'getModel方式传值时，参数不能多吗？',
		'jfinal 发布到tomcat使用共享目录中的jar问题',
		'微信qq登录JFinal官网分享不能上传图片',
		'eclipse启动jfinal项目 莫名其妙启动不了也不报错',
		'IDEA 报错 Process finished with exit code 100​',
		'页面找不到引用的js、css、图片是被拦截了么？',
		'获得Model对应的表名',
		'JFinal从oracle获取数据时报异常问题。',
		'jfinal 问题',
		'ContextPathHandler配置与锚点链接冲突解决？',
		'Httpkit.post请教',
		'项目使用redis存储session后，在controller拦截器执行方法后再次设置sessio',
		'Httpkit 能指定超时时间吗？'
	]);
});

test('takeItems2', () => {
	const result = takeItems2(html);
	expect(result.currPage).toEqual(1);
	expect(result.totalPage).toEqual(255);
	const items: Item[] = [];
	for (let item of result.items) {
		items.push(item);
	}
	expect(items.length).toEqual(15);
	expect(items.map((item) => item.avatar)).toEqual([
		'/upload/avatar/18/94138.jpg',
		'/upload/avatar/8/44168.jpg',
		'/upload/avatar/4/23945.jpg',
		'/upload/avatar/2/10386.jpg',
		'/upload/avatar/2/10450.jpg',
		'/upload/avatar/x.jpg',
		'/upload/avatar/15/78318.jpg',
		'/upload/avatar/x.jpg',
		'/upload/avatar/18/94138.jpg',
		'/upload/avatar/18/92834.jpg',
		'/upload/avatar/x.jpg',
		'/upload/avatar/11/59351.jpg',
		'/upload/avatar/7/36973.jpg',
		'/upload/avatar/x.jpg',
		'/upload/avatar/7/36973.jpg'
	]);
	expect(items.map((item) => item.title)).toEqual([
		'JFinal的if和Vue的if冲突了',
		'Db.update中, 创建表user_del表like user表',
		'getModel方式传值时，参数不能多吗？',
		'jfinal 发布到tomcat使用共享目录中的jar问题',
		'微信qq登录JFinal官网分享不能上传图片',
		'eclipse启动jfinal项目 莫名其妙启动不了也不报错',
		'IDEA 报错 Process finished with exit code 100​',
		'页面找不到引用的js、css、图片是被拦截了么？',
		'获得Model对应的表名',
		'JFinal从oracle获取数据时报异常问题。',
		'jfinal 问题',
		'ContextPathHandler配置与锚点链接冲突解决？',
		'Httpkit.post请教',
		'项目使用redis存储session后，在controller拦截器执行方法后再次设置sessio',
		'Httpkit 能指定超时时间吗？'
	]);
});

const html = `

<!DOCTYPE html>
<html lang="zh-CN" xml:lang="zh-CN">
<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8">
	<meta name="renderer" content="webkit">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">

	<meta name="keywords" content="JFinal 反馈, JFinal Weixin 反馈, JFinal demo 反馈, JFinal 微信反馈, JFinal 案列反馈, JFinal 插件反馈, JFinal 教程反馈" />
	<meta name="description" content="JFinal 极速开发反馈集合, JFinal 学习资源反馈, JFinal 教程反馈, JFinal 案例反馈, JFinal 实战反馈" />
	<title>JFinal 极速开发反馈</title>

	<link rel="icon" type="image/x-icon" href="/assets/img/favicon.ico">
	<link rel="stylesheet" type="text/css" href="/assets/css/jfinal-com-v1.0.css?v=18">
    <link rel="stylesheet" type="text/css" href="/assets/css/jfinal-com-my-space-v1.0.css?v=18">
    <link rel="stylesheet" type="text/css" href="/assets/iconfont/iconfont.css">
</head>

<body>
<!-- 头部容器 -->
<div class="jf-header-box">
	<!-- logo容器 -->
	<h3 class="jf-logo-box">
		<a href="/" title="返回首页">JFinal</a>
	</h3>

	<!-- 导航菜单容器 -->
	<ul class="jf-nav-menu-box">
		<li><a href="/">首页</a></li>
		<li><a href="/doc">文档 </a></li>
		<li><a href="/project">项目</a></li>
		<li><a href="/share">分享</a></li>
		<li><a href="/feedback">反馈</a></li>
		<li><a href="/club">俱乐部</a></li>
		<li><a href="/donate">捐助</a></li>
	</ul>

		<!-- 登录用户工具栏容器 -->
		<div class="jf-user-toolbar-box">
			<!-- 登录用户图像 -->
			<a href="/my" class="jf-login-user-img">
				<img src="/upload/avatar/16/82497.jpg">
			</a>

			<!-- 登录用户下拉菜单 -->
			<span class="jf-login-user-dropdown-menu">
				<a href="/my">
					<span>fuchuan</span><i class="jf-caret-down"></i><!-- i class="fa fa-caret-down"></i -->
				</a>
				<ul class="jf-login-user-dropdown-menu-content">
					<li><a href="/my">我的空间</a></li>
                    <li><a href="/my/referMe">@提到我</a></li>
                    <li><a href="/my/message">我的私信</a></li>
					<li><a href="javascript:void(0);" onclick="logout();">退出登录</a></li>
				</ul>
			</span>
		</div>

</div>

<!-- 中部主体容器 -->
<div class="jf-body-box clearfix">
<!-- 内容容器 -->
<div class="jf-panel-box jf-pull-left">


	<!-- 项目 -->
	<div class="jf-panel">
		<h2 class="jf-panel-name">反馈</h2>
		<ul class="jf-panel-list">
				<li>
					<div class="jf-panel-img">
						<a href="/user/94138"><img src="/upload/avatar/18/94138.jpg"></a>
					</div>
					<div class="jf-panel-item">
						<h3><a href="/feedback/4447">JFinal的if和Vue的if冲突了</a></h3>
						<p>
							与Vue冲突的写法
						</p>
					</div>
				</li>
				<li>
					<div class="jf-panel-img">
						<a href="/user/44168"><img src="/upload/avatar/8/44168.jpg"></a>
					</div>
					<div class="jf-panel-item">
						<h3><a href="/feedback/4446">Db.update中, 创建表user_del表like user表</a></h3>
						<p>
							背景如下：假设有一张user表，现在想自动生成一张user_del表，用于保存历史数据，但是执行Db.update("create table \"user_del\"  (like  \"user\" )  ")时会报like 字段sq
						</p>
					</div>
				</li>
				<li>
					<div class="jf-panel-img">
						<a href="/user/23945"><img src="/upload/avatar/4/23945.jpg"></a>
					</div>
					<div class="jf-panel-item">
						<h3><a href="/feedback/4445">getModel方式传值时，参数不能多吗？</a></h3>
						<p>
							发现使用getModel方式传值插入数据时，参数只能等于或者少于数据库表结构的字段才能成功，如果参数多传了就会报The model attribute XX is not exists，导致无法插入，但有时可能需要同时向多个表插入数据，这
						</p>
					</div>
				</li>
				<li>
					<div class="jf-panel-img">
						<a href="/user/10386"><img src="/upload/avatar/2/10386.jpg"></a>
					</div>
					<div class="jf-panel-item">
						<h3><a href="/feedback/4444">jfinal 发布到tomcat使用共享目录中的jar问题</a></h3>
						<p>
							
						</p>
					</div>
				</li>
				<li>
					<div class="jf-panel-img">
						<a href="/user/10450"><img src="/upload/avatar/2/10450.jpg"></a>
					</div>
					<div class="jf-panel-item">
						<h3><a href="/feedback/4443">微信qq登录JFinal官网分享不能上传图片</a></h3>
						<p>
							在微信和qq里面打开JFinal官网，登录JFinal官网不能上传图片，按钮是灰色，现在大多数时候都是用手机的，不太方便，老大能不能处理一下：
						</p>
					</div>
				</li>
				<li>
					<div class="jf-panel-img">
						<a href="/user/74956"><img src="/upload/avatar/x.jpg"></a>
					</div>
					<div class="jf-panel-item">
						<h3><a href="/feedback/4442">eclipse启动jfinal项目 莫名其妙启动不了也不报错</a></h3>
						<p>
							昨天都可以启动,今天其他jfinal项目都可以启动,唯独这个项目一直定格在这个瞬间,也不报错 @
						</p>
					</div>
				</li>
				<li>
					<div class="jf-panel-img">
						<a href="/user/78318"><img src="/upload/avatar/15/78318.jpg"></a>
					</div>
					<div class="jf-panel-item">
						<h3><a href="/feedback/4441">IDEA 报错 Process finished with exit code 100​</a></h3>
						<p>
							win 10平台，Jfinal 3.4+Mysql5.7（32位）+IDEA,运行demo报错：Starting JFinal 3.4Starting web server on port: 802018-09-07 19:22:48[E
						</p>
					</div>
				</li>
				<li>
					<div class="jf-panel-img">
						<a href="/user/86164"><img src="/upload/avatar/x.jpg"></a>
					</div>
					<div class="jf-panel-item">
						<h3><a href="/feedback/4440">页面找不到引用的js、css、图片是被拦截了么？</a></h3>
						<p>
							求助一下，这个是被拦截了么？该怎么办呢？直接点击html打开是好的
						</p>
					</div>
				</li>
				<li>
					<div class="jf-panel-img">
						<a href="/user/94138"><img src="/upload/avatar/18/94138.jpg"></a>
					</div>
					<div class="jf-panel-item">
						<h3><a href="/feedback/4439">获得Model对应的表名</a></h3>
						<p>
							为了尽可能提高开发效率,按照自己的习惯写代码,进一步封装常见的sql查询,遇到1个问题.举一个例子通用的根据id删除方法(JFinal的deleteById是物理删除,不可取,delete非常慎重)public boolean delet
						</p>
					</div>
				</li>
				<li>
					<div class="jf-panel-img">
						<a href="/user/92834"><img src="/upload/avatar/18/92834.jpg"></a>
					</div>
					<div class="jf-panel-item">
						<h3><a href="/feedback/4438">JFinal从oracle获取数据时报异常问题。</a></h3>
						<p>
							从oracle中获取数据时报出异常，使用jdbc获取数据时已然获取到，但是在this.renderJson()返回时出现异常:
						</p>
					</div>
				</li>
				<li>
					<div class="jf-panel-img">
						<a href="/user/88580"><img src="/upload/avatar/x.jpg"></a>
					</div>
					<div class="jf-panel-item">
						<h3><a href="/feedback/4437">jfinal 问题</a></h3>
						<p>
							jfinal 能多个条件删除吗  比如：delete from t_car_types where carType='中巴' and cid = ?  能用jfinal吗    或者是除了主键删除就没有其他条件删除了吗  
						</p>
					</div>
				</li>
				<li>
					<div class="jf-panel-img">
						<a href="/user/59351"><img src="/upload/avatar/11/59351.jpg"></a>
					</div>
					<div class="jf-panel-item">
						<h3><a href="/feedback/4436">ContextPathHandler配置与锚点链接冲突解决？</a></h3>
						<p>
							通过配置路径变量的方式，实现同时兼容Tocmat和本地jetty开发的资源路径问题：(Handlers me) {   
						</p>
					</div>
				</li>
				<li>
					<div class="jf-panel-img">
						<a href="/user/36973"><img src="/upload/avatar/7/36973.jpg"></a>
					</div>
					<div class="jf-panel-item">
						<h3><a href="/feedback/4434">Httpkit.post请教</a></h3>
						<p>
							源内容为：&lt;li&gt;&lt;a href="http://www.ccgp-hubei.gov.cn//notice/201807/notice_45HEBfvJcPf6BMNL.html" target="_blank"&gt
						</p>
					</div>
				</li>
				<li>
					<div class="jf-panel-img">
						<a href="/user/17492"><img src="/upload/avatar/x.jpg"></a>
					</div>
					<div class="jf-panel-item">
						<h3><a href="/feedback/4433">项目使用redis存储session后，在controller拦截器执行方法后再次设置sessio</a></h3>
						<p>
							昨天分析了一晚上没找到原因，只好求助。项目开发部署环境：jfinal+tomc
						</p>
					</div>
				</li>
				<li>
					<div class="jf-panel-img">
						<a href="/user/36973"><img src="/upload/avatar/7/36973.jpg"></a>
					</div>
					<div class="jf-panel-item">
						<h3><a href="/feedback/4432">Httpkit 能指定超时时间吗？</a></h3>
						<p>
							默认的超时时间太短了，能否自己定义更长的时间呢
						</p>
					</div>
				</li>
		</ul>

		<!-- 分页 -->
<ul class="jf-paginate">
	<li><a href="javascript:void(0);" class="current-page">1</a></li>
	<li><a href="/feedback?p=2">2</a></li>
	<li><a href="/feedback?p=3">3</a></li>
	<li><a href="/feedback?p=4">4</a></li>
	<li><a href="/feedback?p=255">255</a></li>
	<li><a href="/feedback?p=2" class="next-page">&gt;</a></li>
</ul>

	</div>

</div>

<!-- 包含侧边栏文件 -->
<!-- 侧边栏容器 -->
<div class="jf-sidebar-box jf-pull-right">

	<!-- 侧边栏 -->
	<div class="jf-sidebar">
		<a href="/my/feedback/add" class="btn btn-primary btn-lg jf-sidebar-btn">我要反馈</a>
	</div>

<div class="jf-sidebar jf-adv-panel">

	<h4 class="jf-sidebar-name">赞助商<span class="jf-red-dot" style="margin-left: 15px;"></span></h4>

	<div class="jf-adv-panel-main">
		<a href="http://www.ukewo.cn/" target="_blank" rel="nofollow"
		title="优客服 - 开源的智能客服系统 + 呼叫中心"
		   time-limit="2018-06-20 0:0:0">优客服 - 开源的智能客服系统 + 呼叫中心</a>
	</div>
	
	
	<div class="jf-adv-panel-main">
		<a href="http://www.dbumama.com" target="_blank" rel="nofollow"
		style="background-color: #009688;"
		title="点步微拼团 - 专业的微信拼团软件"
		   time-limit="2018-07-20 0:0:0">点步微拼团 - 专业的微信拼团软件</a>
	</div>
	
	<div class="jf-adv-panel-main">
		<a href="http://www.layui.com/admin/" target="_blank" rel="nofollow"
		style="background-color: #252630"
		title="layuiAdmin - 通用后台管理模板"
		   time-limit="2018-07-26 0:0:0">layuiAdmin - 通用后台管理模板</a>
	</div>
	
</div>	
	<!-- 侧边栏 -->
	<div class="jf-sidebar">
		<h4 class="jf-sidebar-name">热门反馈</h4>
		<ul class="jf-sidebar-hot-list">
				<li><a href="/feedback/1946">JFinal API文档</a></li>
				<li><a href="/feedback/777">如何在微信里打开“weixin://...”这种链接</a></li>
				<li><a href="/feedback/4416">获取access_token时AppSecret错误，或者access_token无效</a></li>
				<li><a href="/feedback/2696">关于json值为null的处理</a></li>
				<li><a href="/feedback/4337">根据PathKit获取的路径动态写配置文件,PropKit.use却无法获取</a></li>
				<li><a href="/feedback/4195">jfinal跨域问题</a></li>
				<li><a href="/feedback/3878">jboot怎么集成skywalking？</a></li>
				<li><a href="/feedback/2313">分布式系统中Redis的Key过期监听事件如何防止重复处理</a></li>
				<li><a href="/feedback/3667">jpress 切换 the3模板，首页刷新后台报错</a></li>
				<li><a href="/feedback/3902">真的很想吐槽一下jboot或者kongfu这类自娱自乐的项目</a></li>
		</ul>
	</div>
	


<div class="jf-sidebar" style="text-align: center;min-height:250px;">
<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<!-- 300_600 -->
<ins class="adsbygoogle"
     style="display:inline-block;width:300px;height:600px"
     data-ad-client="ca-pub-7445243974946854"
     data-ad-slot="3534814315"></ins>
<script>
(adsbygoogle = window.adsbygoogle || []).push({});
</script>
</div>	
</div></div>

<!-- 底部容器 -->
<div class="jf-footer-box">
	<ul>
		<li><a href="/share/1" target="_blank">关于JFinal</a></li>
		<li><a href="javascript:void(0);">友情链接</a></li>
		<li><a href="http://git.oschina.net/jfinal/jfinal" target="_blank">开源中国git</a></li>
		<li><script src="http://s5.cnzz.com/z_stat.php?id=1000336597&web_id=1000336597" language="JavaScript"></script></li>
		
		<li><a href="http://www.miitbeian.gov.cn/" target="_blank">京ICP备10217229号-2</a></li>
		
	</ul>
</div>
<script type="text/javascript" src="/assets/jquery/jquery.min-v1.11.3.js"></script>
<script type="text/javascript" src="/assets/js/jfinal-com-v1.0.js?v=17"></script>
</body>
</html>

`;
