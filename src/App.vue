<template>
  <div id="app">
    <header>
      <h1>{{ currentUserFullName }}</h1>
    </header>
    <select-uniqueId v-if="!uniqueIdAlreadySelected" @input="onUniqueIdSelection" />
    <chat v-else />
  </div>
</template>

<script>
import SelectUniqueId from "./components/SelectUniqueId"; // Corrected component name
import Chat from "./components/Chat";
import socket from "./socket";

export default {
  name: "App",
  components: {
    Chat,
    SelectUniqueId,
  },
  data() {
    return {
      uniqueIdAlreadySelected: false,
      currentUserFullName: "", // New data property for the current user's name
    };
  },
  methods: {
    onUniqueIdSelection(uniqueId) {
      console.log('> HERE ===========================================uniqueId', uniqueId);
      this.uniqueIdAlreadySelected = true;
      socket.auth = { uniqueId };
      socket.connect();
    },
  },
  created() {
    const uniqueId = localStorage.getItem("uniqueId");
    const userType = localStorage.getItem("userType");
    const fullName = localStorage.getItem("fullName");

    if (uniqueId && userType && fullName) {
      this.uniqueIdAlreadySelected = true;
      this.currentUserFullName = fullName; // Set current user's name
      socket.auth = { uniqueId, userType, fullName };
      socket.connect();
    }

    socket.on("session", ({ uniqueId, userType, fullName }) => {
      // attach the session ID to the next reconnection attempts
      socket.auth = { uniqueId, userType, fullName };
      if (userType === "expert") {
        document.body.classList.add("expert-body");
      } else {
        document.body.classList.remove("expert-body");
      }
      this.currentUserFullName = fullName; // Update current user's name
      // store it in the localStorage
      localStorage.setItem("uniqueId", uniqueId);
      localStorage.setItem("userType", userType);
      localStorage.setItem("fullName", fullName);
      // save the ID of the user
    });

    socket.on("connect_error", (err) => {
      console.log('> HERE ===================================Error ========',);
      if (err.message === "invalid username") {
        this.uniqueIdAlreadySelected = false;
      }
    });
  },
  destroyed() {
    socket.off("connect_error");
  },
};
</script>

<style>
body {
  margin: 0;
  background-color: #E1F7F5;
  color: black !important;
}

.expert-body {
  background-color: #fd4747 !important;
  /* Red background color for expert */
}
@font-face {
  font-family: Lato;
  src: "~/public/fonts/Lato-Regular.ttf";
}

#app {
  font-family: Lato, Arial, sans-serif;
  font-size: 17px;
  }
  
  header {
    background-color: #333;
    color: white;
    padding: 10px;
    text-align: center;
  }
  
  header h1 {
    margin: 0;
    text-align: center;
}
</style>
