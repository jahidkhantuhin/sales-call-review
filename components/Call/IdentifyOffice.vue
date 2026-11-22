<template>
  <div class="identify-office-div">
    <v-card
      :class="{
        'mx-auto identify-office': true,
      }"
      light
      :style="{
        background: $store.getters['theme/themeBackgroundCard'],
      }"
      outlined
    >
      <v-card-title>Office and staff</v-card-title>
      <v-card-title class="score-question">
        <span
          :class="{
            'disabled-text':
              $store.getters['calls/rules']['identify_office'] !== 'required',
                'text-break': true,
          }"
        >
          Identify Office? <span style="color: red">{{$store.getters['calls/rules']['identify_office'] === 'required' ? '*' : ''}}</span>
        </span>
      </v-card-title>
      <v-card-text>
        <ValidationProvider
          :rules="$store.getters['calls/rules']['identify_office']"
          name="identify_office"
          v-slot="{ errors, valid }"
        >
          <v-radio-group
            @change="identifyOfficeSelected"
            :disabled="
              $store.getters['calls/rules']['identify_office'] !== 'required'
            "
            v-model="identifyOffice"
            row
          >
            <v-radio :dark="$vuetify.theme.isDark" label="Yes" value="yes">
              <span slot="label"> Yes </span>
            </v-radio>
            <v-radio :dark="$vuetify.theme.isDark" label="No" value="no">
              <span slot="label"> No </span>
            </v-radio>
          </v-radio-group>
        </ValidationProvider>
      </v-card-text>
      <v-card-title class="score-question">
        <span
          :class="{
              'disabled-text':
              $store.getters['calls/rules']['recipient_identify_themselves'] !== 'required',
                'text-break': true,
          }"
        >
          Did the staff member identify themselves? <span style="color: red">{{$store.getters['calls/rules']['recipient_identify_themselves'] === 'required' ? '*' : ''}}</span>
        </span>
      </v-card-title>
      <v-card-text>
        <ValidationProvider
          name="recipient_identify_themselves"
          v-slot="{ errors, valid }"
          :rules="$store.getters['calls/rules']['recipient_identify_themselves']"
        >
          <v-radio-group
            @change="identifyThemselvesSelected"
            v-model="identifyThemselves"
            row
            :disabled="
              $store.getters['calls/rules']['recipient_identify_themselves'] !== 'required'
            "
          >
            <v-radio :dark="$vuetify.theme.isDark" label="Yes" value="yes">
              <span slot="label"> Yes </span>
            </v-radio>
            <v-radio :dark="$vuetify.theme.isDark" label="No" value="no">
              <span slot="label"> No </span>
            </v-radio>
          </v-radio-group>
        </ValidationProvider>
        <div v-if="allowTextFieldForIdentifyThemselves">
          <ValidationProvider v-slot="{ errors, valid }">
          <v-text-field
            class="mt-n3"
            label="Staff member's name"
            v-model="recipientName"
            :dark="$vuetify.theme.isDark"
            outlined
            dense
          >
          </v-text-field> 
        </ValidationProvider>
        </div> 
      </v-card-text>

      <v-card-title class="score-question">
        <span
          :class="{
            'disabled-text':
              $store.getters['calls/rules']['consult_offered'] !== 'required',
                'text-break': true,
          }"
        >
          Was free consult offered? <span style="color: red">{{$store.getters['calls/rules']['consult_offered'] === 'required' ? '*' : ''}}</span>
        </span>
      </v-card-title>

      <v-card-text>
        <ValidationProvider
          :rules="$store.getters['calls/rules']['consult_offered']"
          name="consult_offered"
          v-slot="{ errors, valid }"
        >
          <v-radio-group
            :disabled="
              $store.getters['calls/rules']['consult_offered'] !== 'required'
            "
            v-model="consultOffered"
            row
          >
            <v-radio :dark="$vuetify.theme.isDark" label="Yes" value="yes">
              <span slot="label"> Yes </span>
            </v-radio>
            <v-radio :dark="$vuetify.theme.isDark" label="No" value="no">
              <span slot="label"> No </span>
            </v-radio>
          </v-radio-group>
        </ValidationProvider>
      </v-card-text>

      <v-card-title class="score-question">
        <span
          :class="{
            'disabled-text':
              $store.getters['calls/rules']['handler_pitch'] !== 'required',
                'text-break': true,
          }"
        >
          Did the handler pitch or promote the office/doctor? <span style="color: red">{{$store.getters['calls/rules']['handler_pitch'] === 'required' ? '*' : ''}}</span>
        </span>
      </v-card-title>

      <v-card-text>
        <ValidationProvider
          :rules="$store.getters['calls/rules']['handler_pitch']"
          name="handler_pitch"
          v-slot="{ errors, valid }"
        >
          <v-radio-group
            :disabled="
              $store.getters['calls/rules']['handler_pitch'] !== 'required'
            "
            v-model="handlerPitch"
            row
          >
            <v-radio :dark="$vuetify.theme.isDark" label="Yes" value="yes">
              <span slot="label"> Yes </span>
            </v-radio>
            <v-radio :dark="$vuetify.theme.isDark" label="No" value="no">
              <span slot="label"> No </span>
            </v-radio>
          </v-radio-group>
        </ValidationProvider>
      </v-card-text>

      <v-card-title class="score-question">
        <span
          :class="{
            'disabled-text':
              $store.getters['calls/rules']['caller_name_taken'] !== 'required',
                'text-break': true,
          }"
        >
          Was the caller's name and number taken for follow up? <span style="color: red">{{$store.getters['calls/rules']['caller_name_taken'] === 'required' ? '*' : ''}}</span>
        </span>
      </v-card-title>

      <v-card-text>
        <ValidationProvider
          :rules="$store.getters['calls/rules']['caller_name_taken']"
          name="caller_name_taken"
          v-slot="{ errors, valid }"
        >
          <v-radio-group
            :disabled="
              $store.getters['calls/rules']['caller_name_taken'] !== 'required'
            "
            v-model="callerNameTaken"
            row
          >
            <v-radio :dark="$vuetify.theme.isDark" label="Yes" value="yes">
              <span slot="label"> Yes </span>
            </v-radio>
            <v-radio :dark="$vuetify.theme.isDark" label="No" value="no">
              <span slot="label"> No </span>
            </v-radio>
          </v-radio-group>
        </ValidationProvider>
      </v-card-text>
      <!-- <v-card-text>
        <ValidationProvider name="person_name" :rules="$store.getters['calls/rules']['person_name_rules']" v-slot="{ errors, valid }">
          <v-text-field
            class="mt-n3"
            label="Patient's Name"
            v-model="personName"
            :disabled="$store.getters['calls/rules']['person_name'] !== 'required'"
            :dark="$vuetify.theme.isDark"
            outlined
            dense
            :success="valid"
            :error-messages="errors"
          >
          </v-text-field> 
        </ValidationProvider>
      </v-card-text> -->
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  mounted() {
    this.scale = "";
    this.identifyOffice = "";
    this.identifyThemselves = "";
    this.bookedAppointment = "";
    this.consultOffered = "";
    this.handlerPitch = "";
    this.callerNameTaken = "";
    this.whoAnswered = "";
    this.recipientName = "";
  },
  data(){
    return {
    allowTextField: false,
    allowTextFieldForIdentifyThemselves: false,
    };
  },
  
  computed: {
    labels() {
      return [
        {
          label: "Best",
          value: "best",
        },
        {
          label: "Better",
          value: "better",
        },
        {
          label: "Good",
          value: "good",
        },
        {
          label: "Neutral",
          value: "neutral",
        },
        {
          label: "Bad",
          value: "bad",
        },
        {
          label: "Worst",
          value: "worst",
        },
      ];
    },
    currentScoringCall() {
      return this.$store.getters["calls/currentScoringCall"];
    },
    identifyOffice: {
      get() {
        // @ts-ignore
        return this.currentScoringCall["identify_office"];
      },
      set(val) {
        this.$store.commit("calls/setScoreCallInformation", {
          identify_office: val,
        });
      },
    },
    identifyThemselves: {
      get() {
        // @ts-ignore
        return this.currentScoringCall["recipient_identify_themselves"];
      },
      set(val) {
        this.$store.commit("calls/setScoreCallInformation", {
          recipient_identify_themselves: val,
        });
      },
    },
    whoAnswered: {
      set: function (val) {
        this.$store.commit("calls/setScoreCallInformation", {
          who_answered: val,
        });
      },
      get: function () {
        // @ts-ignore
        return this.currentScoringCall["who_answered"];
      },
    },
    bookedAppointment: {
      get() {
        // @ts-ignore
        return this.currentScoringCall["booked_appointment"];
      },
      set(val) {
        this.$store.commit("calls/setScoreCallInformation", {
          booked_appointment: val,
        });
      },
    },
    consultOffered: {
      get() {
        // @ts-ignore
        return this.currentScoringCall["consult_offered"];
      },
      set(val) {
        this.$store.commit("calls/setScoreCallInformation", {
          consult_offered: val,
        });
      },
    },
    handlerPitch: {
      get() {
        // @ts-ignore
        return this.currentScoringCall["handler_pitch"];
      },
      set(val) {
        this.$store.commit("calls/setScoreCallInformation", {
          handler_pitch: val,
        });
      },
    },
    callerNameTaken: {
      get() {
        // @ts-ignore
        return this.currentScoringCall["caller_name_taken"];
      },
      set(val) {
        this.$store.commit("calls/setScoreCallInformation", {
          caller_name_taken: val,
        });
      },
    },
    scale: {
      get() {
        return (this as any).currentScoringCall["scale"];
      },
      set(val) {
        this.$store.commit("calls/setScoreCallInformation", {
          scale: val,
        });
      },
    },
    recipientName: {
      get() {
        return (this as any).currentScoringCall["recipient_name"];
      },
      set(val) {
        this.$store.commit("calls/setScoreCallInformation", {
          recipient_name: val,
        });
      },
    },
  },
  methods: {
    identifyOfficeSelected() {
      if (this.identifyOffice !== null) {
        if (this.identifyOffice === 'yes') {
        this.allowTextField = true
      }
      if (this.identifyOffice === 'no') {
        this.allowTextField = false
      }
      }
      
    },
    identifyThemselvesSelected() {
      if (this.identifyThemselves !== null) {
        if (this.identifyThemselves === 'yes') {
        this.allowTextFieldForIdentifyThemselves = true
      }
      if (this.identifyThemselves === 'no') {
        this.allowTextFieldForIdentifyThemselves = false
      }
      }
      
    }
  },
});
</script>

<style scoped>
.identify-office .score-question {
  padding-block: 4px 0;
  font-size: .9rem;
}
.identify-office .v-card__text {
  padding-block: 0;
}
</style>
