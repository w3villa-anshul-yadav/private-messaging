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
  name: "SelectuniqueId",
  data() {
    return {
      uniqueId: "",
    };
  },
  computed: {
    isValid() {
      return this.uniqueId.length > 2;
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
