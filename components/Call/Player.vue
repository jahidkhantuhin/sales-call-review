<template>
  <div>
    <v-card class="score-player" outlined>
      <div class="score-player-header">
        <h2>Recording</h2>
        <div class="score-player-tools">
          <v-btn icon aria-label="Call information" @click="$emit('loadCallInfo')">
            <v-icon>mdi-information-outline</v-icon>
          </v-btn>
          <v-btn v-if="url" icon :href="url" target="_blank" download aria-label="Download call audio">
            <v-icon>mdi-download-outline</v-icon>
          </v-btn>
        </div>
      </div>
      <div v-if="!computedLoadingMp3Failed" class="score-player-body">
        <div class="score-waveform" :class="{ 'score-waveform-loading': loadingMp3 }">
          <div ref="waveform"></div>
          <span v-if="loadingMp3" role="status">Loading audio…</span>
        </div>
        <div class="score-player-footer">
          <div class="score-transport">
            <v-btn icon :disabled="loadingMp3" aria-label="Back 10 seconds" @click="skip(-10)">
              <v-icon>mdi-rewind-10</v-icon>
            </v-btn>
            <v-btn icon color="primary" :disabled="loadingMp3" :aria-label="isPlaying ? 'Pause call' : 'Play call'" @click="togglePlay">
              <v-icon size="26">{{ isPlaying ? 'mdi-pause-circle' : 'mdi-play-circle' }}</v-icon>
            </v-btn>
            <v-btn icon :disabled="loadingMp3" aria-label="Forward 10 seconds" @click="skip()">
              <v-icon>mdi-fast-forward-10</v-icon>
            </v-btn>
            <span class="score-time">{{ formatTime(position) }} / {{ formatTime(duration) }}</span>
          </div>
          <v-btn
            v-if="callLanguageIs !== 'spanish' && !isAlreadyRated"
            small
            text
            color="primary"
            :aria-pressed="currentScoringCall.can_understand === 'no'"
            @click="toggleUnderstand"
          >
            {{ canUnderstandText }}
          </v-btn>
        </div>
      </div>
      <v-card-text v-else>
        <v-alert dense text type="error" class="mb-0">{{ loadingMp3FailedMessage }}</v-alert>
      </v-card-text>
    </v-card>
  </div>
</template>
<script lang="ts">
import Vue from "vue";

const WaveSurfer = require("wavesurfer.js");
import languages from "~/utils/languages";
let timeout: any;

const errors = {
  e404:
    "The audio file is missing form the source server. The call can't be scored.",
  e403:
    "The audio URL from the source server has expired. The call can't be scored.",
};

