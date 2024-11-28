## 邮箱配置

### `pass`

- **类型**: `字符串`

邮箱密码/授权码

### `from`

- **类型**: `字符串`

发件人邮箱

### `port`

- **类型**: `数字`
- **默认值**: `465`

端口

### `host`

- **类型**: `字符串`

邮箱服务器

### `to`

- **类型**: `字符串`

收件人邮箱，默认发件人

### 示例

```json
{
  "email": {
    "pass": "tantillus",
    "from": "Hannah86@example.com",
    "port": 5300073804070912,
    "host": "ascit",
    "to": "Vince_Rau@example.net"
  }
}
```

### 默认值

```json
{
  "email": {
    "port": 465
  }
}
```

## 自定义配置

- **类型**: `数组`

自定义配置

### 示例

```json
{
  "customPost": [
    {
      "method": "PUT",
      "url": "https://well-informed-hundred.biz/",
      "headers": {
        "strenuus": "voco"
      },
      "body": {
        "voluptatum": "stabilis"
      },
      "data": {
        "theca": "vis"
      },
      "timeout": 3635838120361984
    },
    {
      "method": "DELETE",
      "url": "https://naughty-disclosure.com",
      "headers": {
        "aeternus": "tabesco"
      },
      "body": {
        "optio": "velut"
      },
      "data": {
        "cur": "comedo"
      },
      "timeout": 3861069948780544
    },
    {
      "method": "PATCH",
      "url": "https://limited-printing.biz",
      "headers": {
        "spiculum": "tertius"
      },
      "body": {
        "suggero": "deficio"
      },
      "data": {
        "cenaculum": "collum"
      },
      "timeout": 6145053537861632
    },
    {
      "method": "GET",
      "url": "https://mortified-affair.net",
      "headers": {
        "adnuo": "ait"
      },
      "body": {
        "communis": "sol"
      },
      "data": {
        "super": "celer"
      },
      "timeout": 3101206083796992
    },
    {
      "method": "POST",
      "url": "https://lazy-pollutant.net/",
      "headers": {
        "denuncio": "depopulo"
      },
      "body": {
        "praesentium": "barba"
      },
      "data": {
        "vestigium": "usus"
      },
      "timeout": 8193704263155712
    }
  ]
}
```

### 默认值

```json
{
  "customPost": [
    {
      "method": "POST",
      "headers": {},
      "body": {},
      "data": {}
    }
  ]
}
```

## 企业微信 App 配置

### `msgtype`

- **类型**: `字符串`
- **默认值**: `"text"`

消息类型

### `touser`

- **类型**: `字符串`
- **默认值**: `"@all"`

接收人

### `agentid`

- **类型**: `数字`

### `corpsecret`

- **类型**: `字符串`

### `corpid`

- **类型**: `字符串`

### 示例

```json
{
  "workWeixin": {
    "msgtype": "text",
    "touser": "@all",
    "agentid": 6493744169746432,
    "corpsecret": "comparo",
    "corpid": "maiores"
  }
}
```

### 默认值

```json
{
  "workWeixin": {
    "msgtype": "text",
    "touser": "@all"
  }
}
```

## 企业微信机器人配置

### `url`

- **类型**: `字符串`

机器人 webhook

### `msgtype`

- **类型**: `字符串`
- **默认值**: `"text"`

消息类型

### 示例

```json
{
  "workWeixinBot": {
    "url": "https://treasured-strike.com",
    "msgtype": "markdown"
  }
}
```

### 默认值

```json
{
  "workWeixinBot": {
    "msgtype": "text"
  }
}
```

## Bark 配置

### `key`

- **类型**: `字符串`

### `level`

- **类型**: `字符串`
- **默认值**: `"passive"`

消息等级

### 示例

```json
{
  "bark": {
    "key": "socius",
    "level": "passive"
  }
}
```

### 默认值

```json
{
  "bark": {
    "level": "passive"
  }
}
```

## 回逍配置

### `key`

- **类型**: `字符串`

### `sid`

- **类型**: `字符串`

### `query`

#### `plat`

- **类型**: `字符串`

#### `group`

- **类型**: `字符串`

#### `icon`

- **类型**: `string,number`

推送 icon，详见其文档

### `msgtype`

- **类型**: `字符串`
- **默认值**: `"text"`

消息类型

### 示例

```json
{
  "twoIm": {
    "key": "tibi",
    "sid": "tardus",
    "query": {
      "plat": "velociter",
      "group": "voco",
      "icon": 7954002337595392
    },
    "msgtype": "text"
  }
}
```

### 默认值

```json
{
  "twoIm": {
    "query": {},
    "msgtype": "text"
  }
}
```

## ServerChan 配置

### `token`

- **类型**: `字符串`

### 示例

```json
{
  "serverChan": {
    "token": "coruscus"
  }
}
```

### 默认值

```json
{
  "serverChan": {}
}
```

## Telegram 配置

### `apiHost`

- **类型**: `字符串`
- **默认值**: `"api.telegram.org"`

api 地址，默认官方地址，如果你有镜像 api 可以在此配置

### `token`

- **类型**: `字符串`

### `chat_id`

- **类型**: `string,number`

### `disable_web_page_preview`

- **类型**: `布尔值`
- **默认值**: `true`

### `proxy`

- **类型**: `字符串`

代理地址，例如 `http://127.0.0.1:10809` ，当然也可以使用验证，如 `http://catlair:passwd@127.0.0.1:10809`

### `agent`

- **类型**: `undefined`

### 示例

```json
{
  "tgBot": {
    "apiHost": "numquam",
    "token": "patria",
    "chat_id": "calcar",
    "disable_web_page_preview": true,
    "proxy": "https://substantial-thermometer.name/"
  }
}
```

### 默认值

```json
{
  "tgBot": {
    "apiHost": "api.telegram.org",
    "disable_web_page_preview": true
  }
}
```

## PushPlus 配置

### `token`

- **类型**: `字符串`

### 示例

```json
{
  "pushplus": {
    "token": "spero"
  }
}
```

### 默认值

```json
{
  "pushplus": {}
}
```

## 钉钉机器人配置

### `token`

- **类型**: `字符串`

### `secret`

- **类型**: `字符串`

密钥

### 示例

```json
{
  "dingTalk": {
    "token": "amita",
    "secret": "amicitia"
  }
}
```

### 默认值

```json
{
  "dingTalk": {}
}
```
