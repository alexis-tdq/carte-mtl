# Montreal Events Map (Carte de Montréal)

An interactive web map that displays cultural, sporting, and community events happening across the city of Montréal. This project visualizes open data from the Ville de Montréal portal, allowing users to easily discover and filter upcoming events.

**[» View Live Demo](https://alexis-tdq.github.io/carte-mtl/)**

---

## Features

- **Interactive Map**: Built with Leaflet.js, providing a smooth and responsive map experience.
- **Live Data**: Fetches event information directly from the [official Ville de Montréal open data portal](https://donnees.montreal.ca/dataset/ville-de-montreal-evenements).
- **Marker Clustering**: Uses the Leaflet.markercluster plugin to group nearby events, keeping the map clean and readable at any zoom level.
- **Advanced Filtering**: Users can filter events by:
    - Keyword search (title and description)
    - Date (Today, This Week, This Month)
    - Borough (`Arrondissement`)
    - Event Type
    - Venue (`Emplacement`)
    - Cost
- **Permalink URLs**: The URL automatically updates as filters are applied, allowing users to share links to specific views or search results.
- **Geolocation**: A "Find Me" button allows users to center the map on their current location.
- **Custom UI**: A clean, modern interface with custom-styled markers, buttons, and a modal for project information.
- **Responsive Design**: The layout is optimized for a seamless experience on both desktop and mobile devices.

## Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6 Modules)
- **Mapping Library**: [Leaflet.js](https://leafletjs.com/)
- **Clustering**: [Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster)
- **Data Source**: [Ville de Montréal Open Data API](https://donnees.montreal.ca/)
- **Basemap Tiles**: [CartoDB Voyager](https://carto.com/carto-colors/)

## Getting Started

To run this project locally, follow these simple steps.

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/alexis-tdq/carte-mtl.git](https://github.com/alexis-tdq/carte-mtl.git)
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd carte-mtl
    ```

3.  **Open the `index.html` file:**
    Since this project uses vanilla web technologies, no build step or local server is required. Simply open the `index.html` file in your web browser to run the application.

## How to Use

- **Explore the Map**: Pan and zoom to discover events in different areas of Montréal.
- **View Event Details**: Click on any marker pin to open a popup with detailed information about the event, including its description, schedule, address, and a link to its official page.
- **Use the Filters**:
    - Click the **filter icon** (bottom-right) to open the filter panel.
    - Select your desired criteria to narrow down the events shown on the map.
    - Click the **reset icon** (next to the filter icon) to clear all active filters.
- **Find Your Location**: Click the **geolocation icon** to center the map on your current position.
- **Learn More**: Click the **info icon** to open the "About" modal.

## Acknowledgments

This project would not be possible without the open data provided by the **Ville de Montréal**.

## License

This project is licensed under The Unlicense. See the [LICENSE](LICENSE) file for details.
