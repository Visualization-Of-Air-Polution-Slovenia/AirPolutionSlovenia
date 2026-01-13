import L from "leaflet";

// Expose Leaflet globally for plugins
(window as any).L = L;

// Import plugins AFTER L is global
import "leaflet.heat";

export default L;