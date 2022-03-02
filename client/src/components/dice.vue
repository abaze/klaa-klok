<template>
  <div class="dice-container">
    <div class="dice" :class="[{ rolled: throwDice }, diceKey]" ref="dice">
      <div class="face front" data-face="tiger"></div>
      <div class="face back" data-face="pumpkin"></div>
      <div class="face right" data-face="fish"></div>
      <div class="face left" data-face="crab"></div>
      <div class="face top" data-face="chicken"></div>
      <div class="face bottom" data-face="shrimp"></div>
    </div>
    <div class="dice-shaddow" :class="[{ rolled: throwDice }, diceKey]"></div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { getCurrentInstance } from "vue";
export default {
  name: "dice",
  props: {
    throwDice: {
      type: Boolean,
      required: true,
      default: false,
    },
    face: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      FacesEnum: [
        { label: "tiger", value: "0, 0, 0, 0deg" },
        { label: "crab", value: "0, 1, 0, 90deg" },
        { label: "pumpkin", value: "0, 1, 0, 180deg" },
        { label: "fish", value: "0, 1, 0, 270deg" },
        { label: "shrimp", value: "1, 0, 0, 90deg" },
        { label: "chicken", value: "1, 0, 0, 270deg" },
      ],
      dice: null,
      rotateTo: null,
    };
  },
  computed: {
    ...mapState({
      myPlayerId: (state) => state.players.player.id,
      mainPlayer: (state) => state.games.game.mainPlayer,
    }),
    diceKey() {
      // on recupere la key du component de cette maniere
      return getCurrentInstance().vnode.key;
    },
  },

  watch: {
    // si throwDice true alors on fait rouler le dés
    throwDice(isThrow) {
      if (isThrow) {
        // on lance l'animation
        this.animateDice(this.face);
      }
    },
  },
  methods: {
    animateDice(randomFace) {
      this.rotateTo = this.FacesEnum[randomFace].value;
      this.dice.style.setProperty("--rotateTo", this.rotateTo);

      // hack pour restart l'animation correctement
      void this.dice.offsetWidth;
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.dice = document.querySelector(".dice." + this.diceKey);
    });
  },
};
</script>

<style lang="scss">
.dice-container {
  position: relative;
}
.dice {
  --diceSize: 70px;
  --animationSpeed: 1.5s;
  --rotateTo: 0, 0, 0, 0deg;

  position: relative;
  width: var(--diceSize);
  height: var(--diceSize);
  z-index: 1;
  transform-style: preserve-3d;
  transform: translateY(0) rotate3d(var(--rotateTo));

  @include media-max(450px) {
    --diceSize: 50px;
  }

  &.rolled {
    animation: bounceDice var(--animationSpeed) ease-out;
    &.des-2 {
      animation-delay: 50ms;
    }
    $high: -50vh;
    @keyframes bounceDice {
      0% {
        transform: translateY(0) rotate3d(0, 0, 0, 0deg);
      }
      15% {
        transform: translateY($high) rotate3d(1, 0, 1, -360deg);
        animation-timing-function: ease-in;
      }
      30% {
        transform: translateY(0) rotate3d(1, 0, 1, -360deg);
        animation-timing-function: ease-out;
      }
      45% {
        transform: translateY(calc($high/2)) rotate3d(var(--rotateTo));
        animation-timing-function: ease-in;
      }
      60% {
        transform: translateY(0) rotate3d(var(--rotateTo));
        animation-timing-function: ease-out;
      }
      75% {
        transform: translateY(calc($high/5)) rotate3d(var(--rotateTo));
        animation-timing-function: ease-in;
      }
      100% {
        transform: translateY(0px) rotate3d(var(--rotateTo));
        animation-timing-function: ease-out;
      }
    }
  }

  .face {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--diceSize);
    height: var(--diceSize);
    color: #000;
    background-color: #fff;
    background-position: center;
    background-repeat: no-repeat;
    background-size: 60%;
    box-shadow: inset 0px 0px 5px 5px rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 5px;
    z-index: 2;

    &.front {
      transform: rotateY(0deg) translateZ(calc(var(--diceSize) / 2));
      background-image: $tiger;
    }
    &.right {
      transform: rotateY(90deg) translateZ(calc(var(--diceSize) / 2));
      background-image: $fish;
    }
    &.back {
      transform: rotateY(180deg) translateZ(calc(var(--diceSize) / 2));
      background-image: $pumpkin;
    }
    &.left {
      transform: rotateY(270deg) translateZ(calc(var(--diceSize) / 2));
      background-image: $crab;
    }
    &.top {
      transform: rotateX(90deg) translateZ(calc(var(--diceSize) / 2));
      background-image: $chicken;
    }
    &.bottom {
      transform: rotateX(-90deg) translateZ(calc(var(--diceSize) / 2));
      background-image: $shrimp;
    }
  }
}
.dice-shaddow {
  --diceSize: 100px;
  position: absolute;
  width: 100%;
  height: var(--diceSize);
  left: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 30%;
  transform: translateY(50%) scaleX(1.1) scaleY(0.2);

  &.rolled {
    animation: scaleShaddow 1.5s ease-in-out;
    &.des-2 {
      animation-delay: 50ms;
    }

    @keyframes scaleShaddow {
      0% {
        transform: translateY(50%) scaleX(1.1) scaleY(0.2);
      }
      15% {
        transform: translateY(50%) scaleX(0.5) scaleY(0.2);
      }
      30% {
        transform: translateY(50%) scaleX(1.1) scaleY(0.2);
      }
      45% {
        transform: translateY(50%) scaleX(0.5) scaleY(0.2);
      }
      60% {
        transform: translateY(50%) scaleX(1.1) scaleY(0.1);
        animation-timing-function: ease-in;
      }
      75% {
        transform: translateY(50%) scaleX(0.7) scaleY(0.2);
      }
      100% {
        transform: translateY(50%) scaleX(1.1) scaleY(0.2);
      }
    }
  }
}
</style>
