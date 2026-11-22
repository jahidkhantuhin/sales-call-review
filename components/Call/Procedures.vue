<template>
  <v-card
    light
    class="procedures procedures-card"
    :style="{
      background: $store.getters['theme/themeBackgroundCard'],
    }"
    outlined
  >
    <v-card-title class="procedure-heading">
      <span
        :class="{
          heading: true,
          'disabled-text':
            $store.getters['calls/rules']['procedure_id'] !== 'required',
        }"
      >
        Procedures <span style="color: red">{{$store.getters['calls/rules']['procedure_id'] === 'required' ? '*' : ''}}</span>
      </span>
      <v-text-field
        class="procedure-search"
        id="procedure-search"
        prepend-inner-icon="mdi-magnify"
        hide-details
        clearable
        outlined
        dense
        v-model="search"
        label="Search procedures"
      ></v-text-field>
    </v-card-title>

    <div class="body">
      <v-card-text class="pt-2">
        <p v-if="!list.length" class="mb-0">No matching procedures.</p>
        <ValidationProvider
          name="procedure_id"
          :rules="$store.getters['calls/rules']['procedure_id']"
          v-slot="{ errors, valid }"
        >
          <v-radio-group
            :disabled="
              $store.getters['calls/rules']['procedure_id'] !== 'required'
            "
            v-model="procedure_id"
          >
            <div class="procedure-options">
              <v-radio
                v-for="procedure in list"
                :key="procedure.id"
                :dark="$vuetify.theme.isDark"
                :value="procedure.id"
              >
                <template #label>
                  <span>
                    {{ procedure.name }}
                    <span v-if="procedure.desc" class="extra">{{ procedure.desc }}</span>
                  </span>
                </template>
              </v-radio>
            </div>
          </v-radio-group>
        </ValidationProvider>
      </v-card-text>
    </div>

    <v-card-text v-if="proceedMarked && proceedMarked.name && proceedMarked.name.toLowerCase() === 'other'" >
      <v-text-field v-model="other_procedure" clearable outlined dense label="Procedure name" />
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Procedures from "@/utils/procedures.js";

export default Vue.extend({
  mounted() {
    this.procedure_id = null;
  },
  data() {
    return {
      search: "",
      customProcedures: Procedures
    };
  },
  computed: {
    proceedMarked() {
      return (this as any).list.filter(
        (c: any) => c.id === this.currentScoringCall.procedure_id
      )[0];
    },
    list() {
      const list = this.$store.getters[`procedures/fetchResData`];
      // const list:any = this.customProcedures;
      const filteredList = list.filter((procedure: any) => {
        return procedure.name != 'Other' && procedure.name != 'Lumineers' && procedure.name != 'Toothache' && procedure.name != 'Tooth Colored Restoration' && procedure.name != 'Bruxism/Grinding'
      });
      const query = (this.search || "").trim().toLowerCase();
      if (query) {
        return filteredList.filter((c: any) => {
          return [c.name, c.desc].some((text) => text?.toLowerCase().includes(query));
        });
      } else return filteredList;
    },
    currentScoringCall() {
      return this.$store.getters["calls/currentScoringCall"];
    },
    procedure_id: {
      get() {
        // @ts-ignore
        return this.currentScoringCall["procedure_id"];
      },
      set(val) {
        this.$store.commit("calls/setScoreCallInformation", {
          procedure_id: val,
        });
      },
    },
    other_procedure: {
      get() {
        // @ts-ignore
        return this.currentScoringCall["other_procedure"];
      },
      set(val) {
        this.$store.commit("calls/setScoreCallInformation", {
          other_procedure: val,
        });
      },
    },
  },
});
</script>

<style scoped>
.procedures {
  width: 100%;
  min-width: 0;
}
.procedure-heading {
  justify-content: space-between;
  gap: 10px 16px;
}
.procedure-search {
  flex: 1 1 200px;
  min-width: 0;
  max-width: 100%;
}
.procedure-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 185px), 1fr));
  gap: 8px 16px;
}
.procedure-options .v-radio {
  min-width: 0;
  margin-bottom: 0;
  overflow-wrap: anywhere;
}
.body {
  max-height: 22rem;
  overflow-y: auto;
}
.extra {
  display: none;
}
label:hover .extra,
label:focus-within .extra {
  display: block;
  color: var(--review-muted);
}
</style>
