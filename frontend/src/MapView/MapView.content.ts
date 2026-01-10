import type { PollutantType } from '@/store/useStore';
import type { CityDefinition } from './MapView.config';

const pollutantLabels: Record<PollutantType, string> = {
  pm10: 'PM₁₀',
  'pm2.5': 'PM₂.₅',
  no2: 'NO₂',
  o3: 'O₃',
};

const pollutantOrder: PollutantType[] = ['pm10', 'pm2.5', 'no2', 'o3'];

const mapCenter: [number, number] = [46.0569, 14.5058];

const cities: CityDefinition[] = [
  {
    key: '@13353',
    name: 'Ljubljana',
    subtitle: 'Central Slovenia',
    position: { lat: 46.0569, lng: 14.5058 },
    aqi: null,
    heroImageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAvP97IOAC5s4mW2rh0ItizQfUEC71zF5tZ3ETMDxJ0lI9ZMVHXRzOwcyYY0gqWpGxh3ma-_PtYD5k17j_J6NaP_iA_tSWuyRpd8UkSFU7OJHJSlgEWaZfNL3nAHQw5TnN7i2wtO8FX35tEbGfc20MCjK9YEO7Dub7kY3-dylgqLFViEGMO2WOBceUo2tSnUDduulgZdCc3Kz3-OdKCPkdOe7GGghYnDydS8N-GBkdgvDyvzkHT_vx9Hp8BscW8xCK1mg4s1s52A_EK',
    pinVariant: null,
    pollutants: {},
  },
  {
    key: '@13352',
    name: 'Maribor',
    subtitle: 'Drava Region',
    position: { lat: 46.5547, lng: 15.6467 },
    aqi: null,
    pinVariant: null,
    pollutants: {},
  },
  {
    key: '@5140',
    name: 'Koper',
    subtitle: 'Coastal-Karst',
    position: { lat: 45.5469, lng: 13.7294 },
    aqi: null,
    pinVariant: null,
    pollutants: {},
  },
  {
    key: '@5135',
    name: 'Celje',
    subtitle: 'Savinja Region',
    position: { lat: 46.2381, lng: 15.2675 },
    aqi: null,
    pinVariant: null,
    pollutants: {},
  },
  {
    key: '@13356',
    name: 'Kranj',
    subtitle: 'Upper Carniola',
    position: { lat: 46.2392, lng: 14.3556 },
    aqi: null,
    pinVariant: null,
    pollutants: {},
  },
  {
    key: 'A467122',
    name: 'Zgornja Bistrica',
    subtitle: 'Slovenska Bistrica',
    position: { lat: 46.390902992722715, lng: 15.561096158783272 },
    aqi: null,
    pinVariant: null,
    pollutants: {},
  },
  {
    key: '@13341',
    name: 'Novo mesto',
    subtitle: 'Lower Carniola',
    position: { lat: 45.8034, lng: 15.1689 },
    aqi: null,
    pinVariant: null,
    pollutants: {},
  },
  {
    key: '@13351',
    name: 'Ptuj',
    subtitle: 'Drava Region',
    position: { lat: 46.4199, lng: 15.8697 },
    aqi: null,
    pinVariant: null,
    pollutants: {},
  },
  {
    key: '@5137',
    name: 'Nova Gorica',
    subtitle: 'Goriška',
    position: { lat: 45.956, lng: 13.6494 },
    aqi: null,
    pinVariant: null,
    pollutants: {},
  },
  {
    key: '@5139',
    name: 'Zagorje',
    subtitle: 'Central Sava',
    position: { lat: 46.131114182212, lng: 14.996115171781 },
    aqi: null,
    pinVariant: null,
    pollutants: {},
  },
];

export const MapViewContent = {
  pageAriaLabel: 'Map of Slovenia with air quality pins',
  map: {
    center: mapCenter,
    zoom: 12,
    tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    tileAttribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  panel: {
    selectPollutantLabel: 'Select Pollutant',
    aqiLabel: 'Air Quality Index',
    pollutantsTitle: 'Current Pollutants',
    healthAdviceTitle: 'Health Advice',
  },
  sidebar: {
    ariaLabel: 'City details',
    locationIcon: 'location_on',
    statusIcon: 'check',
    cityImageAlt: 'City image',
    toggleOpenIcon: 'chevron_right',
    toggleClosedIcon: 'chevron_left',
    toggleOpenAriaLabel: 'Show city details',
    toggleCloseAriaLabel: 'Hide city details',
    healthAdviceText:
      'Current levels are within typical ranges. If you are sensitive, consider reducing prolonged outdoor activity when the selected pollutant spikes.',
  },
  defaults: {
    cityKey: '@13353',
  },
  pollutantLabels,
  pollutantOrder,
  cities,
};
