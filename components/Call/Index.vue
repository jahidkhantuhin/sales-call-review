<template>
  <secured-component permission="score call" :show-message="true">
    <div class="call-score-page">
      <header class="score-header">
        <div>
          <v-btn text small class="score-back" :to="{ path: '/calls', query: $route.query }">
            <v-icon left small>mdi-arrow-left</v-icon>
            Calls
          </v-btn>
          <h1>Review call #{{ $route.params.id }}</h1>
          <p v-if="callContext">{{ callContext }}</p>
        </div>
        <span v-if="!loading" :class="['review-badge', alreadyRated ? 'review-badge--done' : 'review-badge--pending']">
          {{ alreadyRated ? ($route.query.blacklisted_call ? 'Blacklisted' : 'Reviewed') : 'Pending review' }}
        </span>
      </header>
      <ValidationObserver ref="validation" v-slot="{ invalid }">
        <v-progress-linear v-if="loading" indeterminate color="primary" aria-label="Loading call review" />
        <div class="score-layout" :aria-busy="loading ? 'true' : 'false'">
          <call-info class="score-recording" />
          <template v-if="!loading && alreadyRated">
            <div class="score-column">
              <call-status />
              <v-card v-if="staffFields.length" outlined>
                <v-card-title>Office and staff</v-card-title>
                <v-card-text>
                  <dl class="saved-review-fields">
                    <div v-for="field in staffFields" :key="field.label">
                      <dt>{{ field.label }}</dt>
                      <dd>{{ field.value }}</dd>
                    </div>
                  </dl>
                </v-card-text>
              </v-card>
            </div>
            <v-card v-if="leadFields.length" outlined>
              <v-card-title>Lead details</v-card-title>
              <v-card-text>
                <dl class="saved-review-fields">
                  <div v-for="field in leadFields" :key="field.label">
                    <dt>{{ field.label }}</dt>
                    <dd>{{ field.value }}</dd>
                  </div>
                </dl>
              </v-card-text>
            </v-card>
          </template>
          <div v-if="!loading && !alreadyRated" class="score-column">
            <call-status />
            <procedures />
          </div>
          <div v-if="!loading && !alreadyRated" class="score-column">
            <additional-info />
            <identify-office />
          </div>
        </div>
        <v-card v-if="!loading && !alreadyRated" class="score-submit" outlined>
          <p class="score-submit-hint" aria-live="polite">
            {{ invalid ? 'Complete the required fields to submit.' : 'Review ready to submit.' }}
          </p>
          <div class="score-submit-buttons">
            <v-btn outlined color="error" @click="blacklistCallConfirm = true">Blacklist</v-btn>
            <v-btn
              color="primary"
              depressed
              :disabled="invalid"
              :loading="$store.getters['calls/scoreCallLoading']"
              @click="handleScoreCall"
            >
              <v-icon left small>mdi-check</v-icon>
              Score Call
            </v-btn>
          </div>
        </v-card>
        <p v-else-if="!loading && alreadyRated" class="score-reviewed" role="status">
          This call is already {{ $route.query.blacklisted_call ? 'blacklisted' : 'rated' }}.
        </p>
      </ValidationObserver>
      <v-dialog v-model="blacklistCallConfirm" persistent max-width="420">
        <v-card>
          <v-card-title>Blacklist call?</v-card-title>
          <v-card-text>Confirm that you want to blacklist this call.</v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn text :disabled="$store.getters['calls/blacklistCallLoading']" @click="blacklistCallConfirm = false">
              Cancel
            </v-btn>
            <v-btn
              color="error"
              depressed
              :loading="$store.getters['calls/blacklistCallLoading']"
              :disabled="isSuperAdmin"
              @click="handleBlacklistCall"
            >Blacklist Call</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </secured-component>
</template>
<script lang="ts">
import IdentifyOffice from "~/components/Call/IdentifyOffice.vue";
import CallStatus from "~/components/Call/CallStatus.vue";
import AdditionalInfo from "~/components/Call/AdditionalInfo.vue";
import Procedures from "~/components/Call/Procedures.vue";
import CallInfo from "~/components/Call/CallInfo.vue";

