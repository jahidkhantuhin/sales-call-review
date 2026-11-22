<template>
  <section class="project-public-screen">
    <v-card outlined class="project-public-card">
      <div class="project-public-brand">
        <v-icon small>mdi-phone-in-talk-outline</v-icon>
        <span>Sales Call Review</span>
      </div>
      <div v-if="fetchingUser" class="project-public-loading" role="status">
        <v-progress-circular indeterminate color="primary" size="24" />
        Checking your session
      </div>
      <template v-else-if="showForm">
        <h1>Sign in</h1>
        <ValidationObserver v-slot="{ invalid }">
          <v-form class="project-public-form" @submit="submit">
            <ValidationProvider name="Email" rules="required|email" v-slot="{ errors }">
              <v-text-field v-model="email" name="email" label="Email" type="email" autocomplete="username" outlined :error-messages="errors" required />
            </ValidationProvider>
            <ValidationProvider name="Password" rules="required" v-slot="{ errors }">
              <v-text-field v-model="password" name="password" label="Password" type="password" autocomplete="current-password" outlined :error-messages="[...errors, ...formErrors]" required />
            </ValidationProvider>
            <v-btn type="submit" color="primary" depressed block large :loading="loading" :disabled="invalid">Sign in</v-btn>
            <nuxt-link class="project-public-link" to="/forgot-password">Forgot your password?</nuxt-link>
          </v-form>
        </ValidationObserver>
      <p v-if="showcase" class="project-public-note">Use a sample email and password to preview sign-in.</p>
      <recaptcha-powered v-else />
      </template>
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
import swalMixin, { showToast } from "~/utils/swalMixin";

import translations from "~/translations";
import deleteAllCookies from "~/utils/deleteAllCookies";

import RecaptchaPowered from "~/components/RecaptchaPowered.vue";
import {
  defineComponent,
  ref,
  useRoute,
  useRouter,
  useStore,
  onMounted,
} from "@nuxtjs/composition-api";
import showErrorOnXHRFail from "~/utils/showErrorOnXHRFail";

const errors: Array<string> = [];

export default defineComponent({
  middleware: ["redirectToHomeIfAlreadyLoggedIn"],
  layout: "blank",
  components: {
    RecaptchaPowered,
  },
  setup(props, { parent, root }) {
    const $auth = parent?.$auth;
    const $axios = parent?.$axios;
    const email = ref("");
    const password = ref("");
    const router = useRouter();
    const route = useRoute();
    const store = useStore();

    const formErrors = ref(errors);
    const loading = ref(false);
    const showForm = ref(false);
    const fetchingUser = ref(true);
    const $swal = swalMixin((parent as any).$swal as any);

    // PW reset modal
    const showPWReset = ref(false);

    // we'll use this to i18n text
    // useContext() doesn't work here for some reason
    const translate = (text: string, params?: any): string =>
      (root as any).$t(text, params);

    const submit = async (e: Event) => {
      e.preventDefault();

      // handle loading and form errors
      loading.value = true;
      formErrors.value = [];

      // await $auth?.logout();
      if (process.env.SHOWCASE_MODE !== 'true') {
        deleteAllCookies();
        localStorage.clear();
      }

      $auth
        ?.loginWith("laravelSanctum", {
          data: {
            email: email.value,
            password: password.value,
          },
        })
        .then((response: any) => {
          $auth.setUser(response.data.data);

          router.push((route.value.query as any).redirect || "/");

          loading.value = false;
          showToast($swal, {
            title: translate("alert.success.login"),
          });
        })
        .catch((e) => {
          loading.value = false;
        });
    };

    onMounted(async () => {
      if (process.env.SHOWCASE_MODE === 'true') {
        fetchingUser.value = false;
        showForm.value = true;
        return;
      }
      await $axios
        ?.get('/sanctum/csrf-cookie', {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .then(() => {
          $auth
            ?.setUserToken(true)
            .then((resp) => {
              if (resp) {
                router.push((route.value.query as any).redirect || "/");
              }
            })
            .finally(() => {
              fetchingUser.value = false
              showForm.value = true
            })
        })
    });

    return {
      showcase,
      translations,
      email,
      password,
      formErrors,
      loading,
      submit,
      fetchingUser,
      showForm,
    };
  },
});
</script>
