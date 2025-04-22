import { useEffect, useState } from 'react';
import {  useNavigate, useParams } from 'react-router-dom';
import { Input, SelectPicker, Button, useMediaQuery } from 'rsuite';
import SearchIcon from '@rsuite/icons/Search';
import Navbar from '../components/Navbar';

export default function Home() {
  const [locations, setLocations] = useState([]);

  const [priceYears, setPriceYears] = useState([]);
  const [priceDisplay, setPriceDisplay] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const { location, year, searchString } = useParams();

  const [currLocations, setCurrLocations] = useState(0);
  const [queryYears, setQueryYears] = useState(() => year ? Number(year) : new Date().getFullYear());
  const [search, setSearch] = useState(() => searchString?.replace(/-/g, ' ') || '');


  const [isMobile] = useMediaQuery('(max-width: 700px)');

  const navigate = useNavigate();

  //Sync URL
  useEffect(() => {
    console.log('year',year)

    setQueryYears(year ? Number(year) : new Date().getFullYear());
    handleQueryYear(year ? Number(year) : new Date().getFullYear());
    setSearch(searchString ? searchString.replace(/-/g, ' ') : '');
  
  }, [location, year, searchString, locations]);

  

  //price years
  useEffect(() => {
    fetch('https://interview.propmall.my/price-years', {
      headers: {
        Authentication: 'TOKEN 67ce6d78ad121633723921',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.price_years?.length) {
          const array = data.price_years.map(item => ({
            label: item,
            value: item
          }));

          setPriceYears(array);
        } else {
          setPriceYears([]);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching price_years:', err);
        setLoading(false);
      });
  }, []);

  //update PriceDisplay
  useEffect(() => {
    if (priceYears.length > 0) {
      const defaultYear = priceYears.find(y => y.value === queryYears)?.value || priceYears[0].value;
      handleQueryYear(defaultYear); // Run only after setting the array

      console.log('priceDisplay', priceDisplay);
    }
  }, [priceYears]);

  //listing
  useEffect(() => {
    const fetchLocationsAndListings = async () => {
      setLoading(true);
      try {
        // Fetch locations
        const locationRes = await fetch('https://interview.propmall.my/locations', {
          headers: {
            Authentication: 'TOKEN 67ce6d78ad121633723921',
          },
        });
        const locationData = await locationRes.json();
        let locationList = locationData?.locations || [];
  
        locationList.unshift({
          location_id: '0',
          location_name: 'All Locations',
        });
  
        setLocations(locationList);
  
        // Match location slug from URL
        const match = locationList.find(
          (loc) => loc.location_name.toLowerCase().replace(/\s+/g, '-') === location
        );
  
        const matchedId = match ? parseInt(match.location_id) : 0;
        setCurrLocations(matchedId);
  
        // Fetch listings (after setting currLocations)
        const listingRes = await fetch('https://interview.propmall.my/listings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication': 'TOKEN 67ce6d78ad121633723921',
          },
          body: JSON.stringify({
            location: matchedId !== 0 ? matchedId : '',
            search: searchString ? searchString.replace(/-/g, ' ') : '',
          }),
        });
  
        const listingData = await listingRes.json();
        setListings(listingData?.listings || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchLocationsAndListings();
  }, [location, year, searchString]);
  

  const handleClick = () => {

    const found = formattedLocations.find(loc => loc.location_id === currLocations.toString());
    if (!found) return;

    const location = found.location_name;
    const formattedSearch = formattedStrings(search);
    const path = `/search/${location}/${queryYears}/${formattedSearch}`;
    navigate(path); // This will trigger listings fetch through the other useEffect
  };

  const handleQueryYear = (selectedYear) => {
    setQueryYears(selectedYear);

    const minYear = priceYears[0]?.value;
    const maxYear = priceYears[priceYears.length - 1]?.value;

    if (minYear && maxYear) {
      setPriceDisplay(getThreeCenteredYears(minYear, maxYear, selectedYear));
    }
  };

  const getThreeCenteredYears = (min, max, center) => {
    let start = center - 1;

    if (center <= min) {
      start = min;
    } else if (center >= max) {
      start = max - 2;
    }

    // Ensure start is within bounds
    start = Math.max(min, Math.min(start, max - 2));

    return Array.from({ length: 3 }, (_, i) => {
      const year = start + i;
      return {
        label: year.toString(),
        value: year,
        active: year === center
      };
    }).filter(y => y.value >= min && y.value <= max);
  };

  const formattedStrings = (val) => {
    return val.toLowerCase().replace(/\s+/g, '-')
  }

  function formatPrice(price) {
    const num = Number(price);
    if (isNaN(num)) return null;
    return 'RM ' + new Intl.NumberFormat('en-MY').format(num);
  }

  const formattedLocations = locations.map((loc) => ({
    ...loc,
    location_name: loc.location_name.toLowerCase().replace(/\s+/g, '-'),
  }));

  return (
    <div style={{ padding: '2rem', width: "58rem" }}>
      {/* #region Navbar*/}
      <Navbar></Navbar>
      {/* #endregion */}

      {/* #region query*/}
      <div className='query-section'>
        <div style={{ display: 'flex', flexDirection: "row", gap: "1rem" }}>
          <div className='query'>
            <div className='query-label'>Location</div>
            :
            <SelectPicker
              data={locations}
              searchable={false}
              cleanable={false}
              labelKey="location_name"
              valueKey="location_id"
              size={!isMobile ? 'full' : 'xs'}
              value={currLocations.toString()}
              onChange={(e) => setCurrLocations(e)}
              style={{ width: "15rem" }}
            />
          </div>

          <div className='query'>
            <div className='query-label' style={{ width: '3rem' }}>Year</div>
            :
            <SelectPicker
              data={priceYears}
              searchable={false}
              cleanable={false}
              value={queryYears}
              onChange={(e) => setQueryYears(e)}
              size={!isMobile ? 'full' : 'xs'}
              style={{ width: "10rem" }}
            />
          </div>
        </div>


        <div style={{ display: 'flex', flexDirection: "row", gap: "1rem" }}>
          <div className='query' style={{ width: "100%" }}>
            <div className='query-label'>Search</div>
            :
            <Input
              placeholder="Search"
              value={search}
              onChange={setSearch}
              size={!isMobile ? 'full' : 'xs'}
              style={{ width: "24rem" }}
            />
          </div>
          <div className='query' style={{ width: "100%" }}>
            <Button
              color="blue"
              appearance="ghost"
              onClick={handleClick}
              size={!isMobile ? 'full' : 'xs'}
            >
              <SearchIcon style={{ color: "blue", marginRight: 10, fontSize: '1.2rem' }} />
              Search
            </Button>
          </div>
        </div>

      </div>


      {/* #endregion */}

      {/* #region listing*/}
      <div>
        <div className='query-result'>{listings.length} Listings in PropMall.</div>

        <div className='listing'>
          <div className='listing-top'>
            <div></div>

            {loading ? (
              <p>Loading...</p>
            ) : (
              <>
                {priceDisplay.map((pd, index) => {

                  return (
                    <div key={index}
                      className={`year ${pd.active ? 'active' : ''}`} >
                      {pd.value}
                    </div>
                  );

                })}
              </>
            )}

          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              {listings.map((list, index) => {
                const slug = list.property_title.toLowerCase().replace(/\s+/g, '-');
                return (
                  <div key={list.property_id} onClick={() => navigate(`/property/${slug}-${list.property_id}`)} style={{cursor: 'pointer'}}>

                    <div className='listing-details'>
                      <div><img src={list.property_photo} style={{ width: "100%" }}></img></div>
                      <div className='item'>
                        <div className='item-title'>{list.property_title}</div>
                        <div className='item-row'>
                          <div className='item-label'>Location</div>:<div>{list.property_location}</div>
                        </div>
                        <div className='item-row'>
                          <div className='item-label'>Built Size</div>:<div>{list.property_built_size}</div>
                        </div>
                        <div className='item-row'>
                          <div className='item-label'>Land Size</div>:<div>{list.property_land_size}</div>
                        </div>
                        <div className='item-row'>
                          <div className='item-label'>Rooms</div>:<div>{list.property_room}</div>
                        </div>
                        <div className='item-row'>
                          <div className='item-label'>Bathrooms</div>:<div>{list.property_bathroom}</div>
                        </div>
                      </div>
                    </div>

                    <div className='listing-bottom'>
                      <div></div>

                      {loading ? (
                        <p>Loading...</p>
                      ) : (
                        <>
                          {priceDisplay.map((pd, index) => {
                            const price = formatPrice(list.property_prices[pd.value]);

                            return (
                              <div
                                key={index}
                                className={`price ${pd.active && price ? 'active' : ''}`}
                              >
                                {price || '-'}
                              </div>
                            );
                          })}
                        </>
                      )}
                    </div>

                  </div>
                );
              })}
            </>
          )}

        </div>

      </div>
      {/* #endregion */}

    </div>
  );
}
