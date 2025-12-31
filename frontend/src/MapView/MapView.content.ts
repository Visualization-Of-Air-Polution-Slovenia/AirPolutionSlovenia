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
    key: 'ljubljana',
    name: 'Ljubljana',
    subtitle: 'Central Slovenia',
    position: { lat: 46.0569, lng: 14.5058 },
    aqi: { value: 45, label: 'Good' },
    heroImageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAvP97IOAC5s4mW2rh0ItizQfUEC71zF5tZ3ETMDxJ0lI9ZMVHXRzOwcyYY0gqWpGxh3ma-_PtYD5k17j_J6NaP_iA_tSWuyRpd8UkSFU7OJHJSlgEWaZfNL3nAHQw5TnN7i2wtO8FX35tEbGfc20MCjK9YEO7Dub7kY3-dylgqLFViEGMO2WOBceUo2tSnUDduulgZdCc3Kz3-OdKCPkdOe7GGghYnDydS8N-GBkdgvDyvzkHT_vx9Hp8BscW8xCK1mg4s1s52A_EK',
    pinVariant: 'good',
    pollutants: {
      pm10: { value: 22, unit: 'µg/m³', badge: 'good' },
      'pm2.5': { value: 12, unit: 'µg/m³', badge: 'good' },
      no2: { value: 18, unit: 'µg/m³', badge: 'good' },
      o3: { value: 45, unit: 'µg/m³', badge: 'moderate' },
    },
  },
  {
    key: 'maribor',
    name: 'Maribor',
    subtitle: 'Drava Region',
    position: { lat: 46.5547, lng: 15.6467 },
    aqi: { value: 62, label: 'Moderate' },
    pinVariant: 'moderate',
    pollutants: {
      pm10: { value: 31, unit: 'µg/m³', badge: 'moderate' },
      'pm2.5': { value: 19, unit: 'µg/m³', badge: 'moderate' },
      no2: { value: 24, unit: 'µg/m³', badge: 'moderate' },
      o3: { value: 58, unit: 'µg/m³', badge: 'moderate' },
    },
  },
  {
    key: 'koper',
    name: 'Koper',
    subtitle: 'Coastal-Karst',
    position: { lat: 45.5469, lng: 13.7294 },
    aqi: { value: 38, label: 'Good' },
    pinVariant: 'good',
    pollutants: {
      pm10: { value: 18, unit: 'µg/m³', badge: 'good' },
      'pm2.5': { value: 9, unit: 'µg/m³', badge: 'good' },
      no2: { value: 14, unit: 'µg/m³', badge: 'good' },
      o3: { value: 41, unit: 'µg/m³', badge: 'good' },
    },
  },
  {
    key: 'celje',
    name: 'Celje',
    subtitle: 'Savinja Region',
    position: { lat: 46.2381, lng: 15.2675 },
    aqi: { value: 54, label: 'Moderate' },
    pinVariant: 'moderate',
    pollutants: {
      pm10: { value: 28, unit: 'µg/m³', badge: 'moderate' },
      'pm2.5': { value: 16, unit: 'µg/m³', badge: 'moderate' },
      no2: { value: 22, unit: 'µg/m³', badge: 'moderate' },
      o3: { value: 52, unit: 'µg/m³', badge: 'moderate' },
    },
  },
  {
    key: 'kranj',
    name: 'Kranj',
    subtitle: 'Upper Carniola',
    position: { lat: 46.2392, lng: 14.3556 },
    aqi: { value: 44, label: 'Good' },
    pinVariant: 'good',
    pollutants: {
      pm10: { value: 21, unit: 'µg/m³', badge: 'good' },
      'pm2.5': { value: 11, unit: 'µg/m³', badge: 'good' },
      no2: { value: 16, unit: 'µg/m³', badge: 'good' },
      o3: { value: 46, unit: 'µg/m³', badge: 'moderate' },
    },
  },
  {
    key: 'velenje',
    name: 'Velenje',
    subtitle: 'Šaleška Valley',
    position: { lat: 46.3592, lng: 15.1107 },
    aqi: { value: 58, label: 'Moderate' },
    pinVariant: 'moderate',
    pollutants: {
      pm10: { value: 30, unit: 'µg/m³', badge: 'moderate' },
      'pm2.5': { value: 18, unit: 'µg/m³', badge: 'moderate' },
      no2: { value: 21, unit: 'µg/m³', badge: 'moderate' },
      o3: { value: 55, unit: 'µg/m³', badge: 'moderate' },
    },
  },
  {
    key: 'novo_mesto',
    name: 'Novo mesto',
    subtitle: 'Lower Carniola',
    position: { lat: 45.8034, lng: 15.1689 },
    aqi: { value: 46, label: 'Good' },
    pinVariant: 'good',
    pollutants: {
      pm10: { value: 23, unit: 'µg/m³', badge: 'good' },
      'pm2.5': { value: 12, unit: 'µg/m³', badge: 'good' },
      no2: { value: 17, unit: 'µg/m³', badge: 'good' },
      o3: { value: 47, unit: 'µg/m³', badge: 'moderate' },
    },
  },
  {
    key: 'ptuj',
    name: 'Ptuj',
    subtitle: 'Drava Region',
    position: { lat: 46.4199, lng: 15.8697 },
    aqi: { value: 57, label: 'Moderate' },
    pinVariant: 'moderate',
    pollutants: {
      pm10: { value: 29, unit: 'µg/m³', badge: 'moderate' },
      'pm2.5': { value: 17, unit: 'µg/m³', badge: 'moderate' },
      no2: { value: 20, unit: 'µg/m³', badge: 'moderate' },
      o3: { value: 54, unit: 'µg/m³', badge: 'moderate' },
    },
  },
  {
    key: 'nova_gorica',
    name: 'Nova Gorica',
    subtitle: 'Goriška',
    position: { lat: 45.9560, lng: 13.6494 },
    aqi: { value: 41, label: 'Good' },
    pinVariant: 'good',
    pollutants: {
      pm10: { value: 19, unit: 'µg/m³', badge: 'good' },
      'pm2.5': { value: 10, unit: 'µg/m³', badge: 'good' },
      no2: { value: 15, unit: 'µg/m³', badge: 'good' },
      o3: { value: 44, unit: 'µg/m³', badge: 'good' },
    },
  },
  {
    key: 'murska_sobota',
    name: 'Murska Sobota',
    subtitle: 'Pomurje',
    position: { lat: 46.6613, lng: 16.1661 },
    aqi: { value: 53, label: 'Moderate' },
    pinVariant: 'moderate',
    pollutants: {
      pm10: { value: 27, unit: 'µg/m³', badge: 'moderate' },
      'pm2.5': { value: 16, unit: 'µg/m³', badge: 'moderate' },
      no2: { value: 19, unit: 'µg/m³', badge: 'moderate' },
      o3: { value: 50, unit: 'µg/m³', badge: 'moderate' },
    },
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
    cityKey: 'ljubljana',
  },
  pollutantLabels,
  pollutantOrder,
  cities,
};
