import { WeatherApp } from '@/components/Layout/WeatherApp';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function Home() {
  return (
    <ErrorBoundary>
      <WeatherApp />
    </ErrorBoundary>
  );
}
