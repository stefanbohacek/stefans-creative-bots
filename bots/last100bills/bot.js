/* This bot uses the chart.js library (chartjs.org) via the chartjs-node node package (npmjs.com/package/chartjs-node). */
/* Static version: https://stefans-creative-bots.glitch.me/last100bills.html */
import fetch from 'node-fetch';

import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import mastodonClient from "./../../modules/mastodon/index.js";
import randomFromArray from "./../../modules/random-from-array.js";

const botScript = async () => {
  const mastodon = new mastodonClient({
    access_token: process.env.LAST100BILLS_MASTODON_ACCESS_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  console.log("making a chart...");

  const datasetUrl =
    "https://www.govtrack.us/api/v2/bill?order_by=-current_status_date";
  const datasetName = "Last 100 bills in the US government";
  const datasetLabels = ["group", "value"];

  const response = await fetch(datasetUrl);
  const data = await response.json();

  if (data) {
    let introduced_count = 0;
    let pass_over_house_count = 0;
    let passed_bill_count = 0;
    let passed_concurrentres_count = 0;
    let passed_simpleres_count = 0;
    let reported_count = 0;
    let enacted_signed_count = 0;

    data.objects.forEach((bill) => {
      if (bill.current_status === "introduced") {
        introduced_count++;
      } else if (bill.current_status === "pass_over_house") {
        pass_over_house_count++;
      } else if (bill.current_status === "passed_bill") {
        passed_bill_count++;
      } else if (bill.current_status === "passed_concurrentres") {
        passed_concurrentres_count++;
      } else if (bill.current_status === "passed_simpleres") {
        passed_simpleres_count++;
      } else if (bill.current_status === "reported") {
        reported_count++;
      } else if (bill.current_status === "enacted_signed") {
        enacted_signed_count++;
      }
    });

    const dataset = [
      ["Introduced", introduced_count],
      ["Passed House", pass_over_house_count],
      ["Passed House & Senate", passed_bill_count],
      ["Concurrent Resolution", passed_concurrentres_count],
      ["Simple Resolution", passed_simpleres_count],
      ["Ordered Reported", reported_count],
      ["Enacted", enacted_signed_count],
    ];

    /* Set up the chart.js options, see chartjs.org for documentation. */

    const chartJsOptions = {
      plugins: {
        beforeDraw: (chart, easing) => {
          var ctx = chart.chart.ctx;
          ctx.save();
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, chart.width, chart.height);
          ctx.restore();
        },
      },
      type: "bar",
      data: {
        labels: dataset.map((item) => {
          return item[0];
        }),
        datasets: [
          {
            label: datasetName,
            data: dataset.map((item) => {
              return item[1];
            }),
            backgroundColor: "rgb(255, 99, 132)",
            borderColor: "rgb(255, 99, 132)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },
    };

    let chartJSNodeCanvas = new ChartJSNodeCanvas({
      width: 600,
      height: 600,
      backgroundColour: "#ffffff",
    });

    const buffer = await chartJSNodeCanvas.renderToBuffer(chartJsOptions);

    const text =
      randomFromArray([
        "The last 100 bills in the US #government, analyzed!",
        "Looking at the last 100 bills in the US #government.",
        "The last 100 bills in one chart!",
        "Analyzing the last 100 bills in the US #government.",
        "Breaking down the last 100 bills in the US #government.",
      ]) + " #dataviz #civictech";

    const image = buffer.toString("base64");

    const alt = `${introduced_count} bills have been introduced, ${pass_over_house_count} bills passed the House,  ${passed_bill_count} bills passed the House & the Senate, ${
      passed_concurrentres_count + passed_simpleres_count
    } bills have been agreed to, ${reported_count} bills are being considered, and ${enacted_signed_count} bills have been  enacted.`;

    // twitter.postImage({
    //   status: text,
    //   image: image,
    //   alt_text: alt
    // });

    mastodon.postImage({
      status: text,
      image: image,
      alt_text: alt,
    });
  }
};

export default botScript;
