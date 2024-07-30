/*
Some sites don't use full URL for the img src attribute and need page_url to be used as a prefix.
*/
export default [
  {
    name: "Neumayer Station III",
    image_url: "https://www.awi.de/NM_WebCam/neumayerW.0650.jpg",
    url: "https://www.awi.de/en/expedition/stations/neumayer-station-iii.html",
  },
  {
    name: "Troll research station",
    image_url: "https://trollcam.npolar.no/TrollWebCam1HD.jpg",
    url: "https://www.npolar.no/en/troll/webcam/",
  },
  {
    name: "Troll research station",
    image_url: "https://trollcam.npolar.no/TrollWebCam3HD.jpg",
    url: "https://www.npolar.no/en/troll/webcam/",
  },
  {
    name: "Amundsen-Scott South Pole station",
    url: "https://www.usap.gov/videoclipsandmaps/spWebCam.cfm",
    page_url: "https://www.usap.gov/videoclipsandmaps/",
    element: "#img-aro",
  },
  {
    name: "Palmer station",
    url: "https://www.usap.gov/videoclipsandmaps/palwebcam.cfm?t=0",
    page_url: "https://www.usap.gov/videoclipsandmaps/",
    element: "#img-palmer",
  },
  {
    name: "Casey station",
    url: "https://www.antarctica.gov.au/antarctic-operations/webcams/casey/",
    element: "figure.featured img",
  },
  {
    name: "Davis station",
    url: "https://www.antarctica.gov.au/antarctic-operations/webcams/davis/",
    element: "figure.featured img",
  },
  {
    name: "Macquarie Island station",
    url: "https://www.antarctica.gov.au/antarctic-operations/webcams/macquarie-island/",
    element: "figure.featured img",
  },
  {
    name: "Mawson station",
    url: "https://www.antarctica.gov.au/antarctic-operations/webcams/mawson/",
    element: "figure.featured img",
  },
  {
    name: "Bird Island research station",
    url: "https://www.bas.ac.uk/data/our-data/images/webcams/bird-island-webcam/",
    element: '.entry-content img[width="640"]',
  },
  {
    name: "King Edward Point",
    url: "https://www.bas.ac.uk/data/our-data/images/webcams/king-edward-point-webcam/",
    element: '.entry-content img[width="640"]',
  },
  // posts old images
  //   {
  //     name: "RRS James Clark Ross",
  //     url: "https://www.bas.ac.uk/data/our-data/images/webcams/rrs-james-clark-ross-webcam/",
  //     element: '.entry-content img[width="640"]',
  //   },
  // moved to North Pole
  // {
  //   name: "RRS Sir David Attenborough Webcam",
  //   url: "https://www.bas.ac.uk/data/our-data/images/webcams/rrs-sir-david-attenborough-webcam/",
  //   element: '.entry-content img[width="1920"]',
  // },
  {
    name: "King Edward Point webcam",
    url: "https://www.bas.ac.uk/data/our-data/images/webcams/king-edward-point-webcam/",
    element: '.entry-content img[width="640"]',
  },
  {
    name: "Rothera webcam",
    url: "https://www.bas.ac.uk/data/our-data/images/webcams/rothera-webcam/",
    element: '.entry-content img[width="640"]',
  },
  // {
  //   name: "Halley VI webcam",
  //   url: "https://www.bas.ac.uk/data/our-data/images/webcams/halley-vi-webcam/",
  //   element: '.entry-content img[width="1920"]',
  //   location: {
  //     lat: 75.5674,
  //     lon: 25.5165,
  //   },
  // },
  // {
  //   name: "RRS Ernest Shackleton",
  //   url: "https://www.bas.ac.uk/data/our-data/images/webcams/rrs-ernest-shackleton-webcam/",
  //   element: '.entry-content img[width="640"]',
  //   location: {
  //     lat: 11111,
  //     lon: 11111,
  //   },
  // },
  // {
  //   name: "Aurora Australis icebreaker",
  //   url: "http://www.antarctica.gov.au/webcams/aurora",
  //   element: "figure.featured img",
  //   location: {
  //     lat: 11111,
  //     lon: 11111,
  //   },
  // },
  // {
  //   name: "McMurdo station, Observation Hill",
  //   url: "https://www.usap.gov/videoclipsandmaps/mcmwebcam.cfm?t=1",
  //   page_url: "https://www.usap.gov/videoclipsandmaps/",
  //   element: "#img-boreSite",
  //   location: {
  //     lat: 11111,
  //     lon: 11111,
  //   },
  // },
];