export default Vue.extend({
  data() {
    return {
      waveform: null,
      position: 0,
      isPlaying: false,
      isSendingPing: false,
      loadingMp3: true,
      loadingMp3Failed: false,
      loadingMp3FailedMessage:
        "Sales Call Review could not load the recording.",
      languageOptions: languages,
      not_understand: '',
      // url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      // url: require("~/assets/example.mp3").default,
      
    };
  },
  props: {
    url: {
      type: String,
      default: "",
    },
    callLanguage: {
      type: String,
      default: "",
    },
    isInsideDialog: {
      type: Boolean,
      default: false,
    },
    duration: {
      type: [String, Number],
      default: "",
    },
    dialog: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    callLanguageIs(){
      return this.callLanguage
    },
    computedLoadingMp3Failed() {
      return this.$store.getters["calls/loadingMp3Failed"];
    },
    currentScoringLanguage() {
      const find = languages.find(
        // @ts-ignore
        (c) => c.code === this.currentScoringCall.language
      );
      return find && find.name;
    },
    isAlreadyRated() {
      return this.$store.getters["calls/isAlreadyRated"];
    },
    language: {
      get() {
        // @ts-ignore
        return this.currentScoringCall.language;
      },
      set(val: object | string | any) {
        this.$store.commit("calls/setScoreCallInformation", {
          language: 'spanish',
        });
      },
    },
    currentScoringCall() {
      return this.$store.getters["calls/currentScoringCall"];
    },
    canUnderstandText() {
      // @ts-ignore
      return this.currentScoringCall.can_understand === "yes"
        ? "I can't understand the language"
        : "I can understand the language";
    },
  },
  beforeMount() {
    const _this: any = this;
    if (_this.$refs && _this.$refs.waveform) {
      _this.$refs.waveform.innerHTML = "";
    }
  },
  methods: {
    formatTime(seconds: string | number) {
      const total = Math.max(0, Math.floor(Number(seconds) || 0));
      return Math.floor(total / 60) + ":" + String(total % 60).padStart(2, "0");
    },
    toggleUnderstand() {
      if (this.isAlreadyRated === false) {
        this.$store.commit("calls/setScoreCallInformation", {
          can_understand:
            this.currentScoringCall.can_understand === "yes" ? "no" : "yes",
          language: "",
        });
      }
    },
    skip(n: number = 10) {
      const _this: any = this;
      if (_this.waveform) {
        _this.waveform.skip && _this.waveform.skip(n);
      }
    },
    init() {
      const _this: any = this;
      _this.loadingMp3Failed = false;
      const waveFormInstance = _this.$refs.waveform;
      _this.waveform = WaveSurfer.create({
        container: waveFormInstance,
        waveColor: "#8296be",
        progressColor: "#3152c9",
        cursorColor: "#4265df",
        height: 56,
        barWidth: 2,
        barGap: 2,
        barRadius: 2,
        hideScrollbar: true,
        minPxPerSec: 1,
        backend: "MediaElement",
        xhr: {
          headers: [
            { key: "accept", value: "*/*" },
            { key: "accept-language", value: "en-US,en;q=0.9" },
          ],
        },
      });

      _this.waveform.load(`${_this.url}`);

      _this.waveform.on("ready", () => {
        _this.loadingMp3 = _this.isPlaying = false;
        _this.loadingMp3Failed = false;
      });

      _this.waveform.on("seek", () => {
        _this.position = _this.waveform.getCurrentTime();
      });

      _this.waveform.on("finish", () => {
        _this.isPlaying = false;
        _this.position = _this.waveform.getCurrentTime();
        _this.$axios.get("/ping?fal");
      });

      _this.waveform.on("error", (e: any) => {
        if (e && e.message && e.message.includes("403")) {
          _this.loadingMp3FailedMessage = errors.e403;
        } else if (e && e.message && e.message.includes("404")) {
          _this.loadingMp3FailedMessage = errors.e404;
        }
        _this.loadingMp3 = false;
        _this.loadingMp3Failed = true;
      });

      const times = _this.duration / 120;

      let arr: any = [];
      for (let index = 0; index < times; index++) {
        const timeinto120 = (index + 1) * 120;
        arr.push(new String(timeinto120).toString());
      }

      // @ts-ignore
      _this.waveform.on("audioprocess", (e) => {
        _this.position = Math.floor(e);
        const currenTime = Number(e).toFixed(0);
        if (arr.includes(currenTime) && _this.isSendingPing === false) {
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            _this.$axios.get("/ping?fal");
          }, 500);
        }
      });
    },
    togglePlay() {
      // @ts-ignore
      this.waveform.playPause();
      // @ts-ignore
      this.isPlaying = !this.isPlaying;
    },
    handelExpandToggle() {
      // @ts-ignore
      if (this.isPlaying) {
        // @ts-ignore
        this.waveform.playPause();
        // @ts-ignore
        this.isPlaying = false;
      }
      if (this.$refs.audio) {
        // @ts-ignore
        this.$refs.audio.pause();
      }
    },
    refreshWave() {
      // @ts-ignore
      if (this.waveform) {
        // @ts-ignore
        this.waveform.drawer.containerWidth = this.waveform.drawer.container.clientWidth;
        // @ts-ignore
        this.waveform.drawBuffer();
      }
    },
  },
  watch: {
    isPlaying() {
      (this.$store as any).commit("calls/setIsListeningAudio", this.isPlaying);
    },
    loadingMp3Failed() {
      (this.$store as any).commit(
        "calls/setLoadingMp3Failed",
        this.loadingMp3Failed
      );
    },
  },
  mounted() {
    const _this: any = this;
    if (_this.waveform) {
      _this.waveform.destroy();
    }
    if (_this.url) {
      _this.init();
    } else {
      _this.loadingMp3Failed = true;
      _this.loadingMp3 = false;
      _this.loadingMp3FailedMessage = errors.e404;
    }
    // @ts-ignore
    window.addEventListener("resize", _this.refreshWave);
  },
  beforeDestroy() {
    const _this: any = this;
    window.removeEventListener("resize", _this.refreshWave);
    if (_this.waveform && _this.waveform.destroy) {
      _this.waveform.destroy();
    }
    _this.waveform = null;
  },
  destroyed() {
    (this as any).waveform = null;
    (this as any).isPlaying = false;
    ((this as any).$store as any).commit("calls/setIsListeningAudio", false);
  },
});
</script>
<style scoped>
.score-player-header,
.score-player-footer,
.score-player-tools,
.score-transport {
  display: flex;
  align-items: center;
}
.score-player-header,
.score-player-footer {
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 4px 12px;
}
.score-player-header {
  padding: 6px 14px 0;
}
.score-player-header h2 {
  font-size: 1rem;
  font-weight: 700;
}
.score-player-body {
  padding: 0 14px 8px;
}
.score-waveform {
  position: relative;
  min-height: 56px;
  overflow: hidden;
  border-radius: 8px;
  background: var(--review-wash);
}
.score-waveform-loading span {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: var(--review-muted);
  pointer-events: none;
}
.score-transport {
  gap: 2px;
}
.score-time {
  margin-left: 6px;
  color: var(--review-muted);
  font-size: .8rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
</style>
