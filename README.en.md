# Yami RPG Editor Community Branch

[中文](./README.md)

![](https://flat.badgen.net/github/license/Open-Yami-Community/yami-rpg-editor)
![](https://flat.badgen.net/github/forks/Open-Yami-Community/yami-rpg-editor)
![](https://flat.badgen.net/github/stars/Open-Yami-Community/yami-rpg-editor)
![](https://flat.badgen.net/github/commits/Open-Yami-Community/yami-rpg-editor)
![](https://flat.badgen.net/github/issues/Open-Yami-Community/yami-rpg-editor)
![](https://flat.badgen.net/github/open-issues/Open-Yami-Community/yami-rpg-editor)
![](https://flat.badgen.net/github/closed-issues/Open-Yami-Community/yami-rpg-editor)
![](https://flat.badgen.net/github/open-prs/Open-Yami-Community/yami-rpg-editor)
![](https://flat.badgen.net/github/closed-prs/Open-Yami-Community/yami-rpg-editor)
![](https://flat.badgen.net/github/merged-prs/Open-Yami-Community/yami-rpg-editor)

<hr>

Yami RPG Editor is a 2D RPG editor known for its user-friendliness.

Yami RPG Editor is a 2D RPG editor on user-friendliness.

**Note:** Currently, only the `Windows` version is built. Other versions need to be built manually.

**Note:** The multilingual support only maintains `Chinese` and `English` language packs. Other languages are not maintained due to additional maintenance costs.

Official QQ Group: `3992050`

## 

![Yami_RPG_Editor](https://shared.cdn.queniuqe.com/store_item_assets/steam/apps/1964480/header.jpg?t=1742510557)

If you like this software, please support the official version on Steam: [Yami RPG Editor](https://store.steampowered.com/app/1964480/Yami_RPG_Editor/)

## Getting Started

```shell
pnpm install
```

Extract "Runtime/electron-packages.zip" to the "Project" directory as game deployment dependencies.
Some files exceed 100MB, so they have been split into multiple volumes.

## Run

```shell
pnpm run start
```

## External Browser Plugins

You can add browser plugins in the `extension` folder under the directory, and the software will automatically scan and add them.

## Build

```shell
# windows
npm run build:win

# macos
pnpm run build:mac

pnpm run build:macArm

pnpm run build:universal

# linux
pnpm run build:linux

# exe
# Add exe at the end for setup package version

```

## Manual Resource Update

1. Download the resource package you need to update from https://github.com/Open-Yami-Community/yami-rpg-editor/releases/tag/win
2. Extract and replace it to `C:\Users\<username>\.openyami\Templates`
3. Replace the `C:\Users\<username>\.openyami\Templates\template.json` file with the `./Project/Script/module/packmeta.json` file from this repository
4. Restart the editor

## Contributors

![GitHub contributors](https://img.shields.io/github/contributors/Open-Yami-Community/yami-rpg-editor)

<a href="https://github.com/Open-Yami-Community/yami-rpg-editor/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Open-Yami-Community/yami-rpg-editor">
</a>

For contributions, please refer to [CONTRIBUTING](./CONTRIBUTING.md)

## About

Welcome to submit your valuable **issues**, and we will handle them.

## Donation

The community version project is maintained by Xu Ran alone. Whether you donate a little or a lot, it is the **motivation** for Xu Ran to maintain the project. Come on, let's do it!!!

| Donor  | QQ          | Amount |
| :----- | ----------- | -----: |
| 刀里个刀 | 420488038 |   200 |
| ya       | 332685057 |   100 |

<p align="center">
<img width="500" src="https://github.com/user-attachments/assets/4733d260-991a-4edb-aaa1-483dd3ef5d91" alt="1abcd7e53e8c72cf7b3b7770b48c001d_720">
</p>

## Stargazers over time
[![Stargazers over time](https://starchart.cc/Open-Yami-Community/yami-rpg-editor.svg?variant=adaptive)](https://starchart.cc/Open-Yami-Community/yami-rpg-editor)

## LICENSE

[you can see this](./LICENSE)