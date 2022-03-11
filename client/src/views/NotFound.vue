<template>
  <div id="errorPage">
    <h1>{{ title }}</h1>
    <h2 v-if="wrongPath">La page "{{ wrongPath }}" est introuvable...</h2>
    <h2 v-else>La page demandée est introuvable...</h2>
    <button class="btn" @click="goToPreviousPage">Revenir sur la Home</button>
  </div>
</template>

<script>
import { reactive, toRefs } from "vue";
import { useRouter, useRoute } from "vue-router";

import bgWaves from "../components/bg-waves.vue";
export default {
  component: { bgWaves },
  name: "NotFound",
  setup() {
    const router = useRouter();
    const route = useRoute();

    const state = reactive({
      wrongPath: route.params.wrongPath,
      title: "Page introuvable",
    });

    const goToPreviousPage = function () {
      router.push("/");
    };

    return {
      ...toRefs(state),
      goToPreviousPage,
    };
  },
};
</script>

<style lang="scss" scoped></style>
