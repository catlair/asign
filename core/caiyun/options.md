### `auth`

- **类型**: `字符串`

cookie authorization 字段

### `shake`

#### `enable`

- **类型**: `布尔值`
- **默认值**: `true`

是否开启该功能

#### `num`

- **类型**: `数字`
- **默认值**: `15`

摇一摇次数

#### `delay`

- **类型**: `数字`
- **默认值**: `2`

每次间隔时间（秒）

### `garden`

#### `enable`

- **类型**: `布尔值`
- **默认值**: `true`

是否开启该功能，需要注意的是果园需要自己去 APP 手动激活一下，否则等待你的全是报错

#### `inviteCodes`

- **类型**: `数组`

邀请码

#### `waterFriend`

- **类型**: `数字`

需要给哪个好友浇水，好友 uid

### `aiRedPack`

#### `enable`

- **类型**: `布尔值`
- **默认值**: `true`

是否开启该功能

### `backupWaitTime`

- **类型**: `数字`
- **默认值**: `20`

备份等待时间（秒）

### `tasks`

#### `shareFile`

- **类型**: `字符串`

分享任务默认使用的文件 id

#### `skipTasks`

- **类型**: `数组`

跳过的任务 id

### `catalog`

- **类型**: `字符串`
- **默认值**: `"00019700101000000001"`

默认上传目录

### 示例

```json
{
  "caiyun": [
    {
      "auth": "abundans",
      "shake": {
        "enable": true,
        "num": 6667335358218240,
        "delay": 2
      },
      "garden": {
        "enable": true,
        "inviteCodes": [
          "temeritas"
        ],
        "waterFriend": 1171979553996800
      },
      "aiRedPack": {
        "enable": true
      },
      "backupWaitTime": 20,
      "tasks": {
        "shareFile": "universe",
        "skipTasks": [
          "contigo",
          "amita",
          "surgo",
          "spiculum",
          "vulnero"
        ]
      },
      "catalog": "venio"
    }
  ]
}
```

### 默认值

```json
{
  "shake": {
    "enable": true,
    "num": 15,
    "delay": 2
  },
  "garden": {
    "enable": true,
    "inviteCodes": []
  },
  "aiRedPack": {
    "enable": true
  },
  "backupWaitTime": 20,
  "tasks": {
    "skipTasks": []
  },
  "catalog": "00019700101000000001"
}
```
