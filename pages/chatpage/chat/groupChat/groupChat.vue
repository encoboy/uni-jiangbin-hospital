<template>
	<view class="chatInterface" >
		<image class="group-icon" src="/static/images/group-icon.png" @click="showMembers" />
		<view class="scroll-view">
			<view class="all-history-loaded">
				{{allHistoryLoaded ? '已经没有更多的历史消息' : '下拉获取历史消息'}}
			</view>
			<view v-for="(message,index) in messages || []" :key="message.messageId">

				<!--				时间显示，类似于微信，隔5分钟不发言，才显示时间		-->
				<view class="time-lag">
					{{renderMessageDate(message, index)}}
				</view>

				<view class = "message-item" :class="{'self' : message.senderId == (currentUser && currentUser.uuid)}">
					<view class="avatar">
						<image :src="currentUser.avatar" v-if="message.senderId == currentUser && currentUser.uuid"></image>
						<image :src="groupMembers[message.senderId].avatar" v-else></image>
					</view>
					<view class="content">
						<view v-html="renderTextMessage(message)"></view>
						<image class="image-content" v-if="message.type == 'image'" :src="message.payload.url" :data-url="message.payload.url" @click="showImageFullScreen" mode="widthFix"></image>
						<view class="video-snapshot"  v-if="message.type == 'video'" :data-url="message.payload.video.url" @click="playVideo">
							<image :src="message.payload.thumbnail.url" mode="aspectFit"></image>
							<view class="video-play-icon"></view>
						</view>
						<GoEasyAudioPlayer v-if="message.type =='audio'" :src="message.payload.url" :duration="message.payload.duration" />
						<view class="custom-message" v-if="message.type == 'order'">
							<view class="title">
								<image src="@/static/images/dingdan.png"></image>
								<text>自定义消息</text>
							</view>
							<view class="custom-message-item">编号：{{message.payload.number}}</view>
							<view class="custom-message-item">商品: {{message.payload.goods}}</view>
							<view class="custom-message-item">金额: {{message.payload.price}}</view>
						</view>
					</view>
				</view>
			</view>
<!--			发送中的消息-->
			<view v-for="(message, index) in pendingMessages || []"
				  :key="index"
				  class = "message-item"
				  :class="{'self' : message.senderId == (currentUser && currentUser.uuid)}">
				<view class="avatar">
					<image :src="currentUser.avatar" v-if="message.senderId == currentUser && currentUser.uuid"></image>
					<image :src="groupMembers[message.senderId].avatar" v-else></image>
				</view>
				<view class="content">
					<b class="pending"></b>
					<view v-html="renderTextMessage(message)"></view>
					<image class="image-content" v-if="message.type == 'image'" :src="message.payload.url" @load="scrollToBottom" mode="widthFix"></image>
					<view class="video-snapshot" v-if="message.type == 'video'">
						<video :src="message.payload.video.url"></video>
						<view class="video-play-icon"></view>
					</view>
					<GoEasyAudioPlayer v-if="message.type =='audio'" :src="message.payload.url" :duration="message.payload.duration" />
					<view class="custom-message" v-if="message.type == 'order'">
						<view class="title">
							<image src="@/static/images/dingdan.png"></image>
							<text>自定义消息</text>
						</view>
						<view class="custom-message-item">编号：{{message.payload.number}}</view>
						<view class="custom-message-item">商品: {{message.payload.goods}}</view>
						<view class="custom-message-item">金额: {{message.payload.price}}</view>
					</view>
				</view>
			</view>
		</view>
		<view class="action-box" v-if="!video.visible">
			<view class="action-top">
				<view :class="[audio.visible ? 'record-icon record-open':'record-icon']" @click="switchAudioKeyboard"></view>
				<view class="record-input" @touchstart="onRecordStart" @touchend="onRecordEnd" v-if="audio.visible" >{{audio.recording ? '松开发送' : '按住录音'}}</view>
				<view class="message-input" v-else>
					<input type="text" placeholder="发送消息" v-model="content" @focus="messageInputFocusin">
				</view>
				<view class="file-icon emoji-icon" @click="showEmoji"></view>
				<view class="file-icon more-icon" @click="showMore"></view>
				<span class="send-message-btn" @click="sendMessage">发送</span>
			</view>
			<view class="action-bottom" v-if="emoji.show">
				<image class="emoji-item" v-for="(emojiItem, key, index) in emoji.map" :key="index" :src="emoji.url + emojiItem" @click="selectEmoji(key)" ></image>
			</view>
			<!--			更多-->
			<view class="action-bottom" v-if="more.show">
				<view class="more-item" @click="sendImage">
					<image src="@/static/images/tupian.png"></image>
					<text>图片</text>
				</view>
				<view class="more-item" @click="sendVideo">
					<image src="@/static/images/shipin.png"></image>
					<text>视频</text>
				</view>
				<view class="more-item" @click="showCustomMessageForm">
					<image src="@/static/images/zidingyi.png"></image>
					<text>自定义消息</text>
				</view>
			</view>
		</view>
		<view class="record-loading" v-if="audio.recording"></view>
		<video :src="video.url" v-if="video.visible" id="videoPlayer" autoplay="true" @fullscreenchange="onVideoFullScreenChange"  @play="onVideoPlayStart"></video>
	</view>
