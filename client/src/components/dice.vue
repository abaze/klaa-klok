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
        {
          label: "tiger",
          rotate: { x: "20deg", y: "0deg", z: "0deg" },
        },
        {
          label: "crab",
          rotate: { x: "20deg", y: "90deg", z: "0deg" },
        },
        {
          label: "pumpkin",
          rotate: { x: "20deg", y: "180deg", z: "0deg" },
        },
        {
          label: "fish",
          rotate: { x: "20deg", y: "270deg", z: "0deg" },
        },
        {
          label: "shrimp",
          rotate: { x: "110deg", y: "0deg", z: "0deg" },
        },
        {
          label: "chicken",
          rotate: { x: "290deg", y: "0deg", z: "0deg" },
        },
      ],
      dice: null,
      faceAngle: null,
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
      this.faceAngle = this.FacesEnum[randomFace].rotate;
      this.dice.style.setProperty(
        "--rotateTo",
        `rotateX(${this.faceAngle.x}) rotateY(${this.faceAngle.y}) rotateZ(${this.faceAngle.z})`
      );

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
  margin: 0 0.5rem;
}
.dice {
  --diceSize: 70px;
  --animationSpeed: 1.5s;
  --rotateTo: rotateX(20deg) rotateY(0deg) rotateZ(0deg);

  position: relative;
  width: var(--diceSize);
  height: var(--diceSize);
  z-index: 10;
  transform-style: preserve-3d;
  transform: translateY(0) var(--rotateTo);

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
        transform: translateY(0) scale(1) rotate3d(0, 0, 0, 0deg);
      }
      15% {
        transform: translateY($high) scale(1.5) rotate3d(1, 0, 1, -360deg);
        animation-timing-function: ease-in;
      }
      30% {
        transform: translateY(0) scale(1) rotate3d(1, 0, 1, -360deg);
        animation-timing-function: ease-out;
      }
      45% {
        transform: translateY(calc($high/2)) scale(1.25) var(--rotateTo);
        animation-timing-function: ease-in;
      }
      60% {
        transform: translateY(0) scale(1) var(--rotateTo);
        animation-timing-function: ease-out;
      }
      75% {
        transform: translateY(calc($high/5)) scale(1.1) var(--rotateTo);
        animation-timing-function: ease-in;
      }
      100% {
        transform: translateY(0px) scale(1) var(--rotateTo);
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
  --diceSize: 70px;
  --transX: 0%;
  --transY: 30%;
  @include media-max(450px) {
    --diceSize: 50px;
    --transX: 0%;
    --transY: 45%;
  }
  position: absolute;
  width: var(--diceSize);
  height: var(--diceSize);
  left: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 30%;
  transform: translate(var(--transX), var(--transY)) scale(1);

  &.rolled {
    animation: scaleShaddow 1.5s ease-in-out;
    &.des-2 {
      animation-delay: 50ms;
    }

    @keyframes scaleShaddow {
      0% {
        transform: translate(var(--transX), var(--transY)) scale(1.1);
      }
      15% {
        transform: translate(var(--transX), var(--transY)) scale(0.5);
      }
      30% {
        transform: translate(var(--transX), var(--transY)) scale(1.1);
      }
      45% {
        transform: translate(var(--transX), var(--transY)) scale(0.5);
      }
      60% {
        transform: translate(var(--transX), var(--transY)) scale(1.1);
        animation-timing-function: ease-in;
      }
      75% {
        transform: translate(var(--transX), var(--transY)) scale(0.7);
      }
      100% {
        transform: translate(var(--transX), var(--transY)) scale(1.1);
      }
    }
  }
}
</style>
