# Grabbit - Media Downloader

Grabbit is a powerful, cross-platform desktop application made with Electron designed for downloading media content from a wide range of popular platforms. With its intuitive user interface, you can easily save your favorite videos, music, and images directly to your computer. The app also includes a versatile media conversion tool, making it an all-in-one solution for your media needs.

## Features

- **Multi-Platform Support**: Download media from YouTube, Instagram, TikTok, Spotify, and more.
- **Media Conversion**: Convert your downloaded files into various formats (e.g., MP4, MKV, MP3, FLAC).
- **User-Friendly Interface**: A clean and modern UI built with React and Tailwind CSS.
- **Customizable Settings**: Configure default download paths, file formats, and other preferences.
- **Cross-Platform**: Works on Windows, macOS, and Linux.

## Supported Platforms

- YouTube (Videos, Playlists, Shorts)
- Instagram
- TikTok
- Spotify
- [See more...](public/supported_sites.txt)

## Dependencies

- **[yt-dlp](https://github.com/yt-dlp/yt-dlp)**: For handling the media downloading process.
- **[FFmpeg](https://ffmpeg.org/)**: For media conversion and processing.

## 📦 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/)

### Installation

1.  **Clone the repository:**

    ```sh
    git clone https://github.com/MrMuscleFreak/grabbit.git
    cd grabbit
    ```

2.  **Install dependencies:**

    ```sh
    npm install
    ```

3.  **In development mode:**

```sh
npm run dev
```

## 🏗️ Build

You can build the application for different platforms using the following commands:

- **Build for Windows:**
  ```sh
  npm run build:win
  ```
- **Build for macOS:**
  ```sh
  npm run build:mac
  ```

The distributable files will be located in the `dist` directory.

## 🖼️ Screenshots

_(Coming Soon)_
