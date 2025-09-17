/*
Some sites don't use full URL for the img src attribute and need page_url to be used as a prefix.
*/
export default [
  {
    name: "Neumayer Station III",
    description: "Antarctic research station Neumayer Station III, a long white building with red and blue trim, on the top and bottom, respectively, is elevated on stilts above a snowy landscape.",
    image_url: "https://www.awi.de/NM_WebCam/neumayerW.0650.jpg",
    url: "https://www.awi.de/en/expedition/stations/neumayer-station-iii.html",
  },
  {
    name: "Troll research station",
    description: "A series of research station buildings with the polar landscape in the back.",
    image_url: "https://trollcam.npolar.no/TrollWebCam1HD.jpg",
    url: "https://www.npolar.no/en/troll/webcam/",
  },
  {
    name: "Troll research station",
    description: "A view of Antarctica's landscape from Troll Station, with rocky hills in the foreground and mountains in the distance.",
    image_url: "https://trollcam.npolar.no/TrollWebCam3HD.jpg",
    url: "https://www.npolar.no/en/troll/webcam/",
  },
  {
    name: "Amundsen-Scott South Pole station",
    // description: "TODO",
    url: "https://www.usap.gov/videoclipsandmaps/spWebCam.cfm",
    page_url: "https://www.usap.gov/videoclipsandmaps/",
    element: "#img-aro",
  },
  {
    name: "Palmer station",
    // description: "TODO",
    url: "https://www.usap.gov/videoclipsandmaps/palwebcam.cfm?t=0",
    page_url: "https://www.usap.gov/videoclipsandmaps/",
    element: "#img-palmer",
  },
  {
    name: "Casey station",
    // description: "TODO",
    url: "https://www.antarctica.gov.au/antarctic-operations/webcams/casey/",
    element: "figure.featured img",
  },
  {
    name: "Davis station",
    // description: "TODO",
    url: "https://www.antarctica.gov.au/antarctic-operations/webcams/davis/",
    element: "figure.featured img",
  },
  {
    name: "Macquarie Island station",
    // description: "TODO",
    url: "https://www.antarctica.gov.au/antarctic-operations/webcams/macquarie-island/",
    element: "figure.featured img",
  },
  {
    name: "Mawson station",
    // description: "TODO",
    url: "https://www.antarctica.gov.au/antarctic-operations/webcams/mawson/",
    element: "figure.featured img",
  },
  {
    name: "Bird Island research station",
    // description: "TODO",
    url: "https://www.bas.ac.uk/data/our-data/images/webcams/bird-island-webcam/",
    element: '.entry-content img[width="640"]',
  },
  {
    name: "King Edward Point",
    // description: "TODO",
    url: "https://www.bas.ac.uk/data/our-data/images/webcams/king-edward-point-webcam/",
    element: '.entry-content img[width="640"]',
  },
  {
    name: "King Edward Point webcam",
    // description: "TODO",
    url: "https://www.bas.ac.uk/data/our-data/images/webcams/king-edward-point-webcam/",
    element: '.entry-content img[width="640"]',
  },
  {
    name: "Rothera webcam",
    // description: "TODO",
    url: "https://www.bas.ac.uk/data/our-data/images/webcams/rothera-webcam/",
    element: '.entry-content img[width="640"]',
  },
  // posts old images
  //   {
  //     name: "RRS James Clark Ross",
  //     description: "TODO",
  //     url: "https://www.bas.ac.uk/data/our-data/images/webcams/rrs-james-clark-ross-webcam/",
  //     element: '.entry-content img[width="640"]',
  //   },
  // moved to North Pole
  // {
  //   name: "RRS Sir David Attenborough Webcam",
  //   description: "TODO",
  //   url: "https://www.bas.ac.uk/data/our-data/images/webcams/rrs-sir-david-attenborough-webcam/",
  //   element: '.entry-content img[width="1920"]',
  // },
  // {
  //   name: "Halley VI webcam",
  //   description: "TODO",
  //   url: "https://www.bas.ac.uk/data/our-data/images/webcams/halley-vi-webcam/",
  //   element: '.entry-content img[width="1920"]',
  //   location: {
  //     lat: 75.5674,
  //     lon: 25.5165,
  //   },
  // },
  // {
  //   name: "RRS Ernest Shackleton",
  //   description: "TODO",
  //   url: "https://www.bas.ac.uk/data/our-data/images/webcams/rrs-ernest-shackleton-webcam/",
  //   element: '.entry-content img[width="640"]',
  //   location: {
  //     lat: 11111,
  //     lon: 11111,
  //   },
  // },
  // {
  //   name: "Aurora Australis icebreaker",
  //   description: "TODO",
  //   url: "http://www.antarctica.gov.au/webcams/aurora",
  //   element: "figure.featured img",
  //   location: {
  //     lat: 11111,
  //     lon: 11111,
  //   },
  // },
  // {
  //   name: "McMurdo station, Observation Hill",
  //   description: "TODO",
  //   url: "https://www.usap.gov/videoclipsandmaps/mcmwebcam.cfm?t=1",
  //   page_url: "https://www.usap.gov/videoclipsandmaps/",
  //   element: "#img-boreSite",
  //   location: {
  //     lat: 11111,
  //     lon: 11111,
  //   },
  // },
];
