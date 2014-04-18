Meteor.methods({
    get_places: function(location, isFake){
        if (isFake){
            return fake_response;
        }
        this.unblock();

        try {
            var api_response = HTTP.get(GOOGLE_NEARBY_API_URL, {params: {
                key: GOOGLE_API_KEY,
                location: location,
                rankby: 'distance',
                sensor: 'true',
                types: 'cafe|restaurant|bar'
            }});

            var filtered_results = [];
            api_response.data.results.forEach(function(result){
              console.log(result.id);
              var matches = Terrasses.find({g_id: result.id}).fetch();
              if (match = matches[0]){
                filtered_results.push(result);
              }
            })

            var response = {
              "next_page_token": api_response.next_page_token,
              results: filtered_results
            }

            return response;
        }

        catch (e){
            return false;
            }
        },
    add_coordinates_to_db: function(){
      add_coordinates_to_db()
    }

});

function add_coordinates_to_db(){
  Terrasses.find({}).forEach(function(place){
    console.log(place.name);
    if (place.coords){
      console.log('already filled');
    }
    else{

      console.log(place.name);

      var api_response = HTTP.get(GOOGLE_DETAILS_API_URL, {params: {
          key: GOOGLE_API_KEY,
          reference: place.g_ref,
          sensor: 'false'
      }});

      if (api_response.data.status === "OK"){
        var result = api_response.data.result;
        var coords = [result.geometry.location.lat, result.geometry.location.lng];
        var opening_hours;
        if (result.opening_hours){
          opening_hours = { periods: result.opening_hours.periods};
        }
        var photos = result.photos;
        var types = result.types;
        var website = result.website;
        var google_plus_url = result.url;

        Terrasses.update({_id: place._id}, {'$set': {
          'coords': coords,
          'opening_hours': opening_hours,
          'photos': photos,
          'types': types,
          'website': website,
          'google_plus_url' : google_plus_url
        } });
      } else {
        console.error("bad response")
      }
    }
  })
}

GOOGLE_API_KEY = "AIzaSyAt4AAA7Kmj8O7w33-I0_gORjZXEvEbD3E";
GOOGLE_NEARBY_API_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
GOOGLE_DETAILS_API_URL = "https://maps.googleapis.com/maps/api/place/details/json"

