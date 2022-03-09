<template>
  <div class="box ranking" :class="{ 'open-rank': openRank }">
    <div class="btn-open-rank" @click="openRank = !openRank">
      <img
        src="../assets/board/rank.svg"
        width="40"
        alt="Voir le classement"
        title="Voir le classement"
      />
    </div>
    <div v-for="player in players" class="card" :key="player.id">
      <span class="avatar" :class="player.class"></span>
      <span class="username">{{ player.name }}</span>
      <span class="score"
        ><img
          src="../assets/board/money.svg"
          width="30"
          title="Votre score"
        />{{ player.totalGains }}</span
      >
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "ranking",
  data() {
    return {
      openRank: false,
    };
  },
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
  counter-reset: ranking;
  @include media-max(900px) {
    position: fixed !important;
    top: 20px;
    right: 0px;
    width: 300px !important;
    transform: translateX(100%);
    transition: transform 0.3s linear;

    &.open-rank {
      transform: translateX(0);
    }
  }

  .btn-open-rank {
    display: none;
    position: absolute;
    top: 20px;
    left: 5px;
    background: rgb(14, 75, 189);
    width: 65px;
    height: 60px;
    border-radius: 50%;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    transform: translateX(-100%);
    text-align: left;
    box-shadow: -2px 0 5px 2px #fff;
    cursor: pointer;
    @include media-max(900px) {
      display: block;
    }

    img {
      object-fit: contain;
      height: 100%;
      margin-left: 1rem;
    }
  }

  .card {
    position: relative;
    display: flex;
    width: 100%;
    align-items: center;
    flex-wrap: wrap;
    padding: 1rem 0.5rem;
    margin-bottom: 0.25rem;
    border-radius: 15px;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    box-shadow: 0 5px 5px 0px rgba(0, 0, 0, 0.8);
    background-image: url(../assets/board/bg.jpg);
    background-size: contain;
    background-repeat: repeat;
    overflow: hidden;

    &:before {
      position: absolute;
      right: 10px;
      font-style: italic;
      font-weight: 800;
      opacity: 0.4;
      font-size: 5rem;
      counter-increment: ranking;
      content: "#" counter(ranking) " ";
    }

    &:first-of-type {
      margin-top: 1rem;
    }

    .avatar {
      width: 50px;
      height: 50px;
      border-radius: 15px;
      border: 2px solid #000;
      margin-right: 0.5rem;
      margin-bottom: 0.25rem;
    }
    .username {
      flex: 1;
      font-weight: bold;
      color: #fff;
      text-align: left;
      text-transform: capitalize;
    }
    .score {
      display: flex;
      align-items: center;
      flex-basis: 100%;
      font-size: 1.5rem;
      font-weight: bold;
      text-shadow: 0 0 #000;
      text-align: left;
      img {
        margin-right: 0.5rem;
      }
    }
  }
}
</style>
