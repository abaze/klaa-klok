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
import { mapActions } from "vuex";
export default {
  name: "NotFound",
  methods: {
    ...mapActions({
      destroyAudios: "audios/destroyAudios",
      resetGame: "games/resetGame",
    }),
  },
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
  mounted() {
    this.resetGame();
    this.destroyAudios();
  },
};
</script>

<style lang="scss"></style>
