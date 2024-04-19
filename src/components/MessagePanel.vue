<template>
  <div class="container clearfix">
    <div class="chat">
      <div class="chat-header clearfix">
        <img
          src="https://storage.googleapis.com/wwm-staging/user/avatar/eea060277eb38420-7ab230acafa36d967ba7e0975345c24d.svg"
          alt="avatar" />
        <div class="chat-about">
          <div class="chat-with">Chat with {{ user.fullName }}</div>
          <div class="chat-num-messages">already {{ user.messages.length }} messages</div>
        </div>
        <i class="fa fa-star"></i>
      </div>

      <div class="chat-history" ref="chatHistory">
        <ul>
          <li v-for="(message, index) in user.messages" :key="index"
            :class="{ 'clearfix': !message.fromSelf, 'align-left': message.fromSelf }">
            <div class="message-data">
              <span class="message-data-name" :class="{ 'me': message.fromSelf, 'online': user.connected }">{{
                message.fromSelf ? 'You' : user.fullName }}</span>
              <span class="message-data-time">{{ message.time }}</span>
            </div>
            <div class="message" :class="{ 'my-message': message.fromSelf, 'other-message': !message.fromSelf }">
              {{ message.content.content }}
            </div>
          </li>
        </ul>
      </div>

      <div class="chat-message clearfix">
        <textarea v-model="input" name="message-to-send" id="message-to-send" placeholder="Type your message" rows="3"
          @keyup.enter="onSubmit"></textarea>
        <button @click="onSubmit">Send</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "MessagePanel",
  props: {
    user: Object,
  },
  data() {
    return {
      input: "",
    };
  },
  methods: {
    onSubmit() {
      if (this.input.trim() !== "") {
        this.$emit("input", {
          content: this.input.trim(),
          fromSelf: true,
          time: new Date().toLocaleTimeString(),
        });
        this.input = "";
      }
    },
    scrollToBottom() {
      setTimeout(() => {
        this.$refs.chatHistory.scrollTop = this.$refs.chatHistory.scrollHeight;
      }, 100); // Adjust the delay as needed
    },
  },
  watch: {
    'user.messages': {
      handler() {
        this.scrollToBottom();
      },
      deep: true,
    },
  },
};
</script>

<style scoped>
/* Add your scoped styles here */
.container {
  margin: 0 auto;

  background: #444753;
  border-radius: 5px;
}

.chat {
  width: 100%;
  float: left;
  background: #F2F5F8;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  color: #434651;
}

.chat .chat-header {
  padding: 20px;
  border-bottom: 2px solid white;
}

.chat .chat-header img {
  float: left;
}

.chat .chat-header .chat-about {
  float: left;
  padding-left: 10px;
  margin-top: 6px;
}

.chat .chat-header .chat-with {
  font-weight: bold;
  font-size: 16px;
}

.chat .chat-header .chat-num-messages {
  color: #92959E;
}

.chat .chat-header .fa-star {
  float: right;
  color: #D8DADF;
  font-size: 20px;
  margin-top: 12px;
}

.chat .chat-history {
  padding: 30px;
  border-bottom: 2px solid white;
  overflow-y: scroll;
  height: 575px;
}

.chat .chat-history .message-data {
  margin-bottom: 15px;
}

.chat .chat-history .message-data-time {
  color: #a8aab1;
  padding-left: 6px;
}

.chat .chat-history .message {
  padding: 18px 20px;
  line-height: 26px;
  font-size: 20px;
  border-radius: 7px;
  margin-bottom: 30px;
  width: 90%;
  position: relative;
}

.chat .chat-history .message:after {
  bottom: 100%;
  left: 7%;
  border: solid transparent;
  content: " ";
  height: 0;
  width: 0;
  position: absolute;
  pointer-events: none;
  border-bottom-color: #86BB71;
  border-width: 10px;
  margin-left: -10px;
}

.chat .chat-history .my-message {
  background: #86BB71;
}

.chat .chat-history .other-message {
  background: #94C2ED;
}

.chat .chat-history .other-message:after {
  border-bottom-color: #94C2ED;
  left: 93%;
}

.chat .chat-message {
  padding: 30px;
}

.chat .chat-message textarea {
  width: calc(100% - 150px);
  border: none;
  padding: 10px 20px;
  font-size: 14px;
  margin-bottom: 10px;
  border-radius: 5px;
  resize: none;
}

.chat .chat-message button {
  float: right;
  color: #1a1b1b;
  font-size: 16px;
  text-transform: uppercase;
  border: none;
  cursor: pointer;
  font-weight: bold;
  padding: 23px;
  border-radius: 5px;
  background: #86BB71;
}

.chat .chat-message button:hover {
  color: #75b1e8;
}

.online,
.offline,
.me {
  margin-right: 3px;
  font-size: 15px;
}

.online {
  color: #86BB71;
}

.offline {
  color: #E38968;
}

.me {
  color: #94C2ED;
}

.align-left {
  text-align: left;
}

.align-left {
  text-align: left;
}

.float-right {
  float: right;
}

.clearfix:after {
  visibility: hidden;
  display: block;
  font-size: 0;
  content: " ";
  clear: both;
  height: 0;
}
</style>
