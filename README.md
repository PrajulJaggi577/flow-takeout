# flow-takeout

flow-takeout is a browser app for your Google Flow Takeout. It shows your generated and uploaded images and videos in one place, with their prompts, dates and details. Everything runs on your computer: nothing is uploaded, and your library is stored in the browser.

It might also work with a Google Photos Takeout export (just point it to the media folder inside Google Photos' Takeout). This has not been tested.

## Run it locally

1. Click Code, then Download ZIP.
2. Unzip the file
3. Open `index.html` in Chrome or Edge. Or serve the folder with any static server, for example `python3 -m http.server` in this folder, then open `http://localhost:8000`.
4. Click the folder icon in the top bar and choose your Takeout folder. It should contain `Flow/media`, or be the `media` folder itself.
5. Wait for the library to load. Photos appear straight away. Sizes and previews fill in as you scroll.

## How to use it

- **Photos, Favourites, Videos, Albums:** the sections in the top bar. Photos are grouped by day, with the date stuck at the top while you scroll.
- **Open a photo:** click it. Use the arrow keys, or swipe on a phone, to move between photos. The side panel shows the prompt, date, model, size, tags, notes, duplicates and other photos with the same prompt.
- **Select:** hover over a photo and click the circle, or hold Ctrl or Cmd while clicking. Then favourite, hide, add to an album, copy prompts or delete.
- **Search:** type in the top bar. `#tag` finds a tag, and `-word` leaves out a word.
- **Date:** the date button in the toolbar opens a calendar. Days with photos are marked.
- **Smart albums:** on the Albums page. They are built from your library and never saved. They include checks for missing info, duplicates, uploaded photos and repeated prompts.
- **Data and help:** the three-dot button. It has the keyboard shortcuts, and it can forget the folder and previews. Notes, tags and albums are kept.

Press `?` for keyboard shortcuts.

## Privacy

- Photos and your data never leave your computer.
- The library and your notes, tags and albums are stored in the browser's IndexedDB. Clearing site data for this page erases them.

## Notes

- Duplicates are checked on demand, from the Smart albums page or from a photo's panel. Identical files are matched exactly. Different pictures are compared by a small fingerprint.
- The first load of a large library takes a while. Thumbnails are made as you scroll and kept for next time.