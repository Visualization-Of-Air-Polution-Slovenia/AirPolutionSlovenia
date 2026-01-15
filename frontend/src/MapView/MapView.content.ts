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
    heroImageUrl: '/cities/ljubljana.jpg',
    pinVariant: null,
    pollutants: {},
  },
  {
    key: '@13352',
    name: 'Maribor',
    subtitle: 'Štajerska region',
    position: { lat: 46.5547, lng: 15.6467 },
    aqi: null,
    heroImageUrl: '/cities/maribor.jpg',
    pinVariant: null,
    pollutants: {},
  },
  {
    key: '@5140',
    name: 'Koper',
    subtitle: 'Primorska region',
    position: { lat: 45.5469, lng: 13.7294 },
    aqi: null,
    heroImageUrl: '/cities/koper.jpg',
    pinVariant: null,
    pollutants: {},
  },
  {
    key: '@5135',
    name: 'Celje',
    subtitle: 'Štajerska region',
    position: { lat: 46.2381, lng: 15.2675 },
    aqi: null,
    heroImageUrl: '/cities/celje.jpg',
    pinVariant: null,
    pollutants: {},
  },
  {
    key: '@13356',
    name: 'Kranj',
    subtitle: 'Gorenjska region',
    position: { lat: 46.2392, lng: 14.3556 },
    aqi: null,
    heroImageUrl: '/cities/kranj.jpg',
    pinVariant: null,
    pollutants: {},
  },
  {
    key: 'A467122',
    name: 'Slovenska Bistrica',
    subtitle: 'Štajerska region',
    position: { lat: 46.390902992722715, lng: 15.561096158783272 },
    aqi: null,
    heroImageUrl: '/cities/slovenskabistrica.jpg',
    pinVariant: null,
    pollutants: {},
  },
  {
    key: '@13341',
    name: 'Novo mesto',
    subtitle: 'Notranjska region',
    position: { lat: 45.8034, lng: 15.1689 },
    aqi: null,
    heroImageUrl: '/cities/novomesto.jpg',
    pinVariant: null,
    pollutants: {},
  },
  {
    key: '@13351',
    name: 'Ptuj',
    subtitle: 'Štajerska region',
    position: { lat: 46.4199, lng: 15.8697 },
    aqi: null,
    heroImageUrl: '/cities/ptuj.jpg',
    pinVariant: null,
    pollutants: {},
  },
  {
    key: '@5137',
    name: 'Nova Gorica',
    subtitle: 'Goriška region ',
    position: { lat: 45.956, lng: 13.6494 },
    aqi: null,
    heroImageUrl: '/cities/novagorica.jpg',
    pinVariant: null,
    pollutants: {},
  },
  {
    key: '@5139',
    name: 'Zagorje ob Savi',
    subtitle: 'Zasavska region',
    position: { lat: 46.131114182212, lng: 14.996115171781 },
    aqi: null,
    heroImageUrl: '/cities/zagorjeobsavi.jpg',
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
