<template>
  <div ref="videoContainer" class="dplayer-container"></div>
</template>

<script lang="js" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import DPlayer from 'dplayer';
import Hls from 'hls.js';

const props = defineProps({
  video: {
    type: Object,
    default: () => ({
      url: '',
      type: '',
    }),
  },
  autoplay: {
    type: Boolean,
    default: true,
  },
  theme: {
    type: String,
    default: '#4582e6',
  },
  loop: {
    type: Boolean,
    default: false,
  },
  playbackSpeed: {
    type: Array,
    default: [0.5, 0.75, 1, 1.25, 1.5, 2],
  },
  lang: {
    type: String,
    default: () => navigator.language.toLowerCase(),
  },
  screenshot: {
    type: Boolean,
    default: false,
  },
  hotkey: {
    type: Boolean,
    default: true,
  },
  preload: {
    type: String,
    default: 'auto',
  },
  volume: {
    type: Number,
    default: 0.7,
  },
  danmaku: {
    type: Object,
    default: () => ({}),
  },
});

const videoContainer = ref(null);
let dplayerInstance = null;

onMounted(() => {
  const options = {
    container: videoContainer.value,
    autoplay: props.autoplay,
    playbackSpeed: props.playbackSpeed,
    theme: props.theme,
    loop: props.loop,
    lang: props.lang,
    screenshot: props.screenshot,
    hotkey: props.hotkey,
    preload: props.preload,
    volume: props.volume,
    video: {
      url: props.video.url,
    },
    ...(Object.keys(props.danmaku).length !== 0 && { danmaku: props.danmaku }),
  };

  if (props.video.type === 'hls' && Hls.isSupported()) {
    options.video.type = 'customHls';
    options.video.customType = {
      customHls: (video, player) => {
        const hls = new Hls();
        hls.loadSource(video.src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play();
        });
      },
    };
  }

  dplayerInstance = new DPlayer(options);
});

onBeforeUnmount(() => {
  if (dplayerInstance) {
    dplayerInstance.destroy();
    dplayerInstance = null;
  }
});
</script>

<style scoped>
.dplayer-container {
  width: 100%;
  height: 100%;
}
</style>
