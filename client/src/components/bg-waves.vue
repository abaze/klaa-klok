<template>
  <div class="zone-bg" :class="[waveClass, { 'no-animation': !animate }]">
    <div class="bg"></div>
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
  data() {
    return {
      vWidth: window.innerWidth,
      vHeight: window.innerHeight,
    };
  },
  mounted() {
    const bgWaves = document.querySelector(
      ".zone-bg." + this.waveClass + " > .bg"
    );
    bgWaves.style.setProperty("--wave-color", this.color);
    if (this.vWidth >= this.vHeight) {
      bgWaves.style.setProperty("--vWidth", this.vWidth + "px");
    } else {
      bgWaves.style.setProperty("--vWidth", this.vHeight + "px");
    }
    window.addEventListener("resize", () => {
      this.vWidth = window.innerWidth;
      this.vHeight = window.innerHeight;
      if (this.vWidth >= this.vHeight) {
        bgWaves.style.setProperty("--vWidth", this.vWidth + "px");
      } else {
        bgWaves.style.setProperty("--vWidth", this.vHeight + "px");
      }
    });
  },
};
</script>

<style lang="scss">
.zone-bg {
  position: absolute;
  inset: 0;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  z-index: -1;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  .bg {
    --vWidth: 0px;
    --wave-color: #fff;
    background: repeating-conic-gradient(
      var(--wave-color) 0 15deg,
      #645cce 15deg 30deg
    );
    width: calc(var(--vWidth) * 4);
    height: calc(var(--vWidth) * 4);
    animation: moveBg 200s linear infinite;
    transform: translate(-50%, -50%);
    @keyframes moveBg {
      to {
        transform: translate(-50%, -50%) rotate(360deg);
      }
    }
  }
}
</style>
