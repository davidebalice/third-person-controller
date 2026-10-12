# Third Person Controller

A third person character controller built with React Three Fiber.
Walk a Mixamo character around a 3D city using the keyboard or on-screen touch buttons, switch cameras, play animations and choose between different characters.

![Screenshot](https://www.aroundweb.it/screenshot/thirdpersoncontroller.jpg)

## Features

- Character movement with arrow keys, WASD or touch buttons (shown automatically on touch devices)
- Collision detection between the character and the walls of the city
- Smooth transition between idle and walk animations
- 6 camera positions, including a top view
- 12 extra animations (greetings, dance, run, victory, boxing, guitar, jump, kick, roll, flip, ...)
- Character selection panel with four characters
- Collapsible control panel, info panel and preloader with loading progress

## Tech stack

- [React 18](https://react.dev/)
- [Three.js](https://threejs.org/)
- [React Three Fiber](https://r3f.docs.pmnd.rs/)
- [Drei](https://drei.docs.pmnd.rs/)
- [Vite](https://vite.dev/)
- [React Icons](https://react-icons.github.io/react-icons/)

## Getting started

### Requirements

- Node.js 20 or later
- npm

### Installation

```bash
git clone https://github.com/davidebalice/third-person-controller.git
cd third-person-controller
npm install
```

### 3D assets

The large model and animation files (`*.fbx`, `*.gltf`, `*.glb`) are excluded from the repository by `.gitignore`.
To run the project, add them to the `public/` folder:

- `public/models/city.gltf` – the city scene (the `.bin` and textures are already included)
- `public/models/...` – the character models referenced in `src/Ui.jsx`
- `public/animations/*.fbx` – the Mixamo animations loaded in `src/Character.jsx` (`idle`, `walk`, `dance`, `run`, ...)

### Available scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the development server         |
| `npm run build`   | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |

## Controls

| Input                    | Action               |
| ------------------------ | -------------------- |
| Arrow keys / `W A S D`   | Move the character   |
| Touch buttons            | Move on mobile       |
| Camera buttons `1`–`6`   | Switch camera        |
| Animation buttons        | Play an animation    |

## Project structure

```
src/
├── Scene.jsx            # Canvas, lights, sky and cameras
├── Character.jsx        # Character model, movement, animations and collisions
├── City.jsx             # City model
├── Ui.jsx               # Control panel, touch controls and character selection
├── walls.js             # Collision boxes of the city
├── cameraPositions.js   # Camera presets
├── animations.js        # List of available animations
└── main.jsx             # Application entry point
```

## Credits

- Characters and animations: [Mixamo](https://www.mixamo.com/)
- City model: [Sketchfab](https://sketchfab.com/3d-models/city-deb4dc75e62346c19c117bf61334eeb5)

## Author

**Davide Balice** – [davidebalice.dev](https://www.davidebalice.dev)
