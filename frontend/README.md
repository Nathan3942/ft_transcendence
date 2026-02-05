# Overview

This is the frontend section of the SPA (Single Page Application), it is written in **Typescript** and uses **TailwindCSS** for styling. It is compiled using `npm run build` with the output being stored in a Docker container at:
```
/var/www/pong-frontend
```
When built, the frontend consists of:
- `/dist`: A directory containing `index.html` file.
- `/dist/assets`: A directory containing the compiled code, and other directories that store the static assets.
> [!NOTE]
> To keep with the single page nature of the frontend, the index.html only contains a `div` to be modified and have generated code inserted into it.

---

# Debugging
To run the SPA in dev mode, to avoid having to set up a webserver each time, the repo comes with `vite` which has a built in dev server. To launch the dev server, make sure you are in the `srcs/fontend` directory, and run the command:
```bash
npm run dev
```