fake_response =
{
  "html_attributions": [],
  "next_page_token": "CoQC9AAAAAL1AU6VOvV54KqPwqv8CpWv2IcVPVihrOzIUjs0V0hv5e2cHYx2Oqdqzt45o1Gz4MP7tv_Hpxf3bsHyskxZLLehXLWykm0ZytH9Cx1WwX6KAhK7o5mipSife07kASrhm9xNe7LQBy2o_Yebv8O9cenx3-Z83QJzbvJfB8l90ETQgZWfpaQr6uzsEm6c2YWuAHf6O5z1dNLSZf8iZHt6pVzz1fS9JphA0jpoy70eh5H9BIg0btZX0iw9Py8W29vYcg0cDWpMCAEg9D_thQPba5oUXDYJltn6OdePwBsTxLiae-LdHAo1jfcOngwlCxph9YGriNUUABpYSTVSl2VvS4QSEHpJMSPh7Q6lk20V6OxB8K8aFBLq-kR2WPee6xrqfTzq2g6qwbBJ",
  "results": [
    {
      "geometry": {
        "location": {
          "lat": 48.863363,
          "lng": 2.370586
        }
      },
      "icon": "http://maps.gstatic.com/mapfiles/place_api/icons/cafe-71.png",
      "id": "9ce1b77ead89d758949ff6d2a41aec31e4326255",
      "name": "Apérock Café",
      "opening_hours": {
        "open_now": false
      },
      "photos": [
        {
          "height": 1363,
          "html_attributions": [],
          "photo_reference": "CnRnAAAAhPsJOLhMh2YIE1n6-mXDZwb6tY9aHmal9EmYYpjtyhA-tF1GZPHOrr5yLkOQIi4x_fp2i5zFkAtKezlV-ts2g-SW4mIdNS-gPUhRdJhfRBA8DOfND2vjorKxZxMSbf-DQxYlxvfkfAKg2ZR1pcMAKBIQZ5AzoJ59isxvxUKn4fZI8xoUQ9JWA3S2Kwm8gF6m-ICjKfcRWuI",
          "width": 2048
        }
      ],
      "rating": 4.5,
      "reference": "CoQBcQAAALF_Ai0JvKDVMgtueZQs5rOTRY_EGS6-oUh0L_RlEq7C-ajdZMQlErfzcIr6k37ow5sKsJKEffUI-xpGz2VbquyN7DDo0WBN3-EbgKYejZVQ3cfqJfPrlDvCM8RoALIcUEJCaz0UUAQksG3eZOkHCYckUHLxH0wGLRJvykcppz__EhBjqNHI8a-hkuqTfVAtPlW0GhQMadCZCueHu9E56QLWOVfUMXiUcA",
      "types": [
        "cafe",
        "bar",
        "restaurant",
        "food",
        "establishment"
      ],
      "vicinity": "46 Boulevard Voltaire, Paris 11e arrondissement"
    },
    {
      "geometry": {
        "location": {
          "lat": 48.862997,
          "lng": 2.368494
        }
      },
      "icon": "http://maps.gstatic.com/mapfiles/place_api/icons/cafe-71.png",
      "id": "18ac7b2cbe59006e1ee806f4102831f9be820c83",
      "name": "Le Kitch",
      "photos": [
        {
          "height": 853,
          "html_attributions": [],
          "photo_reference": "CnRnAAAAN8LEzGK7EaXTNfkUfl85zYTZporjtooPZb7PhRg8zW1uJIPwDH8D7YGGlOK05kKZCdU_S090MtD4Edx9Np5V1BqFUyLk4rpg1Q1ZlfLXWG9f_6g_P67SdNzw0tAC1Bh7yhMBBxiMC9dOpT_lVNZSXhIQISlL23ydUsFy1PBCU9pU6BoUaiJd1AKKjxrAiUlySuxv0YI062E",
          "width": 1280
        }
      ],
      "rating": 4.4,
      "reference": "CnRrAAAA3MrRyt9xknFX3s2nhR8owHwhFzl3tTO1dyakOMPLpwBAW_m5KPHSDYmkkVKKurKvVzAeTejoZ_7yTtgh9zlNUTLP2NmX5G0jBwzgKC-pm4T63dk4_NvrHb6xpMW0tMv2Ozxal4vZJMMX0e8h2DHMDRIQBj2xpJEpSghgdzVeCoym6BoUBKEVymLcZSbRNcNtZLH0ilLDsqo",
      "types": [
        "cafe",
        "food",
        "establishment"
      ],
      "vicinity": "10 Rue Oberkampf, Paris"
    },
    {
      "geometry": {
        "location": {
          "lat": 48.863133,
          "lng": 2.370763
        }
      },
      "icon": "http://maps.gstatic.com/mapfiles/place_api/icons/cafe-71.png",
      "id": "e3e212980c9d73eeaffd574fbbaf31a2aaf5991d",
      "name": "BATACLAN",
      "opening_hours": {
        "open_now": true
      },
      "reference": "CnRqAAAAmYjFBpLHCzb6SA9bWFW1RycL-D9EoBmgOLyuVr5_mQvQ4vf-Y9muZMF-5bC0qJkDEtFCz40312Ex_D5XPybfQb3qHyvw_zLCZ30692VL-0P82S1LrmK5c12N_Bc3nxYeIPF8O3qXr_teq1VLaJls-xIQ6yxVQV8hTiGBLQbvrx--zhoUqXsGlj4bOJlPI6K4Y4u2GWfaOrY",
      "types": [
        "cafe",
        "food",
        "establishment"
      ],
      "vicinity": "50 Boulevard Voltaire, Paris"
    }
  ],
  "status": "OK"
};
