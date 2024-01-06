# @roshan-labs/auth

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Nuxt3 身份验证模块，统一处理应用中权限相关的功能

- [✨ 更新日志](/CHANGELOG.md)
<!-- - [🏀 Online playground](https://stackblitz.com/github/your-org/my-module?file=playground%2Fapp.vue) -->
- 📖 文档：计划中...

## 功能

- 开箱即用，几乎零配置就可以完成身份验证
- 支持本地策略：token 和 refresh 两种场景
- API 简单，不同策略公用相同接口
- 完备的 Typescript 类型支持
- 只用于 Nuxt3

## 安装

1. 添加 `@roshan-labs/auth` 依赖

```bash
# 可以使用 npm、yarn 和 pnpm 来安装
pnpm add @roshan-labs/auth
```

2. 添加 `@roshan-labs/auth` 到 `nuxt.config.ts` 的 `modules` 列表

```js
export default defineNuxtConfig({
  modules: [
    '@roshan-labs/auth',
  ],
  auth: {
    // 选项配置
  },
})
```

## 许可

[MIT](/LICENSE)

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@roshan-labs/auth/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/@roshan-labs/auth

[npm-downloads-src]: https://img.shields.io/npm/dm/@roshan-labs/auth.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/@roshan-labs/auth

[license-src]: https://img.shields.io/npm/l/@roshan-labs/auth.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/@roshan-labs/auth

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
