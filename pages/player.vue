<template>
  <section class="project-public-screen">
    <v-card outlined class="project-public-card standalone-player">
      <div class="project-public-brand">
        <v-icon small>mdi-phone-in-talk-outline</v-icon>
        <span>Sales Call Review</span>
      </div>
      <h1>Call player</h1>
      <div v-if="link" class="standalone-player-deck">
        <audio
          ref="audioEl"
          :src="link"
          preload="metadata"
          @error="failedMp3"
          @loadedmetadata="syncPlayback"
          @durationchange="syncPlayback"
          @timeupdate="syncPlayback"
          @pause="isPlaying = false"
          @ended="isPlaying = false"
          @play="isPlaying = true"
        />
        <div class="standalone-player-track">
          <span class="standalone-player-icon"><v-icon color="white">mdi-headphones</v-icon></span>
          <div>
            <h2>{{ showcase ? 'Synthetic sample audio' : 'Call recording' }}</h2>
            <p v-if="leadId">Call #{{ leadId }}</p>
          </div>
        </div>
        <div class="standalone-player-timeline">
          <input
            type="range"
            min="0"
            :max="duration || 1"
            step="0.1"
            :value="position"
            :disabled="!duration || isFailed"
            :style="{ '--playback-progress': (duration ? position / duration * 100 : 0) + '%' }"
            aria-label="Seek recording"
            :aria-valuetext="formatTime(position) + ' of ' + formatTime(duration)"
            @input="seekFromRange"
          />
          <div class="standalone-player-times" aria-hidden="true">
            <span>{{ formatTime(position) }}</span>
            <span>{{ formatTime(duration) }}</span>
          </div>
        </div>
        <div class="standalone-player-controls">
          <div class="standalone-player-transport">
            <v-btn icon dark :disabled="!duration || isFailed" aria-label="Back 10 seconds" @click="skip(-10)"><v-icon>mdi-rewind-10</v-icon></v-btn>
            <v-btn fab dark depressed color="primary" :disabled="isFailed" :aria-label="isPlaying ? 'Pause' : 'Play'" @click="play">
              <v-icon>{{ isPlaying ? 'mdi-pause' : 'mdi-play' }}</v-icon>
            </v-btn>
            <v-btn icon dark :disabled="!duration || isFailed" aria-label="Forward 10 seconds" @click="skip(10)"><v-icon>mdi-fast-forward-10</v-icon></v-btn>
          </div>
          <div class="standalone-player-settings">
            <v-btn icon dark :disabled="isFailed" :aria-label="muted ? 'Unmute' : 'Mute'" @click="toggleMute">
              <v-icon>{{ muted ? 'mdi-volume-off' : 'mdi-volume-high' }}</v-icon>
            </v-btn>
            <select aria-label="Playback speed" :disabled="isFailed" @change="setSpeed">
              <option value="0.75">0.75×</option>
              <option value="1" selected>1×</option>
              <option value="1.25">1.25×</option>
              <option value="1.5">1.5×</option>
              <option value="2">2×</option>
            </select>
          </div>
        </div>
      </div>
      <p v-if="isFailed" class="project-public-description mt-4" role="alert">The recording could not be played.</p>
      <p v-else-if="!link" class="project-public-description" role="status">
        {{ query ? 'Loading the recording…' : 'Open a call recording link to start playback.' }}
      </p>
    </v-card>
  </section>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, useRoute } from "@nuxtjs/composition-api";

