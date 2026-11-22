<template>
  <v-app class="review-public">
    <v-main>
      <v-container class="d-flex align-center justify-center">
        <v-card class="pa-6 pa-sm-8" width="460">
          <template v-if="error.statusCode === 404 && $route.path.startsWith('/call/')">
            <h1>Call not found.</h1>
            <v-btn class="mt-4" color="primary" to="/calls">Go back to Calls</v-btn>
          </template>
          <template v-else>
            <h1>{{ error.statusCode === 404 ? pageNotFound : otherError }}</h1>
            <v-btn class="mt-4" color="primary" to="/">Home page</v-btn>
          </template>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  layout: "empty",
  props: {
    error: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      pageNotFound: "404 Not Found",
      otherError: "An error occurred",
    };
  },
  head() {
    // @ts-ignore
    const title =
      this.error.statusCode === 404 ? (this as any).pageNotFound : (this as any).otherError;
    return {
      title,
    };
  },
});
</script>

<style scoped>
h1 {
  font-size: 20px;
}
</style>
