<div align="center">
    <h1 align="center"><i><b>Valorant Bot</b></i></h1>
    <p>用于查询 Valorant<i><sup>无畏契约、特戰英豪</sup><i> 相关详情信息(每日商店、MMR、等)的 QQ 机器人服务</p>
</p>
    <a herf="https://github.com/ikexing-cn/valorant-bot/issues"> <img src="https://img.shields.io/github/issues/ikexing-cn/valorant-bot?color=orange&logo=github&style=flat-square"></a>
    <a herf="https://github.com/ikexing-cn/valorant-bot/network/members"> <img src="https://img.shields.io/github/forks/ikexing-cn/valorant-bot?color=red&logo=github&style=flat-square"></a>
    <a herf="https://github.com/ikexing-cn/valorant-bot/stargazers"> <img src="https://img.shields.io/github/stars/ikexing-cn/valorant-bot?logo=github&style=flat-square"></a>
    <a herf="https://github.com/ikexing-cn/valorant-bot/blob/1.12/LICENSE"> <img src="https://img.shields.io/github/license/ikexing-cn/valorant-bot?color=green&logo=github&style=flat-square"></a>
    <br>
    <br>
    <a href="https://zeabur.com?referralCode=ikexing-cn&utm_source=ikexing-cn" target="_blank">
      <img src="https://zeabur.com/deployed-on-zeabur-dark.svg" alt="Deployed on Zeabur" />
    </a>
    <span>
</div>

## 主要功能
此项目仍在紧锣密鼓的开发中，但是基础建设基本完成，可以正常使用。

[x] 支持 Riot 账户管理
  - [x] 登录
  - [x] 二步验证
  - [x] 自动保活
  - [x] 多账户统一管理

[x] 支持 Valorant 每日商店查询
  - [x] 获取每日商店信息
  - [x] 自动解析武器信息成单独的图片

## TODO
欢迎 Pull Request！

[ ] 商店计划
  - [ ] 支持夜市功能
  - [ ] 支持每周饰品商店
  - [ ] 更好的图片展示方式

[ ] MMR
  - [ ] 最新战绩
  - [ ] 近期战绩 (10 - 15 局游戏)
  - [ ] 赛季/全局 数据统计
  - 更多其他...

[ ] 国际化语言

[ ] 国服支持 (毫无思路，低优先级)

## 部署指南

### 基础依赖:
为了成功部署此项目，您需要确保以下存在：
  - Node.js（版本 20 或更高）
    - PNPM (版本 8.14.3 或更高)
  - Redis
  - PostgreSQL
  - Go-CQHTTP

### 常规部署流程:
1. **搭建前置基础依赖**：确保所有基础依赖均已安装并运行。
2. **配置环境变量**：根据 [.env.example](.env.example) 文件，配置所需的环境变量。
3. **部署 `@valorant-bot/website`**：
    - 该服务提供“每日商店”、“账号绑定”、“用户验证”等功能。
    - 由`Vite` 和 `SolidJS` 驱动，可部署在任意支持静态文件托管的平台。
4. **部署 `@valorant-bot/server`**：
    - 本服务实现了项目的核心功能。
    - 建议在非中国大陆服务器上部署，以避免可能的 Riot 官方限制。
    - 由 `Nitro` 驱动，预设为 [`Zeabur`](https://zeabur.com?referralCode=ikexing-cn)，但也支持其他 `serverless` 服务如 `Vercel`、`Netlify`、`Cloudflare Workers`。详细信息请参考[官方文档](https://nitro.unjs.io/deploy/)。
    - 重要：确保网络稳定，因为该服务需要直接通过 HTTP 请求处理 `@valorant-bot/website` 和 `@valorant-bot/bot` 的后端需求，包括与 `Riot` 官方 API 的交互。
    - 经测试，[`Zeabur`](https://zeabur.com?referralCode=ikexing-cn) 是最稳定的免费服务，推荐使用。如果选择开发者方案，可以将 `PostgreSQL` 和 `Redis` 部署在同一 `Project`。
    - 如果您有服务器，可以选择使用 `PM2` 或 `Docker` 等方式自行部署（此方式不提供支持）。
5. **部署 `@valorant-bot/bot`**：
    - 为 QQ 机器人提供支持。
    - 建议在中国大陆地区部署，以规避腾讯风控，并确保 Bot 等级达到三个月亮以上。
    - 依赖 `puppeteer` 对 `@valorant-bot/website` 的“每日商店”进行截图，因此需要特别关注国内服务器针对 `Chromium` 的下载。
      - 建议配置代理服务，并通过 `http_proxy` 和 `https_proxy` 环境变量设置代理。
    - 如果部署环境支持 SSH，可利用 [Github Action](.github/workflows/build.yml) 中的 `deploy-bot` 脚本进行部署。配置相关密钥：
      - BOT_SSH_HOST: 服务器地址
      - BOT_SSH_USERNAME: 用户名
      - BOT_SSH_PASSWORD: 密码
      - BOT_SSH_PORT: 端口
      - BOT_SSH_DOWNLOADED_PATH: 项目部署文件下载目录

### 直接使用
如果你觉得部署过于繁杂，可以直接添加已部署的机器人：`QQ: 149384916` 使用。

## 特别感谢
没有这些项目的帮助将无法开发出此项目:

[bili33's blog](https://bili33.top/posts/Valorant-Shop-with-API/): 中文互联网针对 Valorant API 解释最为全面的文章。

[valorant-api-docs](https://valapidocs.techchrism.me/): 提供了对 Valorant API 与 Riot 账户 API 相关的全部解释。

[valorant-api-client](https://github.com/tanishqmanuja/valorant-api-client)：针对 Valorant API 的 Node.js 的封装客户端。

## 贡献项目
如果您有任何想法或建议，欢迎提交 [Issue](https://github.com/ikexing-cn/valorant-bot/issues)进行讨论，如果您有兴趣参与项目开发，欢迎提交 [Pull Request](https://github.com/ikexing-cn/valorant-bot/pulls)

如果此项目对你有帮助，请点击个 Star 支持一下！非常感谢🙏

## 免责声明
**本项目与RIOT GAMES无关，也未得到RIOT GAMES的认可**。
Riot Games及其所有相关属性是Riot Games， Inc.的商标或注册商标。尽管已努力遵守Riot的API规则；您需承认，使用此软件是您自担风险。

