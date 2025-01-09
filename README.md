# Tourist Places of Assam 🌍

Explore the beauty of Assam, India, with an interactive guide that provides key details about popular tourist destinations in the state. This project integrates multiple APIs to provide real-time information and services for a richer experience.

## Features ✨
- **Interactive Google Maps**: View the location of Assam on an interactive map.
- **Real-Time Weather Info**: Get up-to-date weather information for Assam.
- **Wikipedia Descriptions**: Learn more about Assam's rich cultural heritage and history from Wikipedia.
- **Flickr Photos**: Browse beautiful photos related to Assam.
- **Upcoming Events**: Get details about upcoming events and festivals in Assam.
- **Geolocation**: Discover nearby tourist spots based on your location.

## Prerequisites 🔑
To use the APIs integrated into this project, you need to register and obtain API keys for the following services:

- **Google Maps API**: [Google Cloud Console](https://console.cloud.google.com/)
- **OpenWeatherMap API**: [OpenWeatherMap](https://openweathermap.org/api)
- **Flickr API**: [Flickr API](https://www.flickr.com/services/api/)
- **Eventful API**: [Eventful API](http://api.eventful.com/)

## Setup Instructions 🛠️

1. **Clone the repository**:
    ```bash
    git clone https://github.com/Sadiqueahmed/Tourist-Places-of-Assam.git
    ```
2. **Open `index.html`** in a browser.
3. **Add your API keys**:
    - Replace `YOUR_GOOGLE_MAPS_API_KEY` with your Google Maps API key.
    - Replace `YOUR_OPENWEATHERMAP_API_KEY` with your OpenWeatherMap API key.
    - Replace `YOUR_FLICKR_API_KEY` with your Flickr API key.
    - Replace `YOUR_EVENTFUL_API_KEY` with your Eventful API key.

## Project Structure 📁

The project consists of the following key sections:

1. **Search Bar**: For searching tourist places by name.
2. **Map Section**: Displays a map with the location of Assam.
3. **Weather Information**: Real-time weather updates fetched from OpenWeatherMap.
4. **Wikipedia Information**: General information about Assam sourced from Wikipedia.
5. **Photos from Flickr**: Displays a gallery of Assam-related photos.
6. **Upcoming Events**: Information about upcoming events in Assam.

## Live Demo 🎥

A live version of this project can be run locally by following the setup instructions. The API keys are required for the functionality.

## Screenshots 📸

Here are some snapshots of the website:

![Screenshot 2024-09-01 081618](https://github.com/user-attachments/assets/fbdd8e15-6ba1-466e-a305-8bfa7dae7ed5)

![Screenshot 2024-09-01 081655](https://github.com/user-attachments/assets/16e577e2-368f-4c4f-8e83-a189ebdb7637)

![Screenshot 2024-09-01 081719](https://github.com/user-attachments/assets/1d13bad2-714b-42b5-a768-c939bc692b33)

![Screenshot 2024-09-01 081815](https://github.com/user-attachments/assets/dadfc998-bf99-46e1-bbd4-e6e3055ae383)

![Screenshot 2024-09-01 081832](https://github.com/user-attachments/assets/433df307-a457-444e-9969-2d6b59da2285)

![Screenshot 2024-09-01 081911](https://github.com/user-attachments/assets/c182f605-d9a0-493e-9651-05595b0485f8)

![Screenshot 2024-09-01 081941](https://github.com/user-attachments/assets/adebfd65-b61f-42ca-b121-243539dff4e3)

## Contributing 🤝

We welcome contributions from the community to enhance this website. Feel free to submit:

1. **Bug Reports**: If you encounter any issues, please report them on the GitHub repository.
2. **Feature Requests**: Suggest new features or improvements to the website.
3. **Pull Requests**: Contribute code changes to the project.

## Support 🙏

If you find this project useful and would like to support me, consider buying me a coffee! ☕

<a href="https://www.buymeacoffee.com/Sadique">
  <img align="left" src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" height="50" width="210" alt="Sadique Ahmed" />
</a>

---

📂 **Project Repo**: [Tourist Places of Assam](https://github.com/Sadiqueahmed/Tourist-Places-of-Assam)

---

### License 📄


## HTML Code Example 📑

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tourist Places of Assam</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <script src="https://kit.fontawesome.com/a076d05399.js"></script>
    <style>
        #map { height: 400px; width: 100%; }
        .info-section { margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="text-center mt-4">Tourist Places of Assam</h1>

        <!-- Search bar for tourist places -->
        <div class="form-group mt-4">
            <label for="search">Search for a tourist place:</label>
            <input type="text" class="form-control" id="search" placeholder="Enter location name">
        </div>

        <!-- Map section -->
        <div id="map"></div>

        <!-- Weather Information -->
        <div id="weather-info" class="info-section">
            <h3>Weather Information</h3>
            <p id="weather-description"></p>
            <p><strong>Temperature:</strong> <span id="weather-temperature"></span> °C</p>
        </div>

        <!-- Wikipedia Information -->
        <div id="wikipedia-info" class="info-section">
            <h3>About Assam</h3>
            <p id="wiki-description"></p>
        </div>

        <!-- Flickr Photos -->
        <div id="flickr-photos" class="info-section">
            <h3>Photos of Assam</h3>
            <div id="photos"></div>
        </div>

        <!-- Event Information -->
        <div id="events-info" class="info-section">
            <h3>Upcoming Events</h3>
            <ul id="events-list"></ul>
        </div>
    </div>

    <!-- Google Maps API -->
    <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&callback=initMap&libraries=places" async defer></script>

    <!-- Weather API -->
    <script>
        const weatherAPIKey = 'YOUR_OPENWEATHERMAP_API_KEY';
        const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=Assam,IN&appid=${weatherAPIKey}&units=metric`;

        fetch(weatherURL)
            .then(response => response.json())
            .then(data => {
                document.getElementById('weather-description').textContent = data.weather[0].description;
                document.getElementById('weather-temperature').textContent = data.main.temp;
            });
    </script>

    <!-- Wikipedia API -->
    <script>
        const wikiURL = 'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=&titles=Assam';

        fetch(wikiURL)
            .then(response => response.json())
            .then(data => {
                const page = data.query.pages[Object.keys(data.query.pages)[0]];
                document.getElementById('wiki-description').innerHTML = page.extract;
            });
    </script>

    <!-- Flickr API for photos -->
    <script>
        const flickrAPIKey = 'YOUR_FLICKR_API_KEY';
        const flickrURL = `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${flickrAPIKey}&tags=Assam&format=json&nojsoncallback=1`;

        fetch(flickrURL)
            .then(response => response.json())
            .then(data => {
                const photos = data.photos.photo;
                const photoContainer = document.getElementById('photos');
                photos.forEach(photo => {
                    const img = document.createElement('img');
                    img.src = `https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_m.jpg`;
                    img.alt = 'Tourist Place Photo';
                    img.classList.add('img-fluid');
                    photoContainer.appendChild(img);
                });
            });
    </script>

    <!-- Event API (Eventful) -->
    <script>
        const eventAPIKey = 'YOUR_EVENTFUL_API_KEY';
        const eventURL = `https://api.eventful.com/json/events/search?app_key=${eventAPIKey}&location=Assam&date=Future`;

        fetch(eventURL)
            .then(response => response.json())
            .then(data => {
                const events = data.events.event;
                const eventsList = document.getElementById('events-list');
                events.forEach(event => {
                    const listItem = document.createElement('li');
                    listItem.textContent = `${event.title} - ${event.start_time}`;
                    eventsList.appendChild(listItem);
                });
            });
    </script>

    <!-- Geolocation API -->
    <script>
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                const userLat = position.coords.latitude;
                const userLon = position.coords.longitude;
                console.log(`Latitude: ${userLat}, Longitude: ${userLon}`);
                // You can now use these coordinates to display nearby tourist spots
            });
        }
    </script>

    <!-- Bootstrap and jQuery Scripts -->
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.3/dist/umd/popper.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>

    <script>
        let map;

        function initMap() {
            map = new google.maps.Map(document.getElementById('map'), {
                center: { lat: 26.2006, lng: 92.9376 }, // Coordinates for Assam
                zoom: 7
            });

            const marker = new google.maps.Marker({
                position: { lat: 26.2006, lng: 92.9376 },
                map: map,
                title: "Assam"
            });
        }
    </script>
</body>
</html>



