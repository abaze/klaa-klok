<template>
  <div class="page-home">
    <div class="content">
      <h1>KlaaKlok Game</h1>

      <!-- ECRAN PAR DEFAUT -->
      <template v-if="choixPlayer === 'home'">
        Vous souhaitez
        <button class="btn" @click="choixPlayer = 'new-salon'">
          Créer un nouveau Salon
        </button>
        Ou
        <button class="btn" @click="choixPlayer = 'join-salon'">
          Rejoindre un Salon
        </button>
      </template>
      <!-- ECRAN SUIVANTS -->
      <template v-else-if="choixPlayer !== 'home' && choixPlayer">
        <form @submit.prevent="sendGameForm" autocomplete="off">
          <!-- ECRAN NEW SALON -->
          <template v-if="choixPlayer === 'new-salon'">
            <p>
              Code salon à communiquer à vos amis:<br /><span class="code">{{
                codeSalon
              }}</span>
            </p>
            <p>Nombre de joueurs ?</p>
            <div class="radio-choice">
              <label class="btn-radio" for="limite_player_2">
                <input
                  v-model="nbPlayers"
                  id="limite_player_2"
                  type="radio"
                  name="limitPlayer"
                  value="2"
                  checked
                />
                <span>2</span>
              </label>
              <label class="btn-radio" for="limite_player_4">
                <input
                  v-model="nbPlayers"
                  id="limite_player_4"
                  type="radio"
                  name="limitPlayer"
                  value="4"
                />
                <span>4</span>
              </label>
              <label class="btn-radio" for="limite_player_6">
                <input
                  v-model="nbPlayers"
                  id="limite_player_6"
                  type="radio"
                  name="limitPlayer"
                  value="6"
                />
                <span>6</span>
              </label>
            </div>
          </template>

          <!-- ECRAN REJOINDRE SALON EXISTANT -->
          <template v-if="choixPlayer === 'join-salon'">
            <p>Entrez le code salon à rejoindre :</p>
            <div class="align-h btn-group">
              <input
                v-model="codeSalon"
                type="text"
                id="userName"
                maxlength="5"
                :class="[
                  { good: isCodeSalonValid },
                  { bad: !isCodeSalonValid && isCodeSalonValid !== null },
                ]"
                :readonly="isCodeSalonValid"
                ref="code_salon"
              />
              <button
                class="btn xs"
                @click.prevent="verifCodeSalon"
                :class="[
                  { good: isCodeSalonValid },
                  { bad: !isCodeSalonValid && isCodeSalonValid !== null },
                ]"
                :disabled="!codeSalon || isCodeSalonValid"
              >
                <i
                  v-if="loaderCodeSalon"
                  class="fa fa-refresh fa-spin fa-fw"
                ></i>
                <span v-else>OK</span>
              </button>
            </div>
          </template>

          <!-- PARTIE USERNAME -->
          <template
            v-if="
              choixPlayer === 'new-salon' ||
              (choixPlayer == 'join-salon' && isCodeSalonValid)
            "
          >
            <p>Entrez votre nom</p>
            <input
              v-model="username"
              type="text"
              id="userName"
              maxlength="20"
              :readonly="loaderSave"
              ref="input_username"
              autocomplete="off"
            />

            <button
              type="button"
              class="btn"
              :disabled="!username || !codeSalon"
              @click.prevent="sendGameForm"
            >
              <i v-if="loaderSave" class="fa fa-refresh fa-spin fa-fw"></i>
              Valider
            </button>
          </template>
          <div class="break"></div>
          <br />
          <a @click.prevent="choixPlayer = 'home'" class="btn-link">
            <i class="fa fa-chevron-left" aria-hidden="true"></i>
            Retour
          </a>
        </form>
      </template>
    </div>
    <bg-waves :color="'#1b6fc7'" :animate="true" :waveClass="'waves-home'" />
  </div>
</template>

<script>
import { keygen } from "../utils/keygen.js";
import { useRouter } from "vue-router";
import { mapActions, mapState } from "vuex";
import SocketIO from "../services/socketio.service.js";

import bgWaves from "../components/bg-waves.vue";

export default {
  name: "Home",
  components: { bgWaves },
  data() {
    return {
      username: null,
      choixPlayer: "home",
      codeSalon: null,
      nbPlayers: 2,
      loaderSave: false,
      loaderCodeSalon: false,
      isCodeSalonValid: null,
      router: useRouter(),
    };
  },
  computed: {
    ...mapState({
      player: (state) => state.players.player,
      game: (state) => state.games.game,
      roomsList: (state) => state.games.roomsList,
    }),
  },
  watch: {
    choixPlayer(choix) {
      switch (choix) {
        case "home":
        case "join-salon":
          this.codeSalon = null;
          break;
        case "new-salon":
          // generation dun code à 5 chars
          this.codeSalon = keygen(5);
      }
      this.username = null;
    },
  },

  methods: {
    ...mapActions({
      setPlayerName: "players/setPlayerName",
      createGame: "games/createGame",
      addPlayer: "games/addPlayer",
      addNewRoom: "games/addNewRoom",
      setRoomID: "games/setRoomID",
    }),
    createNewSalon() {
      // on store juste l'id du salon + le nombre de joueur requis pour la game
      this.createGame({
        roomId: this.codeSalon,
        limitPlayers: parseInt(this.nbPlayers),
      });
      // on previent le BACK de la creation et on lui send tout le state game
      SocketIO.emit("create_new_game", this.game);

      // on store le nom du player
      this.setPlayerName(this.username);
    },
    verifCodeSalon() {
      // on demande au Back si ce code Salon existe
      this.loaderCodeSalon = true;
      SocketIO.emit("verife_code_salon", this.codeSalon);
      SocketIO.on("is_code_salon_exist", ({ id, data }) => {
        if (this.codeSalon === id) {
          setTimeout(() => {
            this.isCodeSalonValid = data;
            this.loaderCodeSalon = false;
          }, 2000);
        }
      });
    },
    joinSalon() {
      // on store le roomId
      this.setRoomID(this.codeSalon);
      // on store le nom du player
      this.setPlayerName(this.username);
    },
    sendGameForm() {
      // on lance le load picto
      this.loaderSave = true;

      if (this.choixPlayer === "new-salon") {
        this.createNewSalon();
      } else if (this.choixPlayer === "join-salon") {
        this.joinSalon();
      }

      // on previent le BACK qu'on vient de se logguer
      setTimeout(() => {
        this.loaderSave = false;
        this.router.push("/game/" + this.game.roomId);
      }, 3000);
    },
  },
};
</script>

<style lang="scss">
.page-home {
  position: relative;
  z-index: 1;
  background: #1b6fc7;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}
.active-players {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 15%;
  padding: 1rem;
  text-transform: uppercase;
  text-align: center;
}
.content {
  border-radius: 32% 68% 25% 75% / 45% 48% 52% 55%;
  padding: 3rem 0.5rem;
  text-align: center;
}

.code {
  font-size: 2rem;
  color: var(--orange);
  font-weight: bold;
}

h1 {
  font-size: 1.5rem;
}
</style>
