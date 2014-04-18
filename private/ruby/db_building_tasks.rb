
require 'addressable/uri'
require 'json'
require 'rest-client'
require "awesome_print"
require 'sqlite3'
require 'open-uri'
require 'nokogiri'

GOOGLE_API_KEY = "AIzaSyAt4AAA7Kmj8O7w33-I0_gORjZXEvEbD3E"
YELP_API_KEY = "HXPIYJ84QfFlsZ2ciL3eug"

def setup_db()
  db = SQLite3::Database.open "places1.db"
  db.execute "CREATE TABLE IF NOT EXISTS Places(
    id INTEGER PRIMARY KEY,
    g_ref STRING NOT NULL UNIQUE,
    g_id STRING NOT NULL UNIQUE,
    name TEXT,
    phone STRING,
    y_id STRING,
    yelp_name STRING
    )"
    # terrasse INTEGER
  db.execute "CREATE INDEX IF NOT EXISTS places_g_id ON Places (g_id);"
  db.execute "CREATE INDEX IF NOT EXISTS places_g_ref ON Places (g_ref);"
  db
end



def google_radar_call(lat_lng, keyword)
  lat, lng = lat_lng
  url = Addressable::URI.new(
    :scheme => "https",
    :host => "maps.googleapis.com",
    :path => "/maps/api/place/radarsearch/json",
    :query_values => {
      :sensor => "false",
      :radius=> 5000,
      :types =>"cafe|bar|restaurant",
      :location => "#{lat},#{lng}",
      # :keyword => keyword,
      :key => GOOGLE_API_KEY
      # :limit => 25
    }).to_s
  response = JSON.parse(RestClient.get(url))
  results = response['results']
  # p results.length.to_s + " results"
  results
end

def add_one_to_db(place, db)

  begin
    g_ref = place['reference']
    g_id = place['id']
    db.execute "INSERT INTO Places(g_ref, g_id) VALUES (?, ?)", g_ref, g_id

  rescue SQLite3::Exception => e

    puts "Exception occured"
    puts e

  end
end

def get_g_ref(index, db)
  results = db.execute "SELECT g_ref FROM Places WHERE id = ?", index
  results.first
end

def get_phone(index, db)
  results = db.execute "SELECT phone FROM Places WHERE id = ?", index
  results.first
end

def get_y_id_and_name_from_db(index, db)
  results = db.execute "SELECT y_id, yelp_name FROM Places WHERE id = ?", index
  results.first
end

def google_call_for_more_info(reference)
  url = Addressable::URI.new(
    :scheme => "https",
    :host => "maps.googleapis.com",
    :path => "maps/api/place/details/json",
    :query_values => {
      :reference => reference,
      :sensor => "false",
      :key => GOOGLE_API_KEY
    }).to_s
  # p url
  response = JSON.parse(RestClient.get(url))
  response
end

def add_more_info_to_db(data, db, id)
  phone = data['result']['international_phone_number']
  p id
  p name = data['result']['name']
  # take phone, name, address, etc. from response and add to db
  db.execute "
  UPDATE
    Places
  SET
    name = ?,
    phone = ?
  WHERE
    id = ?
  ", name, phone, id

end

def get_yelp_info_from_phone(phone_number)
  # http://api.yelp.com/phone_search?phone=1234567890&ywsid=XXXXXXXXXXXXXXXX
  yelp_url = Addressable::URI.new(
    :scheme => "http",
    :host => "api.yelp.com",
    :path => "phone_search",
    :query_values => {
      :phone => phone_number,
      :ywsid => YELP_API_KEY
    }).to_s
  response = JSON.parse(RestClient.get(yelp_url))
end


def add_yelp_info_to_db(data, db, id)
  if (data && data['businesses'] && data['businesses'].first)
    yelp_id = data['businesses'].first['id']
    yelp_name = data['businesses'].first['name']
    p id
    p yelp_name
    # take phone, name, address, etc. from response and add to db
    db.execute "
    UPDATE
      Places
    SET
      y_id = ?,
      yelp_name = ?
    WHERE
      id = ?
    ", yelp_id, yelp_name, id
    return 0
  else
    p id
    p 'not found'
    return 1
  end
