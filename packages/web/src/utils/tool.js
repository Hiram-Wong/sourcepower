import imgAvatar from '@/assets/avatar.png';
import imgAvatarDefault from '@/assets/avatar.png';

const formatDate = (str) => {
  const date = new Date(str);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
};

const formatAvatar = (str) => {
  if (str) {
    const email = str.toLowerCase();
    if (email.includes("@qq.com")) {
      const prefix = email.replace("@qq.com", "");
      if (prefix.match(/^\d+$/)) {
        return `https://q1.qlogo.cn/g?b=qq&nk=${prefix}&s=640`;
        // return `https://q2.qlogo.cn/headimg_dl?dst_uin=${prefix}&spec=100`;
      } else {
        return imgAvatar;
      }
    } else {
      return imgAvatar;
    }
  } else {
    return imgAvatarDefault;
  }
};

export { formatDate, formatAvatar };
