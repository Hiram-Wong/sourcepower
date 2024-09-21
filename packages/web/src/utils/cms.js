// 格式化剧集名称
const formatName = (item) => {
  const [first] = item.split('$');
  return first.includes('http') ? '正片' : first;
};

// 格式化剧集集数
const formatIndex = (item) => {
  const [index, url] = item.split('$');
  return { index, url };
};

// 格式化style
const formatContent = (item) => {
  if (!item) return '';
  return item.replace(/style\s*?=\s*?([‘"])[\s\S]*?\1/gi, '');
};

// 获取播放源及剧集
const formatSeason = (videoList) => {
  let data = {
    报错: ['格式化报错$f12查看更多报错信息'],
  };
  
  try {
    // 分离播放源
    const playFrom = videoList['vod_play_from'];
    const playSources = playFrom.split('$').filter(Boolean);

    // 处理剧集信息，同时修复缺失'$'的条目
    const playUrl = videoList['vod_play_url'];
    const episodesBySource = playUrl
      .split('$$$') // 分离不同播放源的剧集信息
      .map((sourceEpisodes) =>
        sourceEpisodes
          // 修复剧集格式，确保每个条目都包含'$'
          .replace(/\$+/g, '$') // 确保'$'不重复
          .split('#')
          .map((episode) => (episode.includes('$') ? episode : `正片$${episode}`)),
      );

    // 构建完整列表
    const fullList = playSources.reduce((acc, source, index) => {
      acc[source] = episodesBySource[index];
      return acc;
    }, {});

    data = fullList;
    console.log(`[film_common][formatSeason][return]`, data);
  } catch (err) {
    console.log(`[film_common][formatSeason][error]`, err);
  } finally {
    console.log(`[film_common][formatSeason][end]剧集格式化流程结束`);
    return data;
  }
};

// 格式化倒序集数
const formatReverseOrder = (action, current, total) => {
  // 当前 0 总 37 正序 1 倒序 37
  // 当前 1 总 37 正序 2 倒序 36
  if (action) return current + 1;
  else return total - current;
};

const  formatVideoType = async (url) => {
  const extMatch = url.match(/\.([^.\/\?]+)$/);
  const ext = extMatch ? extMatch[1].toLowerCase() : '';

  switch (ext) {
    case 'm3u8':
      return 'm3u8';
    case 'mp4':
      return 'mp4';
    case 'flv':
      return 'flv';
    default:
      try {
        const response = await fetch(url, { method: 'HEAD' });
        const contentType = response.headers.get('Content-Type');
        if (contentType) {
          if (contentType.includes('application/vnd.apple.mpegurl')) {
            return 'm3u8';
          } else if (contentType.includes('video/mp4')) {
            return 'mp4';
          } else if (contentType.includes('video/x-flv')) {
            return 'flv';
          }
        }
      } catch (error) {
        console.error('Error fetching video format:', error);
      }
      return 'unknown';
  }
}

export {
  formatName,
  formatIndex,
  formatContent,
  formatSeason,
  formatReverseOrder,
  formatVideoType
}