end

def scrape_yelp_page(y_id)

  base_url = "http://www.yelp.com/biz/"
  url = base_url + y_id

  begin
    doc = Nokogiri::HTML(open(URI.encode(url), 'User-Agent' => 'me'))
    outdoor_value = doc.at_css('.ysection h3:contains("More")').parent().at_css('dt:contains("Outdoor")').parent.at_css('dd').content.strip
    # jQuery version
    # $('.ysection h3:contains("More")').parent().find('dt:contains("Outdoor")').parent().find('dd').text().trim()
    p outdoor_value
    return 1 if (outdoor_value == "Yes")
    return 0 if (outdoor_value == "No")
    p "no value scraped"
    return nil
  rescue OpenURI::HTTPError => e
    puts "Can't open " + url
    puts e
    return nil
  rescue # any error
    puts "Data not found in page"
    return nil
  end

end

def add_terrasse_info_to_db(terrasse, db, id)
  db.execute "
  UPDATE
    Places
  SET
    terrasse = ?
  WHERE
    id = ?
  ", terrasse, id
end

def test_run()
  db = setup_db()

  places = google_radar_call([48.8645174,2.3412754])

  places.each do |place|
    add_one_to_db(place, db)
  end

  20.times do |i|
    g_ref = db.execute "SELECT g_ref FROM Places WHERE id = ?", i
    if (g_ref[0])
      g_ref = g_ref[0][0]
      more_info = google_call_for_more_info(g_ref)
      add_more_info_to_db(more_info, db, i)
    end
  end

  20.times do |i|
    phone = db.execute "SELECT phone FROM Places WHERE id = ?", i
    if (phone[0])
      phone = phone[0][0]
      yelp_info = get_yelp_info_from_phone(phone)
      add_yelp_info_to_db(yelp_info, db, i) if yelp_info
    end
  end
end




  # 1 - make calls to cafes_in_paris() to cover all of Paris and put it all in a database
  # 2 - iterate over that database using more_info() (Google API) to add phone number
  # 3 - iterate again using find_yelp_id_from_phone(phone_number) (Yelp phone match API) to get yelp_id
  # 4 - iterate again using scrape_yelp_page(y_id) to get terrasse BOOL value



# step 1 returns only location, id and reference
google_radar_result = {"geometry"=>{"location"=>{"lat"=>48.854617, "lng"=>2.305826}}, "id"=>"539b902c217fd75ec3ff8577bb41d87f090631e1", "reference"=>"CoQBdQAAAD2457giAm32suGijjGsoa7-nvmGz6eLIUrZ-7MHkSYb5qGVTDX_5y99eNvm_c_rgrQ6aSYKz1YUaWkiklzgoVFjNUHEwX7JWkKS7CGdXZI0okj0kwlfQyAvDDcil8fEgB0xK_4PjVHjJshtNX77EDm37kamdgZMT4wKD8nkBp3qEhBcu4PFkhMhtFUNMl7kWLUrGhTAxjrL_cTubgoigZH1HlIkOpQ_rQ"}

