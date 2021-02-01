/*
Some sites don't use full URL for the img src attribute and need page_url to be used as a prefix.
*/
module.exports = [
    {
      name: 'Amundsen-Scott South Pole station',
      url: 'https://www.usap.gov/videoclipsandmaps/spWebCam.cfm',
      page_url: 'https://www.usap.gov/videoclipsandmaps/',
      element: '#img-aro'
    },
    {
      name: 'Palmer station',
      url: 'https://www.usap.gov/videoclipsandmaps/palwebcam.cfm?t=0',
      page_url: 'https://www.usap.gov/videoclipsandmaps/',
      element: '#img-palmer'
    },
    {
      name: 'McMurdo station, Observation Hill',
      url: 'https://www.usap.gov/videoclipsandmaps/mcmwebcam.cfm?t=1',
      page_url: 'https://www.usap.gov/videoclipsandmaps/',
      element: '#img-boreSite'
    },
    {
      name: 'Casey station',
      url: 'https://www.antarctica.gov.au/antarctic-operations/webcams/casey/',
      element: 'figure.featured img'
    },
    {
      name: 'Davis station',
      url: 'https://www.antarctica.gov.au/antarctic-operations/webcams/davis/',
      element: 'figure.featured img'
    },
    {
      name: 'Macquarie Island station',
      url: 'https://www.antarctica.gov.au/antarctic-operations/webcams/macquarie-island/',
      element: 'figure.featured img'
    },
    {
      name: 'Mawson station',
      url: 'https://www.antarctica.gov.au/antarctic-operations/webcams/mawson/',
      element: 'figure.featured img'
    },
    // {
    //   name: 'Aurora Australis icebreaker',
    //   url: 'http://www.antarctica.gov.au/webcams/aurora',
    //   element: 'figure.featured img'
    // },
    // {
    //   name: 'Ny-Ålesund webcam',
    //   url: 'https://www.bas.ac.uk/data/our-data/images/webcams/ny-alesund/',
    //   element: '.wp-image-15729'
    // },
    {
      name: 'Bird Island research station',
      url: 'https://www.bas.ac.uk/data/our-data/images/webcams/bird-island-webcam/',
      element: '.entry-content img[width="640"]'
    },
    {
      name: 'King Edward Point',
      url: 'https://www.bas.ac.uk/data/our-data/images/webcams/king-edward-point-webcam/',
      element: '.entry-content img[width="640"]'
    },
    // {
    //   name: 'RRS Ernest Shackleton',
    //   url: 'https://www.bas.ac.uk/data/our-data/images/webcams/rrs-ernest-shackleton-webcam/',
    //   element: '.entry-content img[width="640"]'
    // },
    {
      name: 'RRS James Clark Ross',
      url: 'https://www.bas.ac.uk/data/our-data/images/webcams/rrs-james-clark-ross-webcam/',
      element: '.entry-content img[width="640"]'
    }
];
