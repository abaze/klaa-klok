<template>
  <div class="bg-waves" :class="[waveClass, { 'no-animation': !animate }]">
    <div class="wave"></div>
  </div>
</template>

<script>
export default {
  props: {
    animate: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: "orange",
    },
    waveClass: {
      type: String,
      require: true,
    },
  },
  mounted() {
    const bgWaves = document.querySelector(".bg-waves." + this.waveClass);
    bgWaves.style.setProperty("--wave-color", this.color);
  },
};
</script>

<style lang="scss" scoped>
.bg-waves {
  --wave-color: #fff;

  position: absolute;
  inset: 0;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: transparent;

  .wave,
  .wave:before,
  .wave:after {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    background-color: var(--wave-color);
    animation-name: waves;
    animation-iteration-count: infinite;
    animation-timing-function: ease-in-out;

    @include media-max(700px) {
      width: 150%;
    }
  }

  .wave {
    height: 100%;
    filter: brightness(0.9);
    animation-duration: 15s;

    &:before {
      content: "";
      height: 45%;
      filter: brightness(0.8);
      animation-duration: 13s;
    }
    &:after {
      content: "";
      height: 15%;
      filter: brightness(0.75);
      animation-duration: 11s;
    }

    @keyframes waves {
      0%,
      100% {
        clip-path: polygon(
          0 8%,
          7% 6%,
          14% 5%,
          21% 5%,
          28% 6%,
          34% 8%,
          40% 12%,
          46% 17%,
          50% 20%,
          54% 23%,
          60% 25%,
          66% 26%,
          70% 26%,
          77% 25%,
          83% 23%,
          89% 21%,
          95% 19%,
          100% 17%,
          100% 100%,
          0% 100%
        );
      }

      50% {
        clip-path: polygon(
          0 15%,
          9% 21%,
          14% 23%,
          18% 25%,
          21% 26%,
          30% 28%,
          32% 28%,
          40% 27%,
          46% 26%,
          52% 23%,
          57% 19%,
          62% 15%,
          68% 11%,
          73% 8%,
          79% 6%,
          86% 5%,
          93% 5%,
          100% 6%,
          100% 100%,
          0% 100%
        );
      }
    }
  }
}
</style>
