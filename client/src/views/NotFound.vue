<template>
  <div>
    <h1>{{ title }}</h1>
    <h2 v-if="wrongPath">"{{ wrongPath }}"</h2>
    <button class="btn" @click="goToPreviousPage">Revenir en arrière</button>
  </div>
</template>

<script>
import { reactive, toRefs } from "vue";
import { useRouter, useRoute } from "vue-router";
export default {
  setup() {
    const router = useRouter();
    const route = useRoute();

    const state = reactive({
      wrongPath: route.params.wrongPath,
      title: "Page introuvable",
    });

    const goToPreviousPage = function () {
      router.back();
    };

    return {
      ...toRefs(state),
      goToPreviousPage,
    };
  },
};
</script>

<style lang="scss" scoped></style>
