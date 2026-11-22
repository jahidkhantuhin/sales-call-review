<template>
  <div v-if="user" class="project-profile">
    <v-card outlined>
      <div class="project-profile-header">
        <v-avatar size="64" class="project-profile-avatar">
          {{ (user.first_name || '').charAt(0) }}{{ (user.last_name || '').charAt(0) }}
        </v-avatar>
        <div class="project-profile-identity">
          <h1>{{ user.first_name }} {{ user.last_name }}</h1>
          <span v-if="user.role" class="review-badge review-badge--role">{{ user.role }}</span>
        </div>
        <v-btn color="primary" depressed :loading="openingEditor" @click="handleEditRequest">
          <v-icon left small>mdi-pencil-outline</v-icon>
          Edit profile
        </v-btn>
      </div>
      <v-card-text class="project-profile-details">
        <h2>Account details</h2>
        <dl>
          <div><dt>First name</dt><dd>{{ user.first_name }}</dd></div>
          <div><dt>Last name</dt><dd>{{ user.last_name }}</dd></div>
          <div><dt>Email</dt><dd>{{ user.email }}</dd></div>
        </dl>
      </v-card-text>
    </v-card>
    <v-navigation-drawer v-model="dialog" class="review-profile-drawer" width="420" fixed right temporary>
      <v-toolbar flat>
        <v-toolbar-title>Edit profile</v-toolbar-title>
        <v-spacer />
        <v-btn icon aria-label="Close profile editor" @click="dialog = false"><v-icon>mdi-close</v-icon></v-btn>
      </v-toolbar>
      <UserForm :editid="user.id" :ignore-fields="['role_id']" @done="handleDone" @close="dialog = false" />
    </v-navigation-drawer>
  </div>
</template>

<script lang="ts">
import UserForm from "~/components/forms/UserForm.vue";
import Vue from "vue";
export default Vue.extend({
  middleware: "auth",
  head: {
    title: "Profile",
  },
  data: () => ({
    dialog: false,
    openingEditor: false,
  }),
  components: {
    UserForm,
  },
  methods: {
    handleDone() {
      this.dialog = false;
      this.$auth.fetchUser();
    },
    async handleEditRequest() {
      this.openingEditor = true;
      try {
        await this.$store.dispatch("users/fetchSingle", this.user?.id);
        this.dialog = true;
      } finally {
        this.openingEditor = false;
      }
    },
  },
  computed: {
    user() {
      return this.$auth.user;
    },
  },
  mounted() {
    this.$store.commit("setPageTitle", "Profile")
  }
});
</script>
