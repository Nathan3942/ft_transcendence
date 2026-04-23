# Overview

This is the frontend section of the SPA (Single Page Application), it is written in **Typescript** and uses **TailwindCSS** for styling. It is compiled using `pnpm run build` from the `srcs/frontend` directory, with the output being stored in a Docker container at:
```
/var/www/pong-frontend
```
When built, the frontend consists of:
- `/dist`: A directory containing `index.html` file.
- `/dist/assets`: A directory containing the compiled code, and other directories that store the static assets.
> [!NOTE]
> To keep with the single page nature of the frontend, the index.html only contains a `div` to be modified and have generated code inserted into it.

---

# Project Structure
The frontend is structured as follows:

- `/public`: Contains assets such as Images, fonts, and such.
- `index.html`: The HTML entry point for the application.
- `/src/main.ts`: Is the primary entrypoint for the program.
- `/src/components`: Contains reusable UI components.
- `/src/game`: Contains game logic and rendering.
- `/src/handler`: Contains routing, page lifecycle, login flow, and auth guard logic.
- `/src/helpers`: Contains utility and helper functions.
- `/src/interfaces`: Contains TypeScript interfaces.
- `/src/routes`: Contains the logic for constructing individual pages.
- `/src/i18n`: Contains internationalisation logic and locale files (English, French, German).
- `/src/services`: Contains service logic for interacting with external APIs or backend.

---

# Dependencies
To build / work on the project, you will need the following dependencies.

## Package managers

| Manager  | Recommendation |
| -------- | -------------- |
| **pnpm** | Preferred      |
| **npm**  | Fallback       |


## Dev Dependencies

Use `[manager] install` in the `/srcs/frontend` directory to automatically install the dev dependencies.

| Dependency      | Version |
| --------------- | ------- |
| **TypeScript**  | 5.9.3   |
| **Vite**        | 7.3.1   |
| **TailwindCSS** | 4.2.2   |


---

# Debugging
To run the SPA in dev mode, to avoid having to set up a webserver each time, the repo comes with `vite` which has a built in dev server. To launch the dev server, make sure you are in the `srcs/frontend` directory, and run the command:
```bash
pnpm run dev
```
