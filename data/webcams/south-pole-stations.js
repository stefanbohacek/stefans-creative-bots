/*
Some sites don't use full URL for the img src attribute and need page_url to be used as a prefix.
*/
export default [
  {
    name: "Amundsen-Scott South Pole station",
    url: "https://www.usap.gov/videoclipsandmaps/spWebCam.cfm",
    page_url: "https://www.usap.gov/videoclipsandmaps/",
    element: "#img-aro",
    location: {
      lat: -90,
      lon: 0,
    },
  },
  {
    name: "Palmer station",
    url: "https://www.usap.gov/videoclipsandmaps/palwebcam.cfm?t=0",
    page_url: "https://www.usap.gov/videoclipsandmaps/",
    element: "#img-palmer",
    location: {
      lat: 64.7743,
      lon: 64.0538,
    },
  },
  // {
  //   name: 'McMurdo station, Observation Hill',
  //   url: 'https://www.usap.gov/videoclipsandmaps/mcmwebcam.cfm?t=1',
  //   page_url: 'https://www.usap.gov/videoclipsandmaps/',
  //   element: '#img-boreSite',
  // location: {
  //   lat: 11111,
  //   lon: 11111
  // }
  // },
  {
    name: "Casey station",
    url: "https://www.antarctica.gov.au/antarctic-operations/webcams/casey/",
    element: "figure.featured img",
    location: {
      lat: 66.2821,
      lon: 110.5285,
    },
  },
  {
    name: "Davis station",
    url: "https://www.antarctica.gov.au/antarctic-operations/webcams/davis/",
    element: "figure.featured img",
    location: {
      lat: 68.5762,
      lon: 77.9696,
    },
  },
  {
    name: "Macquarie Island station",
    url: "https://www.antarctica.gov.au/antarctic-operations/webcams/macquarie-island/",
    element: "figure.featured img",
    location: {
      lat: 54.4997,
      lon: 158.9364,
    },
  },
  {
    name: "Mawson station",
    url: "https://www.antarctica.gov.au/antarctic-operations/webcams/mawson/",
    element: "figure.featured img",
    location: {
      lat: 67.6033,
      lon: 62.8742,
    },
  },
  // {
  //   name: 'Aurora Australis icebreaker',
  //   url: 'http://www.antarctica.gov.au/webcams/aurora',
  //   element: 'figure.featured img',
  // location: {
  //   lat: 11111,
  //   lon: 11111
  // }
  // },
  {
    name: "Bird Island research station",
    url: "https://www.bas.ac.uk/data/our-data/images/webcams/bird-island-webcam/",
    element: '.entry-content img[width="640"]',
    location: {
      lat: 54.0084,
      lon: 38.0513,
    },
  },
  {
    name: "King Edward Point",
    url: "https://www.bas.ac.uk/data/our-data/images/webcams/king-edward-point-webcam/",
    element: '.entry-content img[width="640"]',
    location: {
      lat: 54.2833,
      lon: 36.4937,
    },
  },
  // {
  //   name: 'RRS Ernest Shackleton',
  //   url: 'https://www.bas.ac.uk/data/our-data/images/webcams/rrs-ernest-shackleton-webcam/',
  //   element: '.entry-content img[width="640"]',
  // location: {
  //   lat: 11111,
  //   lon: 11111
  // }
  // },
  {
    name: "RRS James Clark Ross",
    url: "https://www.bas.ac.uk/data/our-data/images/webcams/rrs-james-clark-ross-webcam/",
    element: '.entry-content img[width="640"]',
    location: {
      lat: 82.8628,
      lon: 135.0000,
    },
  },
  // {
  //   name: "RRS Sir David Attenborough Webcam",
  //   url: "https://www.bas.ac.uk/data/our-data/images/webcams/rrs-sir-david-attenborough-webcam/",
  //   element: '.entry-content img[width="1920"]',
  //   location: {
  //     lat: 82.8628,
  //     lon: 135.0000,
  //   },
  // },
  // {
  //   name: "Halley VI Station Webcam Archive",
  //   url: "https://legacy.bas.ac.uk/webcams/archive/cam.php?cam=5&position=1",
  //   element: ".webcam_image main img",
  //   location: {
  //     lat: 11111,
  //     lon: 11111,
  //   },
  // },
  {
    name: "King Edward Point webcam",
    url: "https://www.bas.ac.uk/data/our-data/images/webcams/king-edward-point-webcam/",
    element: '.entry-content img[width="640"]',
    location: {
      lat: 54.2833,
      lon: 36.4937,
    },
  },
  {
    name: "Rothera webcam",
    url: "https://www.bas.ac.uk/data/our-data/images/webcams/rothera-webcam/",
    element: '.entry-content img[width="640"]',
    location: {
      lat: 67.5678,
      lon: 68.1267,
    },
  },
  {
    name: "Halley VI webcam",
    url: "https://www.bas.ac.uk/data/our-data/images/webcams/halley-vi-webcam/",
    element: '.entry-content img[width="1920"]',
    location: {
      lat: 75.5674,
      lon: 25.5165,
    },
  },
];
