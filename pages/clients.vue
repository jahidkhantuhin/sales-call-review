<template>
  <secured-component :permission="'view clients'" :show-message="true" >
    <v-row>
      <v-col cols="12" sm="12" md="12">
        <v-card class="" elevation="0" width="100%">
          <v-card-text>
            <v-row>
              <v-col cols="12" class="pb-0 pt-1 d-flex">
                <h2 class="my-0 py-0">Clients</h2>
              </v-col>
            </v-row>
            <form class="review-filters review-client-filters mt-4" @submit.prevent="applySearch">
              <v-text-field v-model="search" label="Client name" prepend-inner-icon="mdi-magnify" hide-details outlined dense />
              <v-btn color="primary" type="submit">Search</v-btn>
              <v-btn text :disabled="!search && !appliedSearch" @click="clearSearch">Clear</v-btn>
            </form>
            <datatable :key="appliedSearch" :headers="headers" module-name="Clients" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </secured-component>
</template>

<script lang="ts">
import Vue from "vue";
import Datatable from "~/components/Crud/Datatable.vue";
import SecuredComponent from "~/components/SecuredComponent.vue";
export default Vue.extend({
  components: { Datatable, SecuredComponent },
  middleware: "auth",
  head: {
    title: "Clients"
  },
  beforeCreate() {
    this.$store.commit('clients/resetClientsFetchRes');
    this.$store.commit('clients/removeClientsFilters');
  },
  mounted() {
    this.$store.commit("setPageTitle", "Clients")
  },
  methods: {
    applySearch() {
      this.appliedSearch = (this.search || "").trim();
      this.$store.commit("clients/setClientsFilters", this.appliedSearch ? { name: encodeURIComponent(this.appliedSearch) } : {});
      this.$store.commit("clients/updateClientsPagination", { name: "current_page", value: 1 });
    },
    clearSearch() {
      this.search = "";
      this.applySearch();
    },
  },
  data() {
    return {
      search: "",
      appliedSearch: "",
      headers: [
        {
          text: "Id",
          align: "start",
          sortable: false,
          value: "id",
        },
        {
          text: "Name",
          align: "start",
          sortable: false,
          value: "name",
        },
        {
          text: "Source",
          align: "start",
          sortable: false,
          value: "source",
        },
        {
          text: "Account Id",
          align: "start",
          sortable: false,
          value: "account_id",
        },
        {
          text: "Date created",
          align: "start",
          sortable: false,
          value: "created_at",
        },
      ],
    };
  },
});
</script>

<style lang="scss">
.user {
  display: flex;
  align-items: center;
  position: relative;
  top: 4px;
  img {
    margin-right: 15px;
  }
}
</style>
