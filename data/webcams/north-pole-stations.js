/*
Some sites don't use full URL for the img src attribute and need page_url to be used as a prefix.
*/

export default [
  {
    name: "Point Hope, Alaska, USA (West Webcam)",
    url: "https://weathercams.faa.gov/map/-167.68082,68.02561,-164.1542,68.66709/airport/PHO/details/camera/10650/full",
    element: "img.four-thirds-img",
    description:
      "A webcam overseeing a beach with an ocean view, with a few small buildings and utility poles.",
  },
  {
    name: "Wales, Alaska, USA (West Webcam)",
    url: "https://weathercams.faa.gov/map/-168.97638,65.26121,-165.44976,65.97883/airport/IWK/details/camera/10912/full",
    element: "img.four-thirds-img",
    description: "A webcam overseeing a beach with an ocean view.",
  },
  {
    name: "Native Village of Inalik, Little Diomede Island, Alaska, USA",
    image_url: "http://images.opentopia.com/cams/12001/big.jpg",
    url: "http://www.opentopia.com/webcam/12001",
    description:
      "A low resolution image captured by a webcam overseeing a small peninsula with a few buildings at the front of the view.",
  },
  // {
  //   name: "Nome, Alaska, USA",
  //   image_url: "https://nomecoc.com/nomecoc.com/Nomecam1/webcam.jpg",
  //   url: "https://www.visitnomealaska.com/nome-cam",
  //   description: "An ocean view with a few small buildings.",
  // },
  {
    name: "Utqiaġvik (Barrow) Sea Ice Webcam",
    image_url:
      "https://seaice.alaska.edu/Staging/Utq_seaicecam/Utq_seaicecam_current.jpg",
    url: "https://seaice.alaska.edu/gi/observatories/barrow_webcam/",
    description:
      "A view from a webcam overseeing a beach with a few small houses.",
  },
];
