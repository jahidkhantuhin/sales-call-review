<template>
  <section class="project-public-screen">
    <v-card outlined class="project-public-card">
      <div class="project-public-brand">
        <v-icon small>mdi-phone-in-talk-outline</v-icon>
        <span>Sales Call Review</span>
      </div>
      <h1>Reset password</h1>
      <p class="project-public-description">Choose a new password for your account.</p>
      <ValidationObserver v-slot="{ invalid, handleSubmit }">
        <form class="project-public-form" @submit.prevent="handleSubmit(submit)">
          <v-text-field :value="email" label="Account email" type="email" outlined readonly hide-details />
          <ValidationProvider name="Password" vid="password" rules="required|strong_password|min:8" v-slot="{ errors }">
            <v-text-field v-model="password" label="New password" type="password" autocomplete="new-password" outlined :error-messages="errors" required />
          </ValidationProvider>
          <ValidationProvider name="Confirm Password" rules="required|strong_password|min:8|confirmed:password" v-slot="{ errors }">
            <v-text-field v-model="confirmPassword" label="Confirm password" type="password" autocomplete="new-password" outlined :error-messages="errors" required />
          </ValidationProvider>
          <v-btn type="submit" color="primary" depressed block large :loading="loading" :disabled="invalid">Reset password</v-btn>
          <nuxt-link class="project-public-link" to="/login">Back to sign in</nuxt-link>
        </form>
      </ValidationObserver>
      <p v-if="showcase" class="project-public-note">Demo reset for the sample account.</p>
      <recaptcha-powered v-else />
    </v-card>
  </section>
</template>

<script lang="ts">
import Vue from "vue";
import { VueReCaptcha } from "vue-recaptcha-v3";
const showcase = process.env.SHOWCASE_MODE === "true";
if (!showcase) {
  Vue.use(VueReCaptcha, {
    siteKey: "6LcELpgaAAAAADDGP5AS8HHKA3rIHT9uCSA0fzIk",
    loaderOptions: {
      autoHideBadge: true,
    },
  });
}

import RecaptchaPowered from "~/components/RecaptchaPowered.vue";
import showErrorOnXHRFail from "~/utils/showErrorOnXHRFail";
import {
  computed,
  defineComponent,
  ref,
  useRoute,
  useRouter,
  useStore,
} from "@nuxtjs/composition-api";
import swalMixin, { showToast } from "~/utils/swalMixin";

export default defineComponent({
  layout: "blank",
  components: {
    RecaptchaPowered,
  },
  name: "ResetPassword",
  head: {
    title: "Reset Password",
  },
  setup(props, { root, parent }) {
    const route = useRoute();

    const password = ref("");
    const email = computed(() => {
      const address = route.value.query.email;
      return typeof address === "string"
        ? address.replace(/ /g, "+")
        : showcase ? "jahid@example.test" : "";
    });
    const confirmPassword = ref("");
    const loading = ref(false);

    const router = useRouter();

    const $swal = swalMixin((parent as any).$swal as any);

    const translate = (text: string, params?: any): string =>
      (root as any).$t(text, params);

    const $axios = root.$axios;

    const submit = () => {
      loading.value = true;

      $axios
        .post("reset", {
          password: password.value,
          password_confirmation: confirmPassword.value,
          email: email.value,
          token: router.currentRoute.query.token,
        })
        .then((resp: any) => {
          loading.value = false;
          router.push("/login");
        })
        .catch((err: any) => {
          loading.value = false;
        });
    };

    return {
      showcase,
      password,
      confirmPassword,
      loading,
      submit,
      email,
    };
  },
});
</script>
