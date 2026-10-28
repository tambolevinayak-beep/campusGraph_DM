SMART CAMPUS NAVIGATOR - Discrete Mathematics project (HTML/CSS/JS frontend + Python backend)

HOW TO RUN
1. Extract this zip (do not run it from inside the zip).
2. Install Python from python.org (tick "Add Python to PATH").
3. Windows: double-click run.bat
   Mac/Linux: open a terminal in this folder and run:
       pip install flask
       python app.py
   then open http://127.0.0.1:5000 in Chrome or Edge.
Keep the terminal window open while using the site. Internet is needed for the satellite map
(without it the map switches to Graph view by itself).

DEPLOY TO VERCEL
1. Push the contents of this folder (including vercel.json and api/) to the
   GitHub repository. The Vercel project root must be this folder.
2. In Vercel, choose Add New > Project and import:
   https://github.com/tambolevinayak-beep/campusGraph_DM
3. Keep the framework preset as Other and leave the build and output directory
   settings blank. Vercel will use vercel.json and requirements.txt.
4. Click Deploy. The api/index.py function serves both the app and its assets.

BACKEND (8 files)
app.py           Flask server, campus data, API routes
dijkstra.py      shortest path
bfs_dfs.py       BFS (fewest stops) and DFS all paths (capped at 500)
kruskal.py       minimum spanning tree
bridges.py       connected components and bridges
warshall.py      adjacency matrix, reachability, relation properties
euler_degree.py  degrees, handshaking lemma, Euler path/circuit
coloring_tsp.py  graph colouring and visit-several-places (TSP-lite)

FRONTEND (8 files)
index.html       page structure
css/style.css    colours and layout
js/api.js        calls to the backend
js/map.js        Leaflet map, overlays, walker animation
js/navigate.js   route cards, nearby, quick access, live updates, TSP
js/analysis.js   graph analysis tab
js/steps.js      Dijkstra table and animation, BFS vs Dijkstra
js/main.js       state, events, tabs, theme

YOUR OWN CAMPUS
Edit BUILDINGS (latitude, longitude) and EDGES (A, B, metres, 1 if stairs) in app.py.
Add an emoji for each new building in the ICON list in js/main.js.
Put photos in images/ named like the building (Library.jpg, Comp Lab.jpg).
