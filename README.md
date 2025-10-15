# Collaborative Stream Tasker

This StreamElements custom widget allows streamers and their viewers to manage a collaborative task list directly on stream. Viewers can suggest tasks, and the streamer can approve or reject them. A progress bar tracks completed tasks, and a reward system can be integrated.

## Development

This project uses TypeScript and webpack to bundle the widget code.

### Prerequisites

- [Node.js](https://nodejs.org/) (which includes npm)
- [StreamElements Developer Kit (SEDK)](https://github.com/StreamElements/sedk)

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Building the Widget

To build the widget and prepare it for the SEDK, run the following command:

```bash
npm run build
```

This command will:
1.  Compile the TypeScript source code into a single JavaScript file.
2.  Copy all necessary files (`widget.html`, `widget.css`, `widget.js`, and `fields.json`) into the `build_for_sedk` directory.

## Usage with SEDK

The `build_for_sedk` directory contains everything you need to run the widget with the StreamElements Developer Kit.

1.  **Create a new widget with the SEDK:**
    ```bash
    sedk create-widget my-stream-widget
    ```

2.  **Replace the default files:**
    Copy the contents of the `build_for_sedk` directory into the `my-stream-widget/src` directory, replacing the existing files.

3.  **Run the local development server:**
    ```bash
    sedk run ./my-stream-widget
    ```

Now you can open the provided URL in your browser to see and test your widget. Any changes you make to the source files will require you to run `npm run build` again.