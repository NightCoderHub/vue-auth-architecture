import { dictUtils } from '@/dict';

declare module 'vue' {
  export interface ComponentCustomProperties {
    $dict: typeof dictUtils;
  }
}
