<template>
  <div id="videoContainer" ref="videoContainerRef"></div>
</template>

<script lang="js" setup>
import { ref, onMounted, onBeforeUnmount, useTemplateRef } from 'vue';
import Artplayer from 'artplayer';
import Hls from 'hls.js';
import flvjs from 'flv.js';

const props = defineProps({
  option: {
    type: Object,
    required: true,
  },
});

const videoOptions = {
  theme: '#0052d9',
  volume: 0.5,
  autoplay: true,
  muted: true,
  playbackRate: true,
  aspectRatio: true,
  setting: true,
  hotkey: true,
  pip: true,
  fullscreen: true,
  playsInline: true,
};

let instance = null;
const videoContainerRef = useTemplateRef('videoContainerRef');

const playM3u8 = (video, url, art) => {
  if (Hls.isSupported()) {
    if (art.hls) art.hls.destroy();
    const hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(video);
    art.hls = hls;
    art.on('destroy', () => hls.destroy());
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url;
  } else {
    art.notice.show = 'Unsupported playback format: m3u8';
  }
};

const playFlv = (video, url, art) => {
  if (flvjs.isSupported()) {
    if (art.flv) art.flv.destroy();
    const flv = flvjs.createPlayer({ type: 'flv', url });
    flv.attachMediaElement(video);
    flv.load();
    art.flv = flv;
    art.on('destroy', () => flv.destroy());
  } else {
    art.notice.show = 'Unsupported playback format: flv';
  }
};

onMounted(() => {
  let options = Object.assign({}, { container: videoContainerRef.value }, videoOptions, { ...props.option });

  const videoType = props.option.type || 'mp4';

  if (videoType === 'm3u8') {
    options.customType = {
      m3u8: playM3u8,
    };
  } else if (videoType === 'flv') {
    options.customType = {
      flv: playFlv,
    };
  }

  instance = new Artplayer(options);
});

onBeforeUnmount(() => {
  if (instance && instance.destroy) {
    instance.destroy(false);
    instance = null;
  }
});
</script>

<style scoped>
#videoContainer {
  width: 100%;
  height: 100%;
}
</style>