# step 2 returns more info, including phone number
google_more_info_result = {"html_attributions"=>[], "result"=>{"address_components"=>[{"long_name"=>"2", "short_name"=>"2", "types"=>["street_number"]}, {"long_name"=>"Place de l'École Militaire", "short_name"=>"Place de l'École Militaire", "types"=>["route"]}, {"long_name"=>"Paris", "short_name"=>"Paris", "types"=>["locality", "political"]}, {"long_name"=>"Paris", "short_name"=>"Paris", "types"=>["administrative_area_level_2", "political"]}, {"long_name"=>"IDF", "short_name"=>"IDF", "types"=>["administrative_area_level_1", "political"]}, {"long_name"=>"France", "short_name"=>"FR", "types"=>["country", "political"]}, {"long_name"=>"75007", "short_name"=>"75007", "types"=>["postal_code"]}], "adr_address"=>"<span class=\"street-address\">2 Place de l&#39;École Militaire</span>, <span class=\"postal-code\">75007</span> <span class=\"locality\">Paris</span>, <span class=\"country-name\">France</span>", "formatted_address"=>"2 Place de l'École Militaire, Paris, France", "formatted_phone_number"=>"01 45 55 00 02", "geometry"=>{"location"=>{"lat"=>48.854617, "lng"=>2.305826}}, "icon"=>"http://maps.gstatic.com/mapfiles/place_api/icons/cafe-71.png", "id"=>"539b902c217fd75ec3ff8577bb41d87f090631e1", "international_phone_number"=>"+33 1 45 55 00 02", "name"=>"La Terrasse du 7eme", "opening_hours"=>{"open_now"=>false, "periods"=>[{"close"=>{"day"=>1, "time"=>"0130"}, "open"=>{"day"=>0, "time"=>"0730"}}, {"close"=>{"day"=>2, "time"=>"0130"}, "open"=>{"day"=>1, "time"=>"0730"}}, {"close"=>{"day"=>3, "time"=>"0130"}, "open"=>{"day"=>2, "time"=>"0730"}}, {"close"=>{"day"=>4, "time"=>"0130"}, "open"=>{"day"=>3, "time"=>"0730"}}, {"close"=>{"day"=>5, "time"=>"0130"}, "open"=>{"day"=>4, "time"=>"0730"}}, {"close"=>{"day"=>6, "time"=>"0130"}, "open"=>{"day"=>5, "time"=>"0730"}}, {"close"=>{"day"=>0, "time"=>"0130"}, "open"=>{"day"=>6, "time"=>"0730"}}]}, "photos"=>[{"height"=>1365, "html_attributions"=>[], "photo_reference"=>"CnRnAAAAuIBxCY3Y7yThJPj6BGp-TwTozO7oVnCJomvWNhrLdP4RMz61cdxp5Q36pi0QIONxmqrkWBDjKYjxZhBHNxuQjN5k0I4MYmOloasiuaaU1XIONA3D5-Wqc_9rLJ_vxODECoS6KfC1M2may1PqgtBV0RIQLBO1asHfdEOrdJuYMSylgBoUXFje0BBN11Gslkxt5Spn99e-j8o", "width"=>2048}, {"height"=>960, "html_attributions"=>["<a href=\"https://plus.google.com/117447536702296431841\">Jaywaay icefishing</a>"], "photo_reference"=>"CnRoAAAAAM6hN0wFYaDMd-5oaCfPKfyquT7ju1k4U6h1IO-X-ZEJOY6iN59jPZt0UebbuPzA2o9D2j0e7Di-eSaF4ksafkQ6P8K0zCerrfXj9RTqN2nOcMLXD7DA0rTY8th1KAspnB0DiwA1EZwsxwQWmjKc6RIQ0PD1mhIpgP4K_iLQoGOquxoU4Q8u0SkHMGXOXElfVmKC63G5vt0", "width"=>1280}], "rating"=>4, "reference"=>"CoQBdQAAAJC-olTCjOeV0mkKO_YHR8WWMKyABaiXa1dHmzQc0zxbhsdY8hEJLeJBzhzcIABsscoJDSjoPj_pUPNIJH794p71cor7FfqhcO1Knplw6OIdAINQDPkAm0DAHDYh2pKICW10l1-ZGGlKbGkPwh5L_n4LtV9MYAPCuIV6ZVEjZlzpEhBrLBWhBmuoP1e0T6qpSp42GhR6DZOWEA61hnEkXzfxmd2LGgS6fQ", "reviews"=>[{"aspects"=>[{"rating"=>3, "type"=>"overall"}], "author_name"=>"Maarit Seppälä", "author_url"=>"https://plus.google.com/117732792466486772389", "language"=>"en", "rating"=>5, "text"=>"Good personal service. Tasty food. I also got a small French language training sympathetic waiter, he recognized us always kind enough to serve. Our place is always ... highly recommend.", "time"=>1391337238}, {"aspects"=>[{"rating"=>2, "type"=>"overall"}], "author_name"=>"Terry Harrell", "author_url"=>"https://plus.google.com/112503055693277395724", "language"=>"en", "rating"=>4, "text"=>"We ate here 3 times. It was a good place to stop near where we were staying. It&#39;s a nice location to sit outside and watch people go by. Good food. The waiters were, in order 1. very nice and good, 2. not so good. 3. good enough. The food was fine. Very good salad niciose (or however you spell that). A pleasant memory, and worth going to if you are in the neighborhood.", "time"=>1379309670}, {"aspects"=>[{"rating"=>3, "type"=>"overall"}], "author_name"=>"Maksim Ovcharenko", "author_url"=>"https://plus.google.com/113709089004241332352", "language"=>"en", "rating"=>5, "text"=>"This is the best restaurant in Paris we&#39;ve been to. They speak English and have an English language menu. Maitre D made some very good suggestions in terms of what to order and even got my kid a dish that wasn&#39;t on the menu. We&#39;ve been served very fast (please note that fast service in Paris restaurants practically doesn&#39;t exist), the wine was great, the food was out of this world and we really enjoyed the ambient atmosphere of this place. My only regret is that we&#39;ve discovered this restaurant on the last day of our visit to Paris so could not come back for another meal.", "time"=>1382379471}, {"aspects"=>[{"rating"=>2, "type"=>"overall"}], "author_name"=>"Dawn Wendell", "author_url"=>"https://plus.google.com/104047841954064218064", "language"=>"en", "rating"=>4, "text"=>"A nice place to have coffee and people-watch. I also had dinner here twice and both times it was tasty, although a little pricey.", "time"=>1379795175}, {"aspects"=>[{"rating"=>3, "type"=>"overall"}], "author_name"=>"YEVGENIY GELLER", "author_url"=>"https://plus.google.com/111318828472688122386", "language"=>"en", "rating"=>5, "text"=>"Delicious food, friendly staff.", "time"=>1384213100}], "types"=>["cafe", "restaurant", "food", "establishment"], "url"=>"https://plus.google.com/110789049519746924895/about?hl=en-US", "user_ratings_total"=>28, "utc_offset"=>120, "vicinity"=>"2 Place de l'École Militaire, Paris", "website"=>"http://www.laterrassedu7.com/"}, "status"=>"OK"}
phone = google_more_info_result['result']['international_phone_number']

