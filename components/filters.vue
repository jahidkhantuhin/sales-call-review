<template>
  <div class="review-calls-filters" role="group" aria-label="Call filters">
    <div v-if="selectedLocation && selectedLocation.id">
      <v-select
        id="ad-campaign"
        :items="campaignList"
        label="Ad Campaign"
        item-text="name"
        item-value="f_campaign_id"
        clearable
        v-model="filters['campaign']"
        @change="handleCampaignIdChange"
        dense
        outlined
        hide-details
      ></v-select>
    </div>
    <div>
      <v-select
        ref="select"
        id="call-status"
        :items="[
          {
            value: 'unrated',
            label: 'Not Rated',
          },
          {
            value: 'rated',
            label: 'Rated',
          },
          {
            value: 'all',
            label: 'All',
          },
        ]"
        label="Call Status"
        item-text="label"
        item-value="value"
        clearable
        v-model="filters['rated_type']"
        @change="handleCallStatusChange"
        dense
        outlined
        hide-details
      ></v-select>
    </div>
    <div>
      <v-select
        ref="select"
        id="call-order"
        :items="[
          {
            value: 'oldest',
            label: 'Oldest',
          },
          {
            value: 'latest',
            label: 'Latest',
          },
        ]"
        label="Order By"
        item-text="label"
        item-value="value"
        clearable
        v-model="filters['order_by']"
        @change="handleCallStatusChange"
        dense
        outlined
        hide-details
      ></v-select>
    </div>
    <div>
      <v-select
        ref="select"
        id="blacklisted-calls"
        :items="[
          {
            value: 'true',
            label: 'Yes',
          },
          {
            value: 'false',
            label: 'No',
          },
        ]"
        label="Blacklisted Calls"
        item-text="label"
        item-value="value"
        clearable
        v-model="filters['blacklisted_call']"
        @change="handleBlacklistedCallChange"
        dense
        outlined
        hide-details
      ></v-select>
    </div>
    <div>
      <v-select
        ref="select"
        id="call-language"
        :items="[
          {
            value: 'english',
            label: 'English',
          },
          {
            value: 'spanish',
            label: 'Spanish',
          },
          {
            value: 'other',
            label: 'Other',
          },
        ]"
        label="Language"
        item-text="label"
        item-value="value"
        clearable
        v-model="filters['score_language']"
        @change="handleLanguageChange"
        dense
        outlined
        hide-details
      ></v-select>
    </div>
    <div>
      <datepicker
        compact
        @clear="onDateClear"
        @change="handleDateChange"
        v-model="filters['date_range']"
      ></datepicker>
    </div>
    <div>
      <v-text-field
        dense
        outlined
        hide-details
        type="text"
        id="call_marchex_id"
        clearable
        @change="handleChange"
        v-model="filters['call_marchex_id']"
        label="Marchex ID"
      ></v-text-field>
    </div>
    <div>
      <v-text-field
        dense
        outlined
        hide-details
        type="number"
        id="caller_number"
        clearable
        @change="handleChange"
        v-model="filters['caller_number']"
        label="Caller number"
      ></v-text-field>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import moment from "moment";
import Datepicker from "~/components/forms/Datepicker.vue";

const filters: { [key: string]: any } = {
  date: [],
  f_campaign_id: null,
};

