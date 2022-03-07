<template>
  <div class="box ranking">
    <h1>Classement</h1>
    <div
      v-for="player in players"
      class="card"
      :class="player.class"
      :key="player.id"
    >
      <span class="username">{{ player.name }}</span>
      <span class="score">{{ player.totalGains }} €</span>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "ranking",
  computed: {
    ...mapState({
      playersList: (state) => state.games.game.playersList,
    }),
    players() {
      // on fait une copie independante de playersList avec slice();
      const sortPlayers = this.playersList.slice();
      return sortPlayers.sort((a, b) =>
        b.totalGains > a.totalGains ? 1 : a.totalGains > b.totalGains ? -1 : 0
      );
    },
  },
};
</script>

<style lang="scss">
.ranking {
  grid-area: ranking;
  background-color: var(--purple);
  counter-reset: ranking;
  .card {
    position: relative;
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    padding: 0.5rem;
    border-radius: 5px;
    border-bottom: 4px solid #fff;
    overflow: hidden;

    &:before {
      position: absolute;
      font-style: italic;
      font-weight: 800;
      opacity: 0.4;
      font-size: 5rem;
      counter-increment: ranking;
      content: counter(ranking) " ";
    }
  }
}
</style>
