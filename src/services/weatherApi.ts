// OpenWeatherMap API service for Sky-Cast Weather App
import axios, { AxiosInstance } from 'axios';
import {
  WeatherData,
  WeatherForecast,
  AirQualityData,
  SearchCityResult,
  Coordinates,
  WeatherError,
  CityWeather,
  DailyForecast,
  HourlyDataPoint,
  AirQuality,
  OpenWeatherResponse,
  AirQualityComponent,
  AirQualityMain,
} from '@/types';

class WeatherAPIService {
  private apiKey: string;
  private baseURL = 'https://api.openweathermap.org/data/2.5';
  private geocodingURL = 'https://api.openweathermap.org/geo/1.0';
  private axiosInstance: AxiosInstance;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || '';

    if (!this.apiKey) {
      console.warn('OpenWeatherMap API key not found in environment variables');
    }

    this.axiosInstance = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for API key
    this.axiosInstance.interceptors.request.use((config) => {
      if (this.apiKey) {
        config.params = {
          ...config.params,
          appid: this.apiKey,
        };
      }
      return config;
    });

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          throw new WeatherError('API_401', 'Invalid API key. Please check your configuration.');
        }
        if (error.response?.status === 429) {
          throw new WeatherError('API_429', 'API rate limit exceeded. Please try again later.');
        }
        if (error.response?.status === 404) {
          throw new WeatherError('API_404', 'Location not found. Please check the city name.');
        }
        throw new WeatherError('API_ERROR', error.message || 'Failed to fetch weather data.');
      }
    );
  }

  // Get current weather for coordinates
  async getCurrentWeather(
    coordinates: Coordinates,
    units: 'metric' | 'imperial' = 'metric'
  ): Promise<WeatherData> {
    try {
      const response = await this.axiosInstance.get<OpenWeatherResponse>(
        `${this.baseURL}/weather`,
        {
          params: {
            lat: coordinates.lat,
            lon: coordinates.lon,
            units,
          },
        }
      );

      return this.transformWeatherResponse(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get 5-day forecast (3-hour intervals)
  async getForecast(
    coordinates: Coordinates,
    units: 'metric' | 'imperial' = 'metric'
  ): Promise<WeatherForecast> {
    try {
      const response = await this.axiosInstance.get<WeatherForecast>(
        `${this.baseURL}/forecast`,
        {
          params: {
            lat: coordinates.lat,
            lon: coordinates.lon,
            units,
          },
        }
      );

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get air quality data
  async getAirQuality(coordinates: Coordinates): Promise<AirQuality> {
    try {
      const response = await this.axiosInstance.get<AirQualityData>(
        `${this.baseURL}/air_pollution`,
        {
          params: {
            lat: coordinates.lat,
            lon: coordinates.lon,
          },
        }
      );

      const airQualityData = response.data.list[0];
      return this.transformAirQualityResponse(airQualityData);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Search for cities by name
  async searchCities(query: string, limit: number = 5): Promise<SearchCityResult[]> {
    try {
      if (!query.trim()) {
        return [];
      }

      const response = await this.axiosInstance.get<SearchCityResult[]>(
        `${this.geocodingURL}/direct`,
        {
          params: {
            q: query,
            limit,
          },
        }
      );

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get city name from coordinates (reverse geocoding)
  async getLocationName(coordinates: Coordinates): Promise<SearchCityResult | null> {
    try {
      const response = await this.axiosInstance.get<SearchCityResult[]>(
        `${this.geocodingURL}/reverse`,
        {
          params: {
            lat: coordinates.lat,
            lon: coordinates.lon,
            limit: 1,
          },
        }
      );

      return response.data[0] || null;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get complete weather data for a city
  async getCompleteCityWeather(
    coordinates: Coordinates,
    units: 'metric' | 'imperial' = 'metric'
  ): Promise<CityWeather> {
    try {
      const [current, forecast, airQuality] = await Promise.all([
        this.getCurrentWeather(coordinates, units),
        this.getForecast(coordinates, units),
        this.getAirQuality(coordinates),
      ]);

      // Process forecast data
      const hourlyForecast = this.processHourlyForecast(forecast.list);
      const dailyForecast = this.processDailyForecast(forecast.list);

      return {
        city: {
          id: `${coordinates.lat}-${coordinates.lon}`,
          name: current.cityName,
          country: current.cityCountry,
          coordinates,
          lastUpdated: new Date().toISOString(),
        },
        current,
        forecast,
        hourlyForecast,
        dailyForecast,
        airQuality,
        lastUpdated: new Date().toISOString(),
        isCached: false,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Transform OpenWeatherMap response to our WeatherData format
  private transformWeatherResponse(data: OpenWeatherResponse): WeatherData {
    return {
      coordinates: {
        lat: data.coord.lat,
        lon: data.coord.lon,
      },
      weather: data.weather,
      base: data.base,
      metrics: {
        temperature: data.main.temp,
        feelsLike: data.main.feels_like,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        visibility: data.visibility,
        windSpeed: data.wind.speed,
        windDirection: data.wind.deg,
        windGust: data.wind.gust,
      },
      visibility: data.visibility,
      clouds: {
        all: data.clouds.all,
      },
      precipitation: data.rain || data.snow,
      timestamp: data.dt,
      timezone: data.timezone,
      cityId: data.id,
      cityName: data.name,
      cityCountry: data.sys.country,
      sunTimes: {
        sunrise: data.sys.sunrise,
        sunset: data.sys.sunset,
      },
    };
  }

  // Transform air quality response
  private transformAirQualityResponse(data: any): AirQuality {
    const aqiLevel = this.getAQILevel(data.main.aqi);

    return {
      aqi: data.main.aqi,
      level: aqiLevel.level,
      color: aqiLevel.color,
      components: data.components,
      timestamp: data.dt,
    };
  }

  // Get AQI level and color
  private getAQILevel(aqi: number): { level: 'Good' | 'Fair' | 'Moderate' | 'Poor' | 'Very Poor' | 'Hazardous'; color: string } {
    const levels = {
      1: { level: 'Good' as const, color: '#00E400' },
      2: { level: 'Fair' as const, color: '#FFFF00' },
      3: { level: 'Moderate' as const, color: '#FF7E00' },
      4: { level: 'Poor' as const, color: '#FF0000' },
      5: { level: 'Very Poor' as const, color: '#8F3F97' },
    };

    return levels[aqi as keyof typeof levels] || { level: 'Hazardous' as const, color: '#7E0023' };
  }

  // Process hourly forecast for charts
  private processHourlyForecast(forecastList: any[]): HourlyDataPoint[] {
    return forecastList.slice(0, 24).map((item) => ({
      time: new Date(item.dt * 1000).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      temperature: Math.round(item.main.temp),
      precipitation: (item.pop || 0) * 100,
      humidity: item.main.humidity,
      windSpeed: item.wind.speed,
    }));
  }

  // Process daily forecast
  private processDailyForecast(forecastList: any[]): DailyForecast[] {
    const dailyData: { [date: string]: any[] } = {};

    // Group by date
    forecastList.forEach((item) => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!dailyData[date]) {
        dailyData[date] = [];
      }
      dailyData[date].push(item);
    });

    // Process each day
    return Object.entries(dailyData).map(([date, items]) => {
      const temps = items.map(item => item.main.temp);
      const mainItem = items[Math.floor(items.length / 2)]; // Use midday as representative

      return {
        date,
        dayName: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        tempMin: Math.min(...temps),
        tempMax: Math.max(...temps),
        weather: mainItem.weather[0],
        humidity: mainItem.main.humidity,
        windSpeed: mainItem.wind.speed,
        precipitationChance: Math.max(...items.map(item => item.pop || 0)) * 100,
      };
    }).slice(0, 7); // Return 7 days
  }

  // Handle API errors
  private handleError(error: any): WeatherError {
    if (error instanceof WeatherError) {
      return error;
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      return new WeatherError('NETWORK_ERROR', 'Network error. Please check your connection.');
    }

    return new WeatherError('UNKNOWN_ERROR', error.message || 'An unknown error occurred.');
  }
}

// Create singleton instance
export const weatherAPI = new WeatherAPIService();

// Export types
export type { WeatherError };