export default Vue.extend({
  components: {
    Datepicker,
  },
  props: {
    selectedLocation: {
      type: Object,
      default: "",
    },
  },
  computed: {
    displayedDates: {
      get() {
        const _this: any = this;
        if (
          _this.filters.date_range &&
          typeof _this.filters.date_range === "string"
        ) {
          return _this.filters.date_range;
        }
        return (
          _this.filters.date_range &&
          _this.filters.date_range
            .map((d: any) => moment(d).format("DD MMM YYYY"))
            .join(" to ")
        );
      },
      set(v) {
        if (!v) {
          (this as any).filters.date_range = [];
        }
      },
    },
    filtersFromStore() {
      return this.$store.getters["calls/filters"];
    },
  },
  watch: {
    selectedLocation() {
      if (this.selectedLocation) {
        this.fetchCampaigns();
      } else this.campaignList = [];
    },
    $route() {
      this.loadFiltersFromURL();
    },
    filtersFromStore() {
      const length = Object.keys(this.filtersFromStore || {}).length;
      if (length === 0) {
        this.filters = {
          date: [],
        };
        (this.$refs["select"] as any).reset();
      }
      if (
        this.filtersFromStore["date_range"] &&
        this.filtersFromStore["date_range"].length > 0
      ) {
        this.filters["date_range"] = this.filtersFromStore["date_range"];
      }
    },
  },
  data() {
    return {
      filters: { ...filters },
      menu: false,
      modal: false,
      campaignList: [],
    };
  },
  methods: {
    onDateClear() {
      delete this.filters["date_range"];
      this.handleChange();
    },
    loadFiltersFromURL() {
      const filters = this.$route.query;
      delete filters["page"];
      delete filters["limit"];
      Object.keys(filters).map((name) => {
        const v = filters[name];
        if (v === null) {
          delete filters[name];
        }
      });

      if (filters.date_range && typeof filters.date_range === "string") {
        filters.date_range = [filters.date_range, filters.date_range];
      }

      this.filters = filters;
    },
    handleDateChange() {
      if (this.filters.date_range) {
        this.handleChange();
      }
    },
    setDate(val: String) {
      if (val === "this_week") {
        this.filters["date_range"] = [
          moment().startOf("isoWeek").format("YYYY-MM-DD"),
          moment().endOf("isoWeek").format("YYYY-MM-DD"),
        ];
      } else if (val === "last_week") {
        this.filters["date_range"] = [
          moment().subtract(1, "weeks").startOf("isoWeek").format("YYYY-MM-DD"),
          moment().subtract(1, "weeks").endOf("isoWeek").format("YYYY-MM-DD"),
        ];
      } else if (val === "this_month") {
        this.filters["date_range"] = [
          moment().startOf("month").format("YYYY-MM-DD"),
          moment().endOf("month").format("YYYY-MM-DD"),
        ];
      } else if (val === "last_month") {
        this.filters["date_range"] = [
          moment().subtract(1, "months").startOf("month").format("YYYY-MM-DD"),
          moment().subtract(1, "months").endOf("month").format("YYYY-MM-DD"),
        ];
      }
      this.handleChange();
    },
    handleCallStatusChange() {
      const filters = { ...this.filters };

      this.$store.commit("calls/deleteCallsFilter", { name: "unrated" });
      this.$store.commit("calls/deleteCallsFilter", { name: "rated" });

      delete filters["unrated"];
      delete filters["rated"];

      if (filters["rated_type"] !== "all") {
        filters[filters["rated_type"]] = "1";
      }

      delete filters["rated_type"];

      this.handleChange();
    },

    handleBlacklistedCallChange() {
      this.handleChange();
    },
    
    handleLanguageChange() {
      this.handleChange();
    },
    handleCampaignIdChange() {
      this.handleChange();
    },
    handleChange() {
      this.$emit("change", this.filters);
    },
    fetchCampaigns() {
      this.$axios
        .get(`locations/${this.selectedLocation.id}/campaigns`, {
          withCredentials: true,
        })
        .then((res) => {
          this.campaignList = res.data.data;
        });
    },
  },
  beforeMount() {
    this.filters = this.filtersFromStore;
    this.loadFiltersFromURL();
  },
});
</script>
<style scoped>
.review-calls-filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 148px), 1fr));
  gap: 10px;
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid var(--review-line);
  border-radius: 12px;
  background: var(--review-wash);
}

.review-calls-filters > div {
  min-width: 0;
}

.review-calls-filters ::v-deep .v-input__slot {
  min-height: 40px;
  margin-bottom: 0;
  border-radius: 8px;
  background: var(--review-card);
}

.review-calls-filters ::v-deep .v-input__slot fieldset {
  border-color: var(--review-line);
}

.review-calls-filters ::v-deep .v-input--is-focused fieldset {
  border-color: var(--review-accent);
}

.review-calls-filters ::v-deep .v-label,
.review-calls-filters ::v-deep .v-select__selection,
.review-calls-filters ::v-deep input {
  font-size: .875rem;
}

.review-calls-filters ::v-deep .v-select__selection {
  min-width: 0;
  max-width: 100%;
}

@media (max-width: 599px) {
  .review-calls-filters {
    gap: 8px;
    padding: 8px;
  }
}
</style>
