import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Sun, CloudSun, Cloud, CloudRain, CloudLightning,
  CloudSnow, CloudFog, Wind, CloudDrizzle, Loader2
} from 'lucide-react'
import '../styles/WeatherWidget.css'

const WEATHER_CITY_KEY = 'devdash_weather_city'

function getWeatherIcon(description, size = 40) {
  const d = description.toLowerCase()
  if (d.includes('sunny') || d.includes('clear'))   return <Sun size={size} color="#d29922" />
  if (d.includes('partly cloudy'))                    return <CloudSun size={size} color="#8b949e" />
  if (d.includes('overcast'))                         return <Cloud size={size} color="#6e7681" />
  if (d.includes('cloudy'))                           return <Cloud size={size} color="#8b949e" />
  if (d.includes('thunder') || d.includes('storm'))   return <CloudLightning size={size} color="#d29922" />
  if (d.includes('drizzle') || d.includes('light rain')) return <CloudDrizzle size={size} color="#58a6ff" />
  if (d.includes('rain'))                             return <CloudRain size={size} color="#58a6ff" />
  if (d.includes('snow') || d.includes('ice'))       return <CloudSnow size={size} color="#bc8cff" />
  if (d.includes('fog') || d.includes('mist') || d.includes('haze')) return <CloudFog size={size} color="#6e7681" />
  if (d.includes('wind'))                             return <Wind size={size} color="#6e7681" />
  return <CloudSun size={size} color="#8b949e" />
}

function getInitialCity() {
  try {
    const saved = localStorage.getItem(WEATHER_CITY_KEY)
    return saved || 'Lagos, Nigeria'
  } catch {
    return 'Lagos, Nigeria'
  }
}

function WeatherWidget() {
  const [city, setCity] = useState(getInitialCity)
  const [fetchCity, setFetchCity] = useState(getInitialCity)

  const { data, isLoading: loading, error } = useQuery({
    queryKey: ['weather', fetchCity],
    queryFn: async ({ signal }) => {
      const res = await fetch(`https://wttr.in/${encodeURIComponent(fetchCity)}?format=j1`, { signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
    enabled: !!fetchCity,
    staleTime: 10 * 60 * 1000,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = city.trim()
    if (trimmed) {
      setFetchCity(trimmed)
      try {
        localStorage.setItem(WEATHER_CITY_KEY, trimmed)
      } catch { /* noop */ }
    }
  }

  const weather = data?.current_condition?.[0]
  const tempC = weather?.temp_C
  const description = weather?.weatherDesc?.[0]?.value || ''
  const humidity = weather?.humidity
  const windSpeed = weather?.windspeedKmph
  const feelsLike = weather?.FeelsLikeC
  const areaName = data?.nearest_area?.[0]?.areaName?.[0]?.value || fetchCity

  return (
    <div className="weather-widget">
      <h2 className="widget-title">
        <CloudSun size={16} /> Weather
      </h2>

      <form className="weather-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="weather-input"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name..."
        />
        <button type="submit" className="weather-btn">Check</button>
      </form>

      {loading && (
        <div className="weather-loading">
          <Loader2 size={20} className="spin-icon" />
          <span>Fetching weather...</span>
        </div>
      )}

      {error && <p className="weather-error">Could not load weather for &quot;{fetchCity}&quot;.</p>}

      {!loading && !error && weather && (
        <div className="weather-info">
          <div className="weather-main">
            <div className="weather-icon-wrap">
              {getWeatherIcon(description, 36)}
            </div>
            <span className="weather-temp">{tempC}°</span>
          </div>
          <p className="weather-city">{areaName}</p>
          <p className="weather-desc">{description}</p>
          {(feelsLike || humidity || windSpeed) && (
            <div className="weather-details">
              {feelsLike !== undefined && <span>Feels like {feelsLike}°</span>}
              {humidity && <span>{humidity}% humidity</span>}
              {windSpeed && <span>{windSpeed} km/h</span>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default WeatherWidget