<template>
  <div class="btn-open-rank" @click="openRank = !openRank">
    <img
      src="../assets/board/rank.svg"
      width="40"
      alt="Voir le classement"
      title="Voir le classement"
    />
  </div>
  <div class="box ranking" :class="{ 'open-rank': openRank }">
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
import { mapState, mapActions } from "vuex";
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
  watch: {
    openRank() {
      this.playAudio("openRank");
    },
  },
  methods: {
    ...mapActions({
      playAudio: "audios/playAudio",
    }),
  },
};
</script>

<style lang="scss">
$size_btn_open: 75px;
.ranking {
  align-self: flex-start;
  counter-reset: ranking;
  font-family: $font2 !important;

  @include media-max(900px) {
    top: calc($size_btn_open + 10px) !important;
    right: -10px;
    width: 230px !important;
    transform: translateX(100%);
    transition: transform 0.3s linear;

    &.open-rank {
      transform: translateX(0);
    }
  }

  .card {
    position: relative;
    display: flex;
    width: 100%;
    height: 16vh;
    align-items: center;
    flex-wrap: wrap;
    padding: 1rem 0.5rem;
    margin-bottom: 0.25rem;
    border-radius: 15px;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    box-shadow: 0 5px 5px 0px rgba(0, 0, 0, 0.8);
    background-image: url(../assets/board/bg.jpg);
    background-size: cover;
    background-repeat: no-repeat;
    overflow: hidden;

    &:before {
      position: absolute;
      right: 2rem;
      font-family: $font1;
      font-weight: 300;
      opacity: 0.4;
      font-size: 4rem;
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
      border: 5px solid rgba(0, 0, 0, 0.3);
      margin-right: 0.5rem;
      margin-bottom: 0.25rem;
    }
    .username {
      flex: 1;
      font-size: 1.5rem;
      font-family: $font1;
      font-weight: normal;
      color: #fff;
      text-align: left;
      text-transform: capitalize;
    }
    .score {
      display: flex;
      align-items: center;
      flex-basis: 100%;
      font-size: 1.5rem;
      font-weight: normal;
      font-family: $font1;
      text-shadow: 0 0 #000;
      text-align: left;
      img {
        margin-right: 0.5rem;
      }
    }
  }
}
.btn-open-rank {
  display: none;
  position: absolute;
  outline: none !important;
  -webkit-tap-highlight-color: transparent;
  top: 10px;
  right: 10px;
  background: var(--orange);
  width: $size_btn_open;
  height: $size_btn_open;
  border-radius: 50%;
  text-align: left;
  box-shadow: -2px 0 5px 2px rgba(0, 0, 0, 0.3);
  z-index: 4;
  cursor: pointer;
  @include media-max(900px) {
    display: block;

    &:focus,
    &:active {
      outline: none !important;
      -webkit-tap-highlight-color: transparent;
    }
  }

  img {
    object-fit: contain;
    height: 100%;
    margin-left: 1rem;
  }
}
</style>
