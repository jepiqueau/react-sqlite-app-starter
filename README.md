<p align="center"><br><img src="https://avatars3.githubusercontent.com/u/16580653?v=4" width="128" height="128" /></p>

<h3 align="center">Ionic/React SQLite App Starter</h3>
<p align="center"><strong><code>react-sqlite-app-starter@next</code></strong></p><br>
<p align="center">
  A Ionic/React application demonstrating the use of the <strong><code>@capacitor-community/sqlite@next</code></strong> plugin and may be use as an application starter.

</p>

<br>
<p align="center">
  <img src="https://img.shields.io/maintenance/yes/2021?style=flat-square" />
  <a href="https://github.com/jepiqueau/react-sqlite-app-starter"><img src="https://img.shields.io/github/license/jepiqueau/react-sqlite-app-starter?style=flat-square" /></a>
  <a href="https://github.com/jepiqueau/react-sqlite-app-starter"><img src="https://img.shields.io/github/package-json/v/jepiqueau/react-sqlite-app-starter/master?style=flat-square" /></a><!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
  <a href="#contributors-"><img src="https://img.shields.io/badge/all%20contributors-1-orange?style=flat-square" /></a>
  <!-- ALL-CONTRIBUTORS-BADGE:END -->
</p>

## Maintainers

| Maintainer        | GitHub                                    | Social |
| ----------------- | ----------------------------------------- | ------ |
| Quéau Jean Pierre | [jepiqueau](https://github.com/jepiqueau) |        |

## Browser Support

The plugin follows the guidelines from the `Capacitor Team`,

- [Capacitor Browser Support](https://capacitorjs.com/docs/v3/web#browser-support)

meaning that it will not work in IE11 without additional JavaScript transformations, e.g. with [Babel](https://babeljs.io/).

## Installation 🚧

## Installation

To start building your App using this Starter App, clone this repo to a new directory:

```bash
git clone https://github.com/jepiqueau/angular-sqlite-app-starter.git 
cd angular-sqlite-app-starter
git remote rm origin
```

 - then install it

```bash
npm install
```

 - then go to the building process

```bash
npm run build
npx cap sync
npm run build
npx cap copy
npx cap copy web
```

the capacitor config parameters are:

```
  "appId": "com.example.app.capacitor",
  "appName": "react-sqlite-app-starter",
```

### Building Web Code

The ```@capacitor-community/sqlite``` is not implemented for Web Browsers.
if you run

```bash
npx cap serve
```
you will get the following messages:
```
SQLite Plugin not available for Web Platform
```

### Building Native Project

#### IOS

```bash
npx cap open ios
```
Once Xcode launches, you can build your finally app binary through the standard Xcode workflow.

#### Android

```bash
npx cap open android
```
Once Android Studio launches, you can build your app through the standard Android Studio workflow.

## Usage


The `@capacitor-community/sqlite` test is accessible in the Tab2 of the Application by clicking on several SQLite test button :

 - SQLite No Encryption Test
 - SQLite Two DBs Tests
 - SQLite Encryption Test    (iOS && Android only)
 - SQLite Upgrade Version Test
 - SQLite Json Import Export Test

After having run the `SQLite Two DBs Tests` another test becomes accessible `SQLite Existing Test` which is using the existing connections created in `SQLite Two DBs Tests`.

The application uses the React Hook `react-sqlite-hook refactor` to access the `@capacitor-community/sqlite refactor` API. 

- [react-sqlite-hook](https://github.com/jepiqueau/react-sqlite-hook/blob/master/README.md)
 
## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/jepiqueau"><img src="https://avatars3.githubusercontent.com/u/16580653?v=4" width="100px;" alt=""/><br /><sub><b>Jean Pierre Quéau</b></sub></a><br /><a href="https://github.com/jepiqueau/react-sqlite-app-starter/commits?author=jepiqueau" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!



