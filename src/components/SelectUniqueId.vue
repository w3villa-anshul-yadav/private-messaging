<template>
  <div class="select-uniqueId">
    <form @submit.prevent="onSubmit">
      <input v-model="uniqueId" placeholder="Your uniqueId..." />
      <button :disabled="!isValid">Send</button>
    </form>
  </div>
</template>

<script>
export default {
  name: "SelectUniqueId",
  data() {
    return {
      uniqueId: "",
    };
  },
  computed: {
    isValid() {
      return this.uniqueId.length > 0; // Changed from 2 to 0 to allow any non-empty input
    },
  },
  methods: {
    onSubmit() {
      this.$emit("input", this.uniqueId);
    },
  },
};
</script>

<style scoped>
.select-uniqueId {
  width: 300px;
  margin: 200px auto 0;
}
</style>