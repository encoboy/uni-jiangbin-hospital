uni-app
医生端~患者端——合并

api目录 处理api请求

common目录 自定义公共css样式

components 公共组件
	docTabbar 医生端的tabbar
	GoEasyAudioPlayer goeasyIM 处理音频组件
	GoEasyVideoPlayer goeasyIM 处理视频组件
	patTabbar 患者端的tabbar
	selectDate 自定义封装选择日期组件
	stan-ucharts ucharts图形(柱状图，条形图)组件
	uni-icons uniapp的icon样式
	userinfo 自定义用户信息组件
	
lib goeasyIM(聊天功能的第三方集成sdk)所需要的插件，api，服务等

pages 应用页面
	chatpage 聊天目录
		chat 聊天页面
		contacts 联系人页面
		conversations 会话页面
		mine 我的信息页面
	doctorpage 医生端目录
		home 首页
		register 注册页
		workdesk 工作台
	login 登录页面
	patientapge 患者端目录
		dataWrite 数据填报
		home 首页
		register 注册
		userCenter 用户中心
	
plugins 插件
	u-charts.min.js ucharts插件
static 静态资源目录
	images goeasyIM 页面需要的图片
	img 医生端需要的图片
	patientImg 患者端需要的图片
	style 全局样式
		iconfont 阿里图标库
		chantInterface.css goeasyIM的全局样式

unpackage 打包目录

util 工具目录

uview-ui uview UI框架


	