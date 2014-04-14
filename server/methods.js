Meteor.methods({
    get_places: function(location, isFake){
        if (isFake){
            return fake_response;
        }
        this.unblock();

        try {
            var api_response = HTTP.get(GOOGLE_API_URL, {params: {
                key: GOOGLE_API_KEY,
                location: location,
                rankby: 'distance',
                sensor: 'true',
                types: 'cafe'
            }});

            return api_response.data;
        }

        catch (e){
            return false;
            }
        }
});

GOOGLE_API_KEY = "AIzaSyAt4AAA7Kmj8O7w33-I0_gORjZXEvEbD3E";
GOOGLE_API_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";

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
