## ExpressJS + Twig Weather Application

This web application allows users to track the current day's weather for different cities.


## Features

- **Add** a city by specifying its name and LON and LAT coordinates.
- **View** the list of added cities.
- **Search** for a city in the list of added cities via a search bar.
- **Access** the weather page of a city by selecting it from the list.


## Using the API

This application uses the [Meteorologisk Institutt API](https://www.met.no/en) to retrieve weather data. You can find the API documentation at the following links:
- [Main API Documentation](https://api.met.no/weatherapi/documentation)
- [Location Forecast API Documentation](https://api.met.no/weatherapi/locationforecast/2.0/documentation)
- [WeatherIcons GitHub Repository](https://github.com/metno/weathericons)

## Database

SQLite is used as the database system to store information about the added cities.


## Installation Instructions

1. **Install Dependencies:** Make sure you have Node.js installed on your machine.
2. **Clone the Repository:** Clone this repository to your local machine using the following command:
```shell
   git clone https://github.com/AxelFdez/weatherApp.git
```
3. **Install project dependencies:**
```shell
   cd meteo-app
   npm install
```
4. **Start the server.**
```shell
   npm start
```
5. **Access the application in your browser at http://localhost:8080.**


## Contact

For any questions or concerns, please contact us.

Axel Fernandez