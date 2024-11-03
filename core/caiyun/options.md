### `auth`

- **类型**: `字符串`

cookie authorization 字段

### `nickname`

- **类型**: `字符串`

昵称，用于获取用户信息

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

邀请码，如果不知道是啥就不管，也没用. 配置后默认助力功能失效

#### `waterFriend`

- **类型**: `数字`

需要给哪个好友浇水，好友 uid(果园输出的昵称后面的数字就是 uid). 浇水会消耗自己的水滴, 所有用来干嘛, 你懂的

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

分享任务默认使用的文件 id，请确保该文件存在且后续不被删除

#### `skipTasks`

- **类型**: `数组`

跳过的任务 id，可抓包获取，也可查看日志输出（任务日志会在任务名后面拼接上数字 id 的）。切记，配置优先级最高，配置无论任务是否能够自动完成都将跳过。

### `catalog`

- **类型**: `字符串`
- **默认值**: `"00019700101000000001"`

上传文件使用目录的 id，默认根目录，可按需更改，但请确认 id 有效，文件夹真实存在

### `cloudPhoneRedpack`

#### `enable`

- **类型**: `布尔值`
- **默认值**: `false`

是否开启该功能

### `printTodayCloud`

- **类型**: `布尔值`

是否打印今日云朵

### 示例

```json
{
  "caiyun": [
    {
      "auth": "qui",
      "nickname": "crudelis",
      "shake": {
        "enable": true,
        "num": 15,
        "delay": 7045630039949312
      },
      "garden": {
        "enable": true,
        "inviteCodes": [
          "amplexus",
          "acidus",
          "aveho"
        ],
        "waterFriend": 7704702665883648
      },
      "aiRedPack": {
        "enable": true
      },
      "backupWaitTime": 20,
      "tasks": {
        "shareFile": "inventore",
        "skipTasks": [
          2190046557896704,
          1406557816356864,
          6560730260176896,
          5088171641536512,
          2824982587506688
        ]
      },
      "catalog": "incidunt",
      "cloudPhoneRedpack": {
        "enable": true
      },
      "printTodayCloud": false
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
  "catalog": "00019700101000000001",
  "cloudPhoneRedpack": {
    "enable": false
  }
}
```
