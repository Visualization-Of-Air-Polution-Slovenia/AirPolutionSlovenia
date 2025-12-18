import airbase

client = airbase.AirbaseClient()

country = 'SI'
pollutants = ['O3', 'C6H6', 'CO', 'NO2', 'NOx', 'PM10', 'PM2.5', 'SO2']

request = airbase.AirbaseRequest(airbase.Dataset.Historical, country, poll=pollutants)
request.download("./data/EEA_historical_data/raw")
