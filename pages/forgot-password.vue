<template>
  <section class="project-public-screen">
    <v-card outlined class="project-public-card">
      <div class="project-public-brand">
        <v-icon small>mdi-phone-in-talk-outline</v-icon>
        <span>Sales Call Review</span>
      </div>
      <h1>Recover password</h1>
      <p class="project-public-description">Enter the email address associated with your account.</p>
      <ValidationObserver v-slot="{ invalid }">
        <v-form class="project-public-form" @submit="submit">
          <ValidationProvider name="Email" rules="required|email" v-slot="{ errors }">
            <v-text-field v-model="email" label="Email" name="email" type="email" autocomplete="email" outlined :error-messages="errors" required />
          </ValidationProvider>
          <v-btn type="submit" color="primary" depressed block large :loading="loading" :disabled="invalid">Send reset link</v-btn>
          <nuxt-link class="project-public-link" to="/login">Back to sign in</nuxt-link>
        </v-form>
      </ValidationObserver>
      <p v-if="showcase" class="project-public-note">Demo mode simulates the recovery email.</p>
      <recaptcha-powered v-else />
    </v-card>
  </section>
</template>

<script lang="ts">
import Vue from "vue";
import translations from "~/translations";
import Cookies from "js-cookie";

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

const errorsForm: Array<string> = [];

import RecaptchaPowered from "~/components/RecaptchaPowered.vue";

import { defineComponent, ref, useStore } from "@nuxtjs/composition-api";
import swalMixin, { showToast } from "~/utils/swalMixin";
import showErrorOnXHRFail from "~/utils/showErrorOnXHRFail";

export default defineComponent({
  layout: "blank",
  head: {
    title: "Forgot Password",
  },
  components: {
    RecaptchaPowered,
  },
  setup(props, { parent, root }) {
    const email = ref("");
    const loading = ref(false);
    const $swal = swalMixin((parent as any).$swal as any);

    const formErrors = ref(errorsForm);

    const translate = (text: string, params?: any): string =>
      (root as any).$t(text, params);

    const submit = (e: Event) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      loading.value = true;
      formErrors.value = [];
      if (email.value) {
        parent?.$axios
          .get("/sanctum/csrf-cookie", {
            headers: {
              "X-Requested-With": "XMLHttpRequest",
            },
            withCredentials: true,
          })
          .then(async (cc) => {
            let xxsrfToken = await Cookies.get("XSRF-TOKEN");
            parent.$axios
              .post(
                "password-reset",
                {
                  email: email.value,
                },
                {
                  headers: {
                    "X-XSRF-TOKEN": xxsrfToken,
                  },
                }
              )
              .then((e) => {
                loading.value = false;
                showToast($swal, {
                  title: showcase ? "Demo recovery request received" : translate(`alert.success.pwResetEmail`),
                });
              })
              .catch((e) => {
                loading.value = false;
                // showErrorOnXHRFail({
                //   $swal,
                //   error: e,
                //   translate: translate,
                //   showToast,
                //   customErrors: {
                //     code422: translate("alert.error.account.noMatch"),
                //   },
                // });
              });
          });
      }
    };

    return {
      showcase,
      translations,
      email,
      loading,
      submit,
    };
  },
});
</script>
