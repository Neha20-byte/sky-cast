// Weather data types for Sky-Cast Weather App

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface City {
  id: string;
  name: string;
  country: string;
  state?: string;
  coordinates: Coordinates;
  isDefault?: boolean;
  lastUpdated?: string;
}

export interface CurrentWeather {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface WeatherMetrics {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  visibility: number;
  uvIndex?: number;
  windSpeed: number;
  windDirection: number;
  windGust?: number;
}

export interface SunTimes {
  sunrise: number;
  sunset: number;
}

export interface CloudData {
  all: number;
}

export interface Precipitation {
  oneHour?: number;
  threeHours?: number;
}

export interface WeatherData {
  coordinates: Coordinates;
  weather: CurrentWeather[];
  base: string;
  metrics: WeatherMetrics;
  visibility: number;
  clouds: CloudData;
  precipitation?: Precipitation;
  timestamp: number;
  timezone: number;
  cityId: number;
  cityName: string;
  cityCountry: string;
  sunTimes: SunTimes;
}

export interface ForecastItem {
  timestamp: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: CurrentWeather[];
  clouds: CloudData;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  precipitation?: Precipitation;
  visibility: number;
  pop: number; // Probability of precipitation
}

export interface WeatherForecast {
  cod: string;
  message: number;
  cnt: number;
  list: ForecastItem[];
  city: {
    id: number;
    name: string;
    coordinates: Coordinates;
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

export interface AirQualityComponent {
  co: number;
  no: number;
  no2: number;
  o3: number;
  so2: number;
  pm2_5: number;
  pm10: number;
  nh3: number;
}

export interface AirQualityMain {
  aqi: number; // 1-5 scale
}

export interface AirQualityData {
  coord: Coordinates;
  list: Array<{
    main: AirQualityMain;
    components: AirQualityComponent;
    dt: number;
  }>;
}

export interface AirQuality {
  aqi: number;
  level: 'Good' | 'Fair' | 'Moderate' | 'Poor' | 'Very Poor' | 'Hazardous';
  color: string;
  components: AirQualityComponent;
  timestamp: number;
}

// Daily forecast data
export interface DailyForecast {
  date: string;
  dayName: string;
  tempMin: number;
  tempMax: number;
  weather: CurrentWeather;
  humidity: number;
  windSpeed: number;
  precipitationChance: number;
}

// Hourly forecast data for charts
export interface HourlyDataPoint {
  time: string;
  temperature: number;
  precipitation: number;
  humidity: number;
  windSpeed: number;
}

// Complete city weather data
export interface CityWeather {
  city: City;
  current: WeatherData;
  forecast: WeatherForecast;
  hourlyForecast: HourlyDataPoint[];
  dailyForecast: DailyForecast[];
  airQuality: AirQuality;
  lastUpdated: string;
  isCached: boolean;
}

// Weather condition types for UI
export type WeatherCondition =
  | 'clear'
  | 'clouds'
  | 'rain'
  | 'drizzle'
  | 'thunderstorm'
  | 'snow'
  | 'mist'
  | 'fog'
  | 'haze'
  | 'dust'
  | 'sand'
  | 'ash'
  | 'squall'
  | 'tornado';

export type TimeOfDay = 'day' | 'night' | 'dawn' | 'dusk';

export type ThemeMode = 'light' | 'dark' | 'auto';

export type TemperatureUnit = 'celsius' | 'fahrenheit';

// API response types
export interface OpenWeatherResponse {
  coord: Coordinates;
  weather: CurrentWeather[];
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  clouds: {
    all: number;
  };
  rain?: Precipitation;
  snow?: Precipitation;
  dt: number;
  sys: {
    type?: number;
    id?: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export interface SearchCityResult {
  name: string;
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

// Error types
export class WeatherError extends Error {
  code: string;
  status?: number;

  constructor(code: string, message: string, status?: number) {
    super(message);
    this.name = 'WeatherError';
    this.code = code;
    this.status = status;
  }
}

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';