# step 3 returns yelp_id + other info
yelp_phone_match_result = {"message"=>{"text"=>"OK", "code"=>0, "version"=>"1.1.1"}, "businesses"=>[{"rating_img_url"=>"http://s3-media1.ak.yelpcdn.com/assets/2/www/img/5ef3eb3cb162/ico/stars/v1/stars_3_half.png", "country_code"=>"FR", "id"=>"-2ziowJOZLDCQgtXzW5d4Q", "is_closed"=>false, "city"=>"Paris", "mobile_url"=>"http://m.yelp.fr/biz/la-terrasse-du-7eme-paris", "review_count"=>31, "zip"=>"75007", "state"=>"Paris", "rating_img_url_small"=>"http://s3-media1.ak.yelpcdn.com/assets/2/www/img/2e909d5d3536/ico/stars/v1/stars_small_3_half.png", "address1"=>"2 place Ecole Militaire", "address2"=>"", "address3"=>"", "phone"=>"+33145550002", "state_code"=>"75", "categories"=>[{"category_filter"=>"french", "search_url"=>"http://www.yelp.fr/search?cflt=french&find_desc=&find_loc=2+place+Ecole+Militaire%2C+Paris+75007", "name"=>"French"}, {"category_filter"=>"bars", "search_url"=>"http://www.yelp.fr/search?cflt=bars&find_desc=&find_loc=2+place+Ecole+Militaire%2C+Paris+75007", "name"=>"Bars"}, {"category_filter"=>"diners", "search_url"=>"http://www.yelp.fr/search?cflt=diners&find_desc=&find_loc=2+place+Ecole+Militaire%2C+Paris+75007", "name"=>"Diners"}], "photo_url"=>"http://media3.ak.yelpcdn.com/bpthumb/L-8ynS8xGEA2t4PldWJghQ/ms", "distance"=>0.0, "name"=>"La Terrasse du 7eme", "neighborhoods"=>[{"url"=>"http://www.yelp.fr/search?exclude_start=True&find_desc=&find_loc=Tour+Eiffel%2FChamp+de+Mars%2C+Paris", "name"=>"Tour Eiffel/Champ de Mars"}, {"url"=>"http://www.yelp.fr/search?exclude_start=True&find_desc=&find_loc=7%C3%A8me%2C+Paris", "name"=>"7ème"}], "url"=>"http://www.yelp.fr/biz/la-terrasse-du-7eme-paris", "country"=>"France", "avg_rating"=>3.5, "nearby_url"=>"http://www.yelp.fr/search?find_desc=&find_loc=2+place+Ecole+Militaire%2C+Paris+75007", "reviews"=>[{"rating_img_url_small"=>"http://s3-media1.ak.yelpcdn.com/assets/2/www/img/c7623205d5cd/ico/stars/v1/stars_small_5.png", "user_photo_url_small"=>"http://media1.ak.yelpcdn.com/upthumb/AogZy-oSUBZKcbH82wwy1w/ss", "rating_img_url"=>"http://s3-media1.ak.yelpcdn.com/assets/2/www/img/f1def11e4e79/ico/stars/v1/stars_5.png", "rating"=>5, "user_url"=>"http://www.yelp.com/user_details?userid=fVGM7h1BrItVmEmesr58Hg", "url"=>"http://www.yelp.fr/biz/la-terrasse-du-7eme-paris?hrid=ZtAEiBTYitg4z9gZQqu6WQ", "mobile_uri"=>"/biz/la-terrasse-du-7eme-paris?full=True&hrid=ZtAEiBTYitg4z9gZQqu6WQ", "text_excerpt"=>"Staff were genuinely friendly and nice. Most of the staff spoke excellent English. Excellent onion soup and chocolate custard. Veal special on sunday night...", "user_photo_url"=>"http://media1.ak.yelpcdn.com/upthumb/AogZy-oSUBZKcbH82wwy1w/ms", "date"=>"2014-04-07", "user_name"=>"Mike M.", "id"=>"ZtAEiBTYitg4z9gZQqu6WQ"}, {"rating_img_url_small"=>"http://s3-media4.ak.yelpcdn.com/assets/2/www/img/f62a5be2f902/ico/stars/v1/stars_small_4.png", "user_photo_url_small"=>"http://media1.ak.yelpcdn.com/upthumb/YzzQLyt8RewQAovbs24b6w/ss", "rating_img_url"=>"http://s3-media4.ak.yelpcdn.com/assets/2/www/img/c2f3dd9799a5/ico/stars/v1/stars_4.png", "rating"=>4, "user_url"=>"http://www.yelp.com/user_details?userid=YU6YQl7VjPzfmu8THPTf8w", "url"=>"http://www.yelp.fr/biz/la-terrasse-du-7eme-paris?hrid=F7DEwqcTQyDx_rM0yRscGQ", "mobile_uri"=>"/biz/la-terrasse-du-7eme-paris?full=True&hrid=F7DEwqcTQyDx_rM0yRscGQ", "text_excerpt"=>"Super bien situé et grande terrasse!! On a déjeuné à l'étage, il y de grandes baies vitrées et un super point de vue. Donc si vous n'avez pas de place en...", "user_photo_url"=>"http://media1.ak.yelpcdn.com/upthumb/YzzQLyt8RewQAovbs24b6w/ms", "date"=>"2014-03-09", "user_name"=>"Aurélia H.", "id"=>"F7DEwqcTQyDx_rM0yRscGQ"}, {"rating_img_url_small"=>"http://s3-media4.ak.yelpcdn.com/assets/2/www/img/f62a5be2f902/ico/stars/v1/stars_small_4.png", "user_photo_url_small"=>"http://media1.ak.yelpcdn.com/upthumb/QoqiDG66Tch08u6Fr_nXVQ/ss", "rating_img_url"=>"http://s3-media4.ak.yelpcdn.com/assets/2/www/img/c2f3dd9799a5/ico/stars/v1/stars_4.png", "rating"=>4, "user_url"=>"http://www.yelp.com/user_details?userid=eZolWlBpAgdPUTocv__9KQ", "url"=>"http://www.yelp.fr/biz/la-terrasse-du-7eme-paris?hrid=L1uPNaORBjv2gmWXGheFaQ", "mobile_uri"=>"/biz/la-terrasse-du-7eme-paris?full=True&hrid=L1uPNaORBjv2gmWXGheFaQ", "text_excerpt"=>"Had a great dinner here with good service. The onion soup was very good. Next we each had the steak and veal with came in a strong sauce. Both plates were...", "user_photo_url"=>"http://media1.ak.yelpcdn.com/upthumb/QoqiDG66Tch08u6Fr_nXVQ/ms", "date"=>"2014-02-28", "user_name"=>"Jacob H.", "id"=>"L1uPNaORBjv2gmWXGheFaQ"}], "photo_url_small"=>"http://media3.ak.yelpcdn.com/bpthumb/L-8ynS8xGEA2t4PldWJghQ/ss"}]}
yelp_id = "-2ziowJOZLDCQgtXzW5d4Q";

# step 4 returns true, false or nil





def big_google_call()

  number_of_step = 30;
  lat_base = 48.810837;
  lat_step = (0.1 / number_of_step);
  lng_base = 2.241837;
  lng_step = (0.22 / number_of_step);

  for lat_index in 0..number_of_step
    for lng_index in 0..number_of_step
      this_lat = lat_base + lat_index * lat_step;
      this_lng = lng_base + lng_index * lng_step;

      places = google_radar_call([this_lat,this_lng], nil)
      places.each do |place|
        add_one_to_db(place, db)
      end
    end
  end
end

def adding_details_to_whole_db(db)
  db_count = 2404
  for index in 1..2404
    g_ref = get_g_ref(index, db)
    data = google_call_for_more_info(g_ref)
    add_more_info_to_db(data, db, index)
  end
end

def adding_yelp_id_to_whole_db(db)
  db_count = 2404
  not_found = 0
  for index in 1..db_count
    phone = get_phone(index, db)
    yelp_info = get_yelp_info_from_phone(phone)
    not_found += add_yelp_info_to_db(yelp_info, db, index)
  end
  print 'ALL DONE - Not found: ', not_found, "\n"
end

def adding_terrasse_info_to_whole_db(db)
  db_count = 2404
  total_y_id = 0
  total_successfully_scraped = 0
  total_terrasses = 0
  for index in 1001..db_count
    data = get_y_id_and_name_from_db(index, db)
    y_id = data.first
    name = data[1]
    print index, ' ', name, "\n"
    if (y_id)
      total_y_id += 1
      terrasse = scrape_yelp_page(y_id) # returns 1, 0 or nil
      if (terrasse)
        total_successfully_scraped += 1
        total_terrasses += terrasse
        add_terrasse_info_to_db(terrasse, db, index)
      end
    end
  end
  print 'ALL DONE - y_id tested: ', total_y_id,' - Successfully scraped: ', total_successfully_scraped, ' - Terrasses: ', total_terrasses,  "\n"
end

# Paris

#lat 48.810837 -> 48.908824
#lng 2.241837 -> 2.459236

if __FILE__ == $PROGRAM_NAME
  # runs only if the script is called directly, not included with require()
  # in irb use require('./first_research.rb')

  db = SQLite3::Database.open "places1.db"
  adding_terrasse_info_to_whole_db(db)
end

## access sql db from bash
# sqlite3 places1.db
# .tables
# select * from Places;

## export sqlite3 to csv (in sqlite3)
# > .output user.csv
# > .mode csv
# > .header on
# > select * from user;

## import in local mongo (in bash)
# $ mongoimport --db sqlImport --collection terrasses --type csv --file places.csv --headerline

## import in meteor (dev local) mongo
# $ mongoimport -h localhost:3001 --db meteor --collection terrasses --type csv --file terrasses_V1_17042014.csv --headerline
