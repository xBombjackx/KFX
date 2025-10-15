# Collaborative Stream Tasker

This is a StreamElements widget that allows streamers to display a list of tasks for themselves and their viewers.

## Features

- Streamer can define a list of tasks.
- Viewers can submit their own tasks.
- A progress bar shows the completion of tasks.

## How to build

1. Install the dependencies:
   ```
   npm install
   ```
2. Build the widget:
   ```
   npm run build
   ```

The bundled widget will be in `dist/widget.bundle.js`.

## How to use

1. Create a new Custom Widget in StreamElements.
2. Copy the contents of `widget.html` into the HTML section.
3. Copy the contents of `widget.css` into the CSS section.
4. Copy the contents of `dist/widget.bundle.js` into the JS section.
5. Copy the contents of `widget.json` into the Fields section.

## Using with StreamElements Developer Kit (SEDK)

Alternatively, you can use the pre-built files in the `build_for_sedk` directory with the [StreamElements Developer Kit (SEDK)](https://github.com/StreamElements/sedk).

1. Create a new widget with the SEDK:
   ```
   sedk create-widget my-widget
   ```
2. Replace the files in the `my-widget` directory with the files from the `build_for_sedk` directory.