</template>

<script>
	import GoEasyAudioPlayer from "@/components/GoEasyAudioPlayer/GoEasyAudioPlayer";
	const recorderManager = uni.getRecorderManager();
	import EmojiDecoder from "@/lib/EmojiDecoder";

	export default {
		name: "groupChat",
		components : {
			GoEasyAudioPlayer,
		},
		data () {

			// 定义表情
			let emojiUrl = 'https://imgcache.qq.com/open/qcloud/tim/assets/emoji/';
			let emojiMap = {
				'[么么哒]': 'emoji_3@2x.png',
				'[乒乓]': 'emoji_4@2x.png',
				'[便便]': 'emoji_5@2x.png',
				'[信封]': 'emoji_6@2x.png',
				'[偷笑]': 'emoji_7@2x.png',
				'[傲慢]': 'emoji_8@2x.png'
			};


			return {
				//聊天文本框
				content: '',
				group:null,
				currentUser: null,

				//群成员
				groupMembers : {},
				//已经接收到的消息
				messages: [],
				//正在发送中的消息
				pendingMessages : [],
				//已经加载完所有历史消息
				allHistoryLoaded: false,
				emoji : {
					url : emojiUrl,
					map : emojiMap,
					show : false,
					decoder : new EmojiDecoder(emojiUrl,emojiMap)
				},
				more : {//更多按钮
					show : false
				},
				audio : {
					//语音录音中
					recording : false,

					//录音按钮展示
					visible : false
				},
				video : {
					visible : false,
					url : '',
					context : null
				},
				imService : null
			}
		},
		onReady () {
			this.video.context = uni.createVideoContext('videoPlayer');
		},
		onShow () {
			this.more.show = false;
			this.emoji.show = false;
		},
		watch : {
			pendingMessages(){
				this.scrollToBottom()
			}
		},
		onLoad(options) {

			this.imService = getApp().globalData.imService;
			if(!this.imService || !this.imService.currentUser){
				uni.navigateTo({
					url : '../../login/login'
				});
				return
			}
			//对话数据
			this.group = JSON.parse(options.group);
			this.currentUser = this.imService.currentUser;
			let privateMessages = this.imService.getGroupMessages(this.group.uuid);
			this.messages = privateMessages.sentMessages;
			this.pendingMessages = privateMessages.pendingMessages;
			this.groupMembers = this.imService.getGroupMembers(this.group.uuid);
			uni.setNavigationBarTitle({
				title : this.group.name + "（" + Object.keys(this.groupMembers).length + "）"
			});
			
			this.initialListeners();

			
			//每次进入聊天页面，总是滚动到底部
			this.scrollToBottom()

			if(this.messages.length !=0){
				this.imService.markGroupMessageAsRead(this.group.uuid);
			}
		},
		onPullDownRefresh: function(e) {
			this.loadMoreHistoryMessage()
		},
		onUnload() {
			//退出聊天页面之前，清空页面传入的监听器
			this.imService.onNewGroupMessageReceive = function () {};
		},
		methods : {
            //渲染文本消息，如果包含表情，替换为图片
            //todo:本不需要该方法，可以在标签里完成，但小程序有兼容性问题，被迫这样实现
            renderTextMessage(message) {
                if (message.type === 'text') {
                    return '<span class="text-content">' + this.emoji.decoder.decode(message.payload.text) + '</span>'
                }
                return ''
            },

            //像微信那样显示时间，如果有几分钟没发消息了，才显示时间
            //todo:本不需要该方法，可以在标签里完成，但小程序有兼容性问题，被迫这样实现
            renderMessageDate(message, index) {
                if (index === 0) {
                    return this.formatDate(message.timestamp)
                } else {
                    if (message.timestamp - this.messages[index - 1].timestamp > 5 * 60 * 1000) {
                        return this.formatDate(message.timestamp)
                    }
                }
                return ''
            },

            initialListeners(){
				//传入监听器，收到一条私聊消息总是滚到到页面底部
				this.imService.onNewGroupMessageReceive =  (groupId, message)=> {
					if (groupId == this.group.uuid) {
						this.imService.markGroupMessageAsRead(groupId);
						//收到新消息，是滚动到最底部
						this.scrollToBottom();
					}
				};
				
				// 录音监听器
				this.initRecorderListeners();
			},
			initRecorderListeners(){
				var self = this;
				// 监听录音开始
				recorderManager.onStart(function(){
					console.log("onStart");
					self.audio.recording = true;
				});
				
				//录音结束后，发送
				recorderManager.onStop(function(res){
					console.log("onStop");
					self.audio.recording = false;
					self.imService.sendGroupAudioMessage(self.group.uuid, res)
				});
				
				// 监听录音报错
				recorderManager.onError(function(res){
					console.log("录音报错：",res);
				})
			},
			sendMessage () {//发送消息
				if(this.content.trim() != "") {
					this.imService.sendGroupTextMessage(this.group.uuid, this.content);
				}
				this.content = "";
				this.scrollToBottom()
			},
			loadMoreHistoryMessage () {//历史消息
				let lastMessageTimeStamp = Date.now();
				let lastMessage = this.messages[0];
				if (lastMessage) {
					lastMessageTimeStamp = lastMessage.timestamp;
				}
                var currentLength = this.messages.length;
				let promise = this.imService.loadGroupHistoryMessage(this.group.uuid, lastMessageTimeStamp);
				promise.then(messages => {
					if (messages.length == currentLength) {
						this.allHistoryLoaded = true;
					}
					this.messages = messages;
					uni.stopPullDownRefresh();
				}).catch(e => {
                    console.log(e)
                    uni.stopPullDownRefresh();
                  })
			},
			showMembers () {//显示群成员
				uni.navigateTo({
					url : '../groupChat/member?users=' + JSON.stringify(this.groupMembers)
				})
			},
			onRecordStart () {
				try{
					recorderManager.start();
				}catch(e){
					console.log("e:",e);
					uni.showModal({
						title: '录音错误',
						content : '请在app和小程序端体验录音，Uni官方明确H5不支持getRecorderManager, 详情查看Uni官方文档'
					});
				}
			},
			onRecordEnd () {
				try{
					recorderManager.stop();
				}catch(e){
					console.log("e:",e);
					uni.showModal({
						title: '录音错误',
						content : '请在app和小程序端体验录音，Uni官方明确H5不支持getRecorderManager, 详情查看Uni官方文档'
					});
				}
			},
			sendVideo () {//发送文件
				uni.chooseVideo({
					success : (res) => {
						this.imService.sendGroupVideoMessage(this.group.uuid, res)
					}
				})
			},
			sendImage() {
				uni.chooseImage({
					count :1,
					success :(res) => {
						this.imService.sendGroupImageMessage(this.group.uuid,res);
					}
				})
			},
			showImageFullScreen (e) {
				var imagesUrl = [e.currentTarget.dataset.url];
				uni.previewImage({
					urls: imagesUrl
				});
			},
			//语音录制按钮和键盘输入的切换
			switchAudioKeyboard() {
				this.audio.visible = !this.audio.visible;
			},
			playVideo (e) {
				this.video.visible = true;
				this.video.url = e.currentTarget.dataset.url;
			},
			onVideoPlayStart () {
				this.video.context.requestFullScreen({
					direction : 0
				});
			},
			onVideoFullScreenChange (e) {
				//当退出全屏播放时，隐藏播放器
				if(this.video.visible && !e.detail.fullScreen){
					this.video.visible = false;
					this.video.context.stop();
				}
			},
			messageInputFocusin () {
				this.more.show = false;
				this.emoji.show = false
			},
			showEmoji () {
				this.emoji.show = !this.emoji.show;
				this.more.show = false;
			},
			showMore () {
				this.more.show = !this.more.show;
				this.emoji.show = false
			},
			selectEmoji (emojiKey) {
				this.content +=emojiKey
			},
            showCustomMessageForm () {
				let messageTarget = {
					type : 'group',
					id : this.group.uuid
				};
				uni.navigateTo({
					url : '../customMessage/customMessage?messageTarget=' + JSON.stringify(messageTarget)
				})
			},
			scrollToBottom () {
				this.$nextTick(function(){
					uni.pageScrollTo({
						scrollTop: 2000000,
						duration : 10
					})
				})
			}
		}
	}
</script>

<style>

</style>
