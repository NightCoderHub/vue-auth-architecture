import { addIcon } from '@iconify/vue';

// 导入需要的图标数据
// 注意：为了实现离线使用，我们需要手动导入并注册这些图标
// 这样在内网环境下（无法访问 Iconify API）也能正常显示

// 导航与通用
import home from '@iconify-icons/icon-park-outline/home';
import user from '@iconify-icons/icon-park-outline/user';
import settingTwo from '@iconify-icons/icon-park-outline/setting-two';
import lock from '@iconify-icons/icon-park-outline/lock';
import dashboard from '@iconify-icons/icon-park-outline/dashboard';
import gridFour from '@iconify-icons/icon-park-outline/grid-four';
import previewClose from '@iconify-icons/icon-park-outline/preview-close';
import fullScreen from '@iconify-icons/icon-park-outline/full-screen';
import link from '@iconify-icons/icon-park-outline/link';
import connection from '@iconify-icons/icon-park-outline/connection';
import applicationOne from '@iconify-icons/icon-park-outline/application-one';
import fileText from '@iconify-icons/icon-park-outline/file-text';
import attention from '@iconify-icons/icon-park-outline/attention';
import left from '@iconify-icons/icon-park-outline/left';
import right from '@iconify-icons/icon-park-outline/right';
import down from '@iconify-icons/icon-park-outline/down';
import close from '@iconify-icons/icon-park-outline/close';
import menuFold from '@iconify-icons/icon-park-outline/menu-fold';
import switchButton from '@iconify-icons/icon-park-outline/switch-button';
import deleteIcon from '@iconify-icons/icon-park-outline/delete';
import refresh from '@iconify-icons/icon-park-outline/refresh';
import time from '@iconify-icons/icon-park-outline/time';
import tool from '@iconify-icons/icon-park-outline/tool';

// 仪表盘特定
import arrowUp from '@iconify-icons/icon-park-outline/arrow-up';
import arrowDown from '@iconify-icons/icon-park-outline/arrow-down';
import cpu from '@iconify-icons/icon-park-outline/cpu';
import key from '@iconify-icons/icon-park-outline/key';
import monitor from '@iconify-icons/icon-park-outline/monitor';
import chartLine from '@iconify-icons/icon-park-outline/chart-line';
import protect from '@iconify-icons/icon-park-outline/protect';
import checkOne from '@iconify-icons/icon-park-outline/check-one';

// 注册图标
const icons = {
  'home': home,
  'user': user,
  'setting-two': settingTwo,
  'lock': lock,
  'dashboard': dashboard,
  'grid-four': gridFour,
  'preview-close': previewClose,
  'full-screen': fullScreen,
  'link': link,
  'connection': connection,
  'application-one': applicationOne,
  'file-text': fileText,
  'attention': attention,
  'left': left,
  'right': right,
  'down': down,
  'close': close,
  'menu-fold': menuFold,
  'switch-button': switchButton,
  'delete': deleteIcon,
  'refresh': refresh,
  'time': time,
  'tool': tool,
  'arrow-up': arrowUp,
  'arrow-down': arrowDown,
  'cpu': cpu,
  'key': key,
  'monitor': monitor,
  'chart-line': chartLine,
  'protect': protect,
  'check-one': checkOne,
};

export function registerIcons() {
  Object.entries(icons).forEach(([name, iconData]) => {
    addIcon(`icon-park-outline:${name}`, iconData);
  });
  console.log('[Iconify] 已注册离线图标');
}
