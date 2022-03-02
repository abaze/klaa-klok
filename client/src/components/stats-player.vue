<template>
  <div class="box player-zone">
    <h1>
      {{ username }}
      <span
        class="player-color"
        :class="colorClass"
        title="Votre couleur"
      ></span>
    </h1>
    <p>Total Gains : {{ totalGains }} €</p>
    <p>Mise en cours : {{ currentMise }} €</p>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "player-zone",

  computed: {
    ...mapState({
      colorClass: (state) => state.players.player.class,
      username: (state) => state.players.player.name,
      currentMise: (state) => state.players.player.currentMise,
      totalGains: (state) => state.players.player.totalGains,
    }),
  },
};
</script>

<style lang="scss">
.player-zone {
  grid-area: player-zone;
  background-color: var(--grey);

  h1 {
    display: flex;
    align-items: center;
    .player-color {
      display: block;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 2px solid #fff;
      margin-left: 1rem;
    }
  }
}
</style>
