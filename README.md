# Sky Cast - Next-Generation Weather App

A modern, immersive weather web application with animated visuals and live AQI data built with Next.js 16 and TypeScript.

## ✨ Features

- **🌤️ Real-time Weather Data** - Current conditions and 5-day forecasts
- **🎨 Animated Backgrounds** - Dynamic weather-themed animations
- **📊 Interactive Charts** - Temperature and precipitation visualizations
- **📍 Geolocation Support** - Automatic location detection
- **🔍 City Search** - Search and save multiple cities
- **🌬️ Air Quality Index** - Live AQI monitoring with health recommendations
- **🌙 Dark/Light Mode** - Theme switching with system preference detection
- **📱 Fully Responsive** - Mobile-first design
- **⚡ Real-time Updates** - Automatic weather data refresh
- **🎯 Weather Alerts** - Smart notifications for extreme conditions

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- OpenWeatherMap API key

### 1. Clone the Repository

```bash
git clone <repository-url>
cd sky-cast
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Get your free API key at: https://openweathermap.org/api
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_api_key_here
```

To get an API key:
1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to the API keys section
4. Copy your key and add it to `.env.local`

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

## 🏗️ Technology Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **API**: OpenWeatherMap
- **State Management**: React Hooks

## 📁 Project Structure

```
sky-cast/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   │   ├── AnimatedBackground/
│   │   ├── LocationButton/
│   │   ├── SearchBar/
│   │   ├── ThemeToggle/
│   │   ├── WeatherCard/
│   │   └── WeatherModal/
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API services
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Utility functions
├── public/                  # Static assets
└── package.json
```

## 🌐 API Integration

This app uses the [OpenWeatherMap API](https://openweathermap.org/api) for:
- Current weather conditions
- 5-day forecasts
- Air quality data
- Geolocation services
- City search functionality

## 🎨 Customization

### Theming
The app supports light, dark, and auto themes. Theme preferences are automatically saved to localStorage.

### Weather Conditions
Weather backgrounds, animations, and colors dynamically change based on:
- Current weather conditions
- Time of day (day/night/dawn/dusk)
- Temperature ranges
- Weather alerts

## 📱 Responsive Design

- **Mobile**: 320px and up
- **Tablet**: 768px and up
- **Desktop**: 1024px and up
- **Large Desktop**: 1440px and up

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add your environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

```bash
npm run build
npm start
```

The app builds to static files and can be deployed to any platform supporting Node.js.

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

### Environment Variables

- `NEXT_PUBLIC_OPENWEATHER_API_KEY` - Your OpenWeatherMap API key (required)
- `NEXT_PUBLIC_OPENWEATHER_BASE_URL` - Custom API base URL (optional)

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
