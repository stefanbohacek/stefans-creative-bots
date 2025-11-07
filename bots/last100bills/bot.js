import fetch from "node-fetch";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import mastodonClient from "./../../modules/mastodon/index.js";
import randomFromArray from "./../../modules/random-from-array.js";

const botScript = async () => {
  const mastodon = new mastodonClient({
    access_token: process.env.LAST100BILLS_MASTODON_ACCESS_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  console.log("making a chart of the last 100 bills...");

  const datasetUrl = `https://api.congress.gov/v3/bill?api_key=${process.env.CONGRESS_GOV_API}&limit=100`;
  const datasetName = "Last 100 bills in the US government";

  const response = await fetch(datasetUrl);
  const data = await response.json();

  const categorizeStatus = (actionText) => {
    const text = actionText.toLowerCase();

    if (
      text.includes("became public law") ||
      text.includes("signed by president")
    ) {
      return "enacted_signed";
    }

    if (text.includes("passed senate") && text.includes("passed house")) {
      return "passed_bill";
    }

    if (text.includes("passed senate")) {
      return "pass_over_senate";
    }

    if (text.includes("passed house")) {
      return "pass_over_house";
    }

    if (
      text.includes("agreed to") &&
      (text.includes("resolution") ||
        text.includes("concurrent") ||
        text.includes("without amendment"))
    ) {
      if (text.includes("concurrent")) {
        return "passed_concurrentres";
      }
      return "passed_simpleres";
    }

    if (
      text.includes("reported") ||
      (text.includes("placed on") && text.includes("calendar"))
    ) {
      return "reported";
    }

    if (text.includes("referred to") || text.includes("read twice")) {
      return "introduced";
    }

    if (text.includes("held at") || text.includes("committee")) {
      return "introduced";
    }

    return "introduced";
  };

  if (data && data.bills) {
    let introduced_count = 0;
    let pass_over_house_count = 0;
    let pass_over_senate_count = 0;
    let passed_bill_count = 0;
    let passed_concurrentres_count = 0;
    let passed_simpleres_count = 0;
    let reported_count = 0;
    let enacted_signed_count = 0;

    data.bills.forEach((bill) => {
      const status = categorizeStatus(bill.latestAction.text);

      if (status === "introduced") {
        introduced_count++;
      } else if (status === "pass_over_house") {
        pass_over_house_count++;
      } else if (status === "pass_over_senate") {
        pass_over_senate_count++;
      } else if (status === "passed_bill") {
        passed_bill_count++;
      } else if (status === "passed_concurrentres") {
        passed_concurrentres_count++;
      } else if (status === "passed_simpleres") {
        passed_simpleres_count++;
      } else if (status === "reported") {
        reported_count++;
      } else if (status === "enacted_signed") {
        enacted_signed_count++;
      }
    });

    const dataset = [
      ["Introduced", introduced_count],
      ["Passed House", pass_over_house_count],
      ["Passed Senate", pass_over_senate_count],
      ["Passed Both Chambers", passed_bill_count],
      ["Concurrent Resolution", passed_concurrentres_count],
      ["Simple Resolution", passed_simpleres_count],
      ["Ordered Reported", reported_count],
      ["Enacted", enacted_signed_count],
    ];

    const filteredDataset = dataset.filter((item) => item[1] > 0);

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
        labels: filteredDataset.map((item) => item[0]),
        datasets: [
          {
            label: datasetName,
            data: filteredDataset.map((item) => item[1]),
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

    const alt = `${introduced_count} bills have been introduced, ${pass_over_house_count} bills passed the House, ${pass_over_senate_count} bills passed the Senate, ${passed_bill_count} bills passed both chambers, ${
      passed_concurrentres_count + passed_simpleres_count
    } resolutions have been agreed to, ${reported_count} bills are being considered, and ${enacted_signed_count} bills have been enacted.`;

    mastodon.postImage({
      status: text,
      image: image,
      alt_text: alt,
    });
  }
};

export default botScript;
