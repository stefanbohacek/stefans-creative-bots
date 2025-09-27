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
    description: "A view of the Amundsen-Scott South Pole Station, formed by long rectangular buildings next to each other. A line of small red flags leads up to the station. Occasionally at night, a thin green light of the TELMA lidar can be seen shooting upwards to the sky.",
    url: "https://www.usap.gov/videoclipsandmaps/spWebCam.cfm",
    page_url: "https://www.usap.gov/videoclipsandmaps/",
    element: "#img-aro",
  },
  {
    name: "Palmer station",
    description: "A view of the Palmer station, a group of colorful buildings and structures scattered near water. Rocky islands are visible in the distance.",
    url: "https://www.usap.gov/videoclipsandmaps/palwebcam.cfm?t=0",
    page_url: "https://www.usap.gov/videoclipsandmaps/",
    element: "#img-palmer",
  },
  {
    name: "Casey station",
    description: "A view of the Casey research station with the main building in the focus and smaller structures and equipment scattered around. Occasionally features Happy Birthday signs.",
    url: "https://www.antarctica.gov.au/antarctic-operations/webcams/casey/",
    element: "figure.featured img",
  },
  {
    name: "Davis station",
    description: "A view of the Davis research station with research buildings, equipment, and vehicles scattered around, and mountains visible in the background. Occasionally features Happy Birthday signs.",
    url: "https://www.antarctica.gov.au/antarctic-operations/webcams/davis/",
    element: "figure.featured img",
  },
  {
    name: "Macquarie Island station",
    description: "A view of the Macquarie Island research station with the ocean and mountains prominently in the view.",
    url: "https://www.antarctica.gov.au/antarctic-operations/webcams/macquarie-island/",
    element: "figure.featured img",
  },
  {
    name: "Mawson station",
    description: "A view of the Mawson research station, a few small buildings and equipment scattered across rocky terrain.",
    url: "https://www.antarctica.gov.au/antarctic-operations/webcams/mawson/",
    element: "figure.featured img",
  },
  {
    name: "Bird Island research station",
    description: "A view webcam showing a rocky shoreline and mountains in the background.",
    url: "https://www.bas.ac.uk/data/our-data/images/webcams/bird-island-webcam/",
    element: '.entry-content img[width="640"]',
  },
  {
    name: "Halley VI webcam",
    // description: "TODO",
    url: "https://www.bas.ac.uk/data/our-data/images/webcams/halley-vi-webcam/",
    // element: '.entry-content img[width="1920"]',
    element: '.entry-content img',
    location: {
      lat: 75.5674,
      lon: 25.5165,
    },
  },
  // {
  //   name: "Rothera webcam",
  //   description: "TODO",
  //   url: "https://www.bas.ac.uk/data/our-data/images/webcams/rothera-webcam/",
  //   element: '.entry-content img[width="640"]',
  // },
  // {
  //   name: "King Edward Point",
  // description: "TODO",
  //   url: "https://www.bas.ac.uk/data/our-data/images/webcams/king-edward-point-webcam/",
  //   element: '.entry-content img[width="640"]',
  // },
  // posts old images
  //   {
  //     name: "RRS James Clark Ross",
  //     description: "TODO",
  //     url: "https://www.bas.ac.uk/data/our-data/images/webcams/rrs-james-clark-ross-webcam/",
  //     element: '.entry-content img[width="640"]',
  //   },
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
