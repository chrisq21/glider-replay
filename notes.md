V1 ----------------------------------------------------------

- Customize interface
  - Speed controls
  - Timeline track with altitude graph (maybe with D3)
    - Need to add terrain elevation chart beneath altitude chart.
    - Rendered by querying for terrain elevation at each pressure altitude point. It might be ideal for this to be done server side and streamed as a React server component (nifty, this could be fun to try) 
  - Camera controls
    - Follow glider
    - Free Roam
  - Upload IGC button
- 3d models
  - v1: sailplane and paraglider

  - dropdown for glider type
- Quick performance audit
- Code cleanup

V2 ----------------------------------------------------------


- 3D models
  - detect glider type from igc data
  - offer multiple types of models
- Path / tracked entity smoothing
  - Don't follow every curve if possible
  - Smooth out the follow line so to remove jaggede edges
- igc coordinates array processing
  - Prevent jumps by only moving camera position if it's a certain distance from previous position.

- Custom Markers
  - Allow setting custom markers with images, video, and text description.
  - Add controls for the markers

Nice to have----------------------------------------------------

- Auto-generate video

Other ----

- Colors #f4fdff, #ff5a5f, #087e8b