import Vue from "vue";
export default Vue.extend({
  data() {
    return {
      blacklistCallConfirm: false,
    };
  },
  computed: {
    loading(): boolean {
      return !this.callInfo.id || this.$store.getters["calls/singleFetchLoading"] ||
        this.$store.getters["calls/fetchRatedCallLoading"];
    },
    alreadyRated(): boolean {
      return this.$store.getters["calls/isAlreadyRated"];
    },
    savedReview() {
      return this.$store.getters["calls/currentScoringCall"];
    },
    leadFields(): Array<{ label: string; value: string }> {
      const review = this.savedReview;
      const procedures = this.$store.getters["procedures/fetchResData"] || [];
      const procedure = procedures.find((item: { id: number; name: string }) =>
        String(item.id) === String(review.procedure_id));
      return [
        { label: "Patient name", value: review.person_name },
        { label: "Email", value: review.person_email },
        { label: "Phone", value: review.person_phone },
        { label: "Procedure", value: review.other_procedure || procedure?.name },
        { label: "Appointment date", value: review.appt_date },
        { label: "Appointment time", value: review.appt_time },
        { label: "Review note", value: review.comment },
      ].filter(field => field.value);
    },
    staffFields(): Array<{ label: string; value: string }> {
      const review = this.savedReview;
      const fields = [
        { label: "Office identified", value: review.identify_office },
        { label: "Staff member identified themselves", value: review.recipient_identify_themselves },
        { label: "Staff member", value: review.recipient_name || review.who_answered },
        { label: "Free consultation offered", value: review.consult_offered },
        { label: "Office or doctor promoted", value: review.handler_pitch },
        { label: "Caller name taken", value: review.caller_name_taken },
      ].filter(field => field.value);
      return fields.map(field => ({
        ...field,
        value: field.value === "yes" ? "Yes" : field.value === "no" ? "No" : field.value,
      }));
    },
    callContext(): string {
      return [this.callInfo.client?.name, this.callInfo.location?.name].filter(Boolean).join(" · ");
    },
    isSuperAdmin() {
      return (this.$auth.user as any)?.role_id < 2;
    },
    callInfo() {
      const obj = this.$store.getters["calls/fetchSingleRes"];
      return obj && obj.data ? obj.data : {};
    },
  },
  beforeMount() {
    this.$store.commit("calls/resetScoringCall");
  },
  mounted() {
    this.$store.commit("calls/setScoreCallSubmited", false);
    this.$store.commit("calls/setisAlreadyRated", false);
    const _this = this;
    const { id } = this.$route.params;

    _this.$store.dispatch("procedures/fetchProcedures");
    _this.$store.commit("calls/setCurrentScoringCall", {});
    setTimeout(() => {
      _this.$store.dispatch("calls/fetchSingle", {
        id,
        onFail: (err: any) => {
          if (err.response && err.response.status === 404) {
            _this.$nuxt.error({ statusCode: 404, message: "Call not found" });
          }
        },
        afterFetch: (res: any) => {
          _this.$store.commit("calls/setRatingCall", res.data);
          _this.$store.dispatch("calls/fetchRatedCall", id);
        },
      }).catch((err: any) => {
        if (err.response?.status !== 404) {
          _this.$nuxt.error({ statusCode: 500, message: "Unable to load this call" });
        }
      });
    }, 300);
  },
  methods: {
    handleScoreCall() {
      this.$store.commit("calls/setScoreCallSubmited", true);
      this.$store.dispatch("calls/scoreCall", {
        call_id: this.$route.params.id,
        order_by: this.$route.query.order_by,
        date_range: this.$route.query.date_range,
      });
    },
    handleBlacklistCall() {
      const _this = this;
      this.$store.dispatch("calls/blacklistCall", {
        call_id: this.$route.params.id,
        onBlackList() {
          _this.blacklistCallConfirm = false;
          _this.$router.push("/calls");
        },
      });
    },
  },
  components: {
    IdentifyOffice,
    CallStatus,
    AdditionalInfo,
    Procedures,
    CallInfo,
  },
});
</script>
<style>
.call-score-page {
  max-width: 1200px;
  margin-inline: auto;
}
.score-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px 16px;
  margin-bottom: 16px;
}
.score-header .score-back {
  margin: 0 0 6px -8px;
}
.score-header h1 {
  font-size: clamp(1.45rem, 3vw, 2rem);
  line-height: 1.2;
  letter-spacing: -.035em;
}
.score-header p {
  margin: 6px 0 0;
  color: var(--review-muted);
}
.score-layout,
.score-column {
  display: grid;
  align-items: start;
  gap: 16px;
  min-width: 0;
}
.score-layout {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.saved-review-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 150px), 1fr));
  gap: 12px;
}
.saved-review-fields > div {
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--review-wash);
  overflow-wrap: anywhere;
}
.saved-review-fields dt {
  color: var(--review-muted);
  font-size: .8rem;
}
.saved-review-fields dd {
  margin: 3px 0 0;
  color: var(--review-text);
  font-weight: 600;
  white-space: pre-wrap;
}
.saved-review-fields > div:last-child:nth-child(odd) {
  grid-column: 1 / -1;
}
.score-recording {
  grid-column: 1 / -1;
}
.call-score-page .score-layout .v-card {
  background: var(--review-card) !important;
  color: var(--review-text);
}
.call-score-page .score-layout .v-card__title {
  color: var(--review-text);
}
.call-score-page .score-layout .v-card__text,
.call-score-page .score-layout .v-input--radio-group .v-label {
  color: var(--review-muted);
}
.call-score-page .score-layout .v-input--is-disabled .v-label {
  opacity: .7;
}
.call-score-page .radio-column {
  padding: 4px 12px;
}
.call-score-page .score-submit {
  position: sticky;
  z-index: 3;
  bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 16px;
  margin-top: 16px;
  padding: 10px 14px;
  box-shadow: 0 -3px 20px #1726411a;
}
.score-submit-hint,
.score-reviewed {
  color: var(--review-muted);
}
.score-submit .score-submit-hint {
  margin: 0;
  font-size: .875rem;
}
.score-submit-buttons {
  display: flex;
  gap: 8px;
  margin-left: auto;
}
.score-reviewed {
  margin-top: 14px;
}
@media (max-width: 699px) {
  .score-layout {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
  }
  .score-column {
    display: contents;
  }
}
</style>
