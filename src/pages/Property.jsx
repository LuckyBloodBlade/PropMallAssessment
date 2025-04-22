import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';


export default function Home() {
  const [priceYears, setPriceYears] = useState([]);
  const [priceDisplay, setPriceDisplay] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const { location, year, searchString } = useParams();

  const [queryYears, setQueryYears] = useState(() => year ? Number(year) : new Date().getFullYear());

  const { slug } = useParams();
  const parts = slug.split('-');
  const id = parts[parts.length - 1];
  const title = parts.slice(0, -1).join('-');


  const navigate = useNavigate();

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

        //setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching price_years:', err);
        //setLoading(false);
      });
  }, []);

  //update PriceDisplay
  useEffect(() => {
    if (priceYears.length > 0) {
      // Get the current year or fallback to the middle of the list
      const currentYear = new Date().getFullYear();
      const defaultYear = priceYears.find(y => y.value === currentYear)?.value || array[0].value;
      handleQueryYear(defaultYear); // Run only after setting the array

      console.log('priceDisplay', priceDisplay);
    }
  }, [priceYears]);


  //listing
  useEffect(() => {
    fetch('https://interview.propmall.my/listing/detail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authentication': 'TOKEN 67ce6d78ad121633723921',
      },
      body: JSON.stringify({
        property_id: id
      }),
    })
      .then((res) => res.json())
      .then((data) => {

        setListings(data?.listing || []);

        console.log("listings", listings)

        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching listings:', err);
        setLoading(false);
      });
  }, [location, year, searchString]);


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

  function formatPrice(price) {
    const num = Number(price);
    if (isNaN(num)) return null;
    return 'RM ' + new Intl.NumberFormat('en-MY').format(num);
  }

  function formatSqft(value) {
    return `${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })} sqft`;
  }

  function PropertyDescription({ description }) {
    const formattedDescription = description?.replace(/\r\n/g, '<br />');

    return (
      <div
        dangerouslySetInnerHTML={{ __html: formattedDescription }}
      />
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* #region Navbar*/}
      <Navbar></Navbar>
      {/* #endregion */}

      {/* #region listing*/}
      <div>
        <div className='listing'>
          <div className='listing-top'>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div>
              <div className='listing-details'>
                <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>

                  {loading ? (
                    <p>Loading...</p>
                  ) : (
                    <>
                      {listings.property_photos?.map((photo, index) => {
                        return (
                          <img src={photo} style={{ width: "100%" }}></img>
                        );
                      })}
                    </>
                  )}


                </div>
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <div className='item'>
                    <div className='item-title'>{listings.property_title}</div>
                    <div className='item-row'>
                      <div className='item-label'>Location</div>:<div>{listings.property_location}</div>
                    </div>
                    <div className='item-row'>
                      <div className='item-label'>Built Size</div>:<div>{formatSqft(listings.property_built_size)}</div>
                    </div>
                    <div className='item-row'>
                      <div className='item-label'>Land Size</div>:<div>{formatSqft(listings.property_land_size)}</div>
                    </div>
                    <div className='item-row'>
                      <div className='item-label'>Rooms</div>:<div>{listings.property_room}</div>
                    </div>
                    <div className='item-row'>
                      <div className='item-label'>Bathrooms</div>:<div>{listings.property_bathroom}</div>
                    </div>
                    <div style={{ marginTop: '2rem' }}></div>
                    <div className=''><PropertyDescription description={listings.property_description} /></div>
                    <div style={{ marginTop: '2rem' }}></div>
                  </div>
                )}

              </div>

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
              <div className='listing-bottom'>
                <div className='asking-price'>Asking Price :</div>

                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <>
                    {priceDisplay.map((pd, index) => {
                      let price
                      if (listings?.property_prices[pd?.value]) {
                        price = formatPrice(listings?.property_prices[pd?.value]);
                      }
                      return (
                        <div
                          key={index}
                          className={`price ${pd.active && price ? 'active' : ''}`}
                          style={{ borderTop: 'unset' }}
                        >
                          {price || '-'}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>

              <div className='whatsapp'>
                <WhatsAppButton></WhatsAppButton>
              </div>


            </div>
          )}

        </div>

      </div>
      {/* #endregion */}

    </div>
  );
}


const WhatsAppButton = () => {
  const phoneNumber = "60146416054"; // Replace with agent's number
  const currentUrl = window.location.href;

  const message = `Hello My Lovely Agent,

I'm interested in the property that you advertise at website 
${currentUrl} 
and I would love to visit this property.

My name:`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        backgroundColor: "rgb(0 175 80)",
        color: "white",
        padding: "10px 16px",
        borderRadius: "5px",
        textDecoration: "none",
        fontWeight: "bold",
        fontSize: "14px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)"
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="white"
        viewBox="0 0 24 24"
        width="20px"
        height="20px"
        style={{ marginRight: "8px" }}
      >
        <path d="M20.52 3.48A11.88 11.88 0 0012 0C5.38 0 .01 5.37 0 12c0 2.12.56 4.2 1.62 6.02L0 24l6.24-1.63A11.96 11.96 0 0012 24c6.62 0 12-5.38 12-12a11.88 11.88 0 00-3.48-8.52zM12 22a9.88 9.88 0 01-5.06-1.39l-.36-.21-3.7.96.99-3.61-.23-.37A9.89 9.89 0 1122 12c0 5.52-4.48 10-10 10zm5.24-7.51l-2.02-.59a.998.998 0 00-.96.26l-.6.62a7.08 7.08 0 01-3.9-3.9l.62-.6a.999.999 0 00.26-.96l-.59-2.02a1 1 0 00-.94-.69c-1.5 0-2.73 1.23-2.73 2.73 0 .2.02.4.05.6a10.03 10.03 0 009.04 9.04c.2.03.4.05.6.05 1.5 0 2.73-1.23 2.73-2.73 0-.44-.25-.84-.69-.94z" />
      </svg>
      WhatsApp Agent Now!
    </a>
  );
};