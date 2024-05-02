<template>
  <div class="user" @click="onClick" :class="{ selected: selected }">
    <div class="description">
      <div class="name">
        {{ user.fullName }} {{ user.self ? " (yourself)" : "" }}
      </div>
      <div class="status">
        <status-icon :connected="user.connected" />{{ status }}
        <status-icon :connected="!user.isBusy" />{{ busyStatus }}
      </div>
    </div>
    <div v-if="user.hasNewMessages" class="new-messages">🔴</div>
  </div>
</template>

<script>
import StatusIcon from "./StatusIcon";
export default {
  name: "User",
  components: { StatusIcon },
  props: {
    user: Object,
    selected: Boolean,
  },
  methods: {
    onClick() {
      this.$emit("select");
    },
  },
  computed: {
    status() {
      return this.user.connected ? "online" : "offline";
    },
    busyStatus() {
      return this.user.isBusy ? "busy" : "available";
    }
  },
};
</script>

<style scoped>
.selected {
  background-color: #F2F5F8;
}

.user {
  padding: 10px;
  display: flex;
    /* Add flexbox display */
    align-items: center;
    /* Center items vertically */
    justify-content: space-between;
    /* Distribute space between items */
}
.busy-status {
  color: #ff7a52;
  display: inline;
}
.description {
  display: inline-block;
}

.status {
  color: #55be00;
}

.new-messages {
  color: red;
  background-color: transparent;
  width: 30px;
  border-radius: 5px;
  text-align: center;
  font-size: 25px;
}
</style>