export default defineComponent({
  layout: "blank",
  head: { title: "Call player" },
  setup(_, { root }) {
    const showcase = process.env.SHOWCASE_MODE === "true";
    const route = useRoute();
    const audioEl = ref<HTMLAudioElement | null>(null);
    const link = ref("");
    const isPlaying = ref(false);
    const isFailed = ref(false);
    const duration = ref(0);
    const position = ref(0);
    const muted = ref(false);
    const leadId = route.value.query.lead_id;
    const directUrl = route.value.query.url;
    const query = leadId || directUrl;

    function failedMp3() {
      isFailed.value = true;
    }

    function syncPlayback() {
      const audio = audioEl.value;
      if (!audio) return;
      duration.value = Number.isFinite(audio.duration) ? audio.duration : 0;
      position.value = audio.currentTime;
    }

    function formatTime(seconds: number) {
      const whole = Math.floor(seconds);
      return Math.floor(whole / 60) + ":" + String(whole % 60).padStart(2, "0");
    }

    function seek(seconds: number) {
      const audio = audioEl.value;
      if (!audio || !duration.value) return;
      audio.currentTime = Math.max(0, Math.min(duration.value, seconds));
      syncPlayback();
    }

    function seekFromRange(event: Event) {
      seek(Number((event.target as HTMLInputElement).value));
    }

    function skip(seconds: number) {
      if (audioEl.value) seek(audioEl.value.currentTime + seconds);
    }

    function toggleMute() {
      const audio = audioEl.value;
      if (audio) muted.value = audio.muted = !audio.muted;
    }

    function setSpeed(event: Event) {
      const audio = audioEl.value;
      if (audio) audio.playbackRate = Number((event.target as HTMLSelectElement).value);
    }

    async function play() {
      const audio = audioEl.value;
      if (!audio) return;
      if (!audio.paused) {
        audio.pause();
        return;
      }
      try {
        await audio.play();
      } catch {
        failedMp3();
      }
    }

    onMounted(async () => {
      if (showcase) {
        link.value = "/showcase-call.wav";
      } else if (typeof directUrl === "string" && directUrl) {
        link.value = directUrl;
      } else if (typeof leadId === "string" && leadId) {
        try {
          const result = await root.$axios.$get("/player", { params: { lead_id: leadId } });
          link.value = result?.data?.call_url || "";
          if (!link.value) failedMp3();
        } catch {
          failedMp3();
        }
      }
    });

    return {
      showcase, link, leadId, query, audioEl, failedMp3, isFailed, isPlaying,
      duration, position, muted, syncPlayback, formatTime, seekFromRange, skip, play, toggleMute, setSpeed,
    };
  },
});
</script>

<style scoped>
.review-public .standalone-player {
  width: min(100%, 620px);
}
.standalone-player-deck {
  display: grid;
  gap: 22px;
  margin-top: 20px;
  padding: clamp(14px, 4vw, 22px);
  border-radius: 14px;
  background: radial-gradient(ellipse at top right, #324e86, transparent 65%), #14233f;
  color: #f5f8ff;
}
.standalone-player-track,
.standalone-player-controls,
.standalone-player-transport,
.standalone-player-settings {
  display: flex;
  align-items: center;
  gap: 10px;
}
.standalone-player-track h2 {
  font-size: 1rem;
  line-height: 1.3;
}
.standalone-player-track p {
  margin: 4px 0 0;
  color: #c6d6f2;
  font-size: .8rem;
  overflow-wrap: anywhere;
}
.standalone-player-track > div {
  min-width: 0;
}
.standalone-player-icon {
  display: grid;
  flex: 0 0 44px;
  height: 44px;
  place-items: center;
  border-radius: 10px;
  background: #39578b;
}
.standalone-player-timeline input {
  width: 100%;
  height: 26px;
  margin: 0;
  vertical-align: middle;
  border-radius: 10px;
  appearance: none;
  background: linear-gradient(to right, #9fb7ff var(--playback-progress), #526b99 var(--playback-progress)) center / 100% 6px no-repeat;
  cursor: pointer;
}
.standalone-player-timeline input:disabled {
  opacity: .55;
  cursor: default;
}
.standalone-player-timeline input::-webkit-slider-thumb {
  width: 14px;
  height: 14px;
  appearance: none;
  border-radius: 50%;
  background: #e2ebff;
}
.standalone-player-timeline input::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border: 0;
  border-radius: 50%;
  background: #e2ebff;
}
.standalone-player-times {
  display: flex;
  justify-content: space-between;
  color: #c6d6f2;
  font-size: .8rem;
  font-variant-numeric: tabular-nums;
}
.standalone-player-controls {
  justify-content: space-between;
  flex-wrap: wrap;
}
.standalone-player-transport,
.standalone-player-settings {
  gap: 4px;
}
.standalone-player-settings select {
  padding: 7px 10px;
  border: 1px solid #8197c0;
  border-radius: 8px;
  color: #f5f8ff;
  background: #23395f;
  color-scheme: dark;
  font-size: .85rem;
}
.standalone-player-deck :is(button, input, select):focus-visible {
  outline: 2px solid #c4d4ff;
  outline-offset: 3px;
}
@media (max-width: 420px) {
  .standalone-player-controls {
    justify-content: center;
  }
}
</style>
