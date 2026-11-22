<template>
  <div>
    <section class="review-intro">
      <h1>Welcome back, {{ authenticatedUser && authenticatedUser.first_name }}</h1>
      <p class="mb-0">Review calls, check client activity, and track completed scoring.</p>
    </section>
    <v-row class="mt-3">
      <v-col v-if="$store.getters['users/isAllowed']('view calls')" cols="12" sm="6" lg="4">
        <v-card class="review-start-card">
          <v-card-title><v-icon left color="primary">mdi-phone-outline</v-icon> Call queue</v-card-title>
          <v-card-text>Filter calls by location, then open a call to listen or score it.</v-card-text>
          <v-card-actions><v-btn text color="primary" to="/calls">Open calls</v-btn></v-card-actions>
        </v-card>
      </v-col>
      <v-col v-if="$store.getters['users/isAllowed']('view clients')" cols="12" sm="6" lg="4">
        <v-card class="review-start-card">
          <v-card-title><v-icon left color="primary">mdi-domain</v-icon> Clients</v-card-title>
          <v-card-text>Browse client records and their account identifiers.</v-card-text>
          <v-card-actions><v-btn text color="primary" to="/clients">View clients</v-btn></v-card-actions>
        </v-card>
      </v-col>
      <v-col v-if="$store.getters['users/isAllowed']('score call')" cols="12" sm="6" lg="4">
        <v-card class="review-start-card">
          <v-card-title><v-icon left color="primary">mdi-chart-bar</v-icon> Score report</v-card-title>
          <v-card-text>Review scored calls, rating time, and payment totals by client.</v-card-text>
          <v-card-actions><v-btn text color="primary" to="/reports/score-report">Open report</v-btn></v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  middleware: [],
  head: {
    title: "Home",
  },
  computed: {
    authenticatedUser() {
      return this.$auth.user;
    },
  },
  mounted() {
    this.$store.commit("setPageTitle", "Home")
  },
});
</script>
