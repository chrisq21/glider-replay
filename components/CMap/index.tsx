import Head from "next/head";
import Script from "next/script";
import styles from "./cmap.module.css";
import Chart from "chart.js/auto";

function CMap({ igcData }) {
  /* Gather IGC data */
  const { recordTime, latLong, pressureAltitude } = igcData;
  const startTime = new Date(recordTime[0]).getTime();
  const endTime = new Date(recordTime[recordTime.length - 1]).getTime();
  const totalTime = Math.abs(endTime - startTime);
  const totalSeconds = totalTime / 1000;

  const coordinates = [];
  for (let i = 0; i < pressureAltitude.length - 1; i++) {
    coordinates.push([latLong[i][1], latLong[i][0], pressureAltitude[i]]);
  }

  let viewer;
  let airplaneEntity;
  let start;
  let stop;

  const initChart = () => {
    const data = [];

    for (let i = 0; i < recordTime.length - 1; i++) {
      data.push({
        time: recordTime[i],
        altitude: pressureAltitude[i],
      });
    }

    const canvasEl = document.getElementById("chart");

    const chart = new Chart(canvasEl, {
      responsive: true,
      type: "line",
      data: {
        labels: data.map((row) => row.time),
        datasets: [
          {
            label: "Altitude",
            data: data.map((row) => row.altitude),
            borderWidth: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: false,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: false,
          },
        },
        scales: {
          x: { display: false },
        },
        events: ["click"],
      },
    });

    /* chart listener */
    document.getElementById("chart").onclick = function (evt) {
      const points = chart.getElementsAtEventForMode(
        evt,
        "nearest",
        { intersect: false },
        true
      );

      if (points.length) {
        const firstPoint = points[0];
        const label = chart.data.labels[firstPoint.index];
        const value =
          chart.data.datasets[firstPoint.datasetIndex].data[firstPoint.index];
        viewer.clock.currentTime = Cesium.JulianDate.fromIso8601(label);
      }
    };

    // chart.canvas.parentNode.style.height = `${window.innerHeight}px`;
    chart.canvas.style.width = `${window.innerWidth}px`;
  };

  const initMap = async () => {
    // TODO null check and catch errors
    Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_ACCESS_TOKEN;

    viewer = new Cesium.Viewer("cesiumContainer", {
      terrainProvider: Cesium.createWorldTerrain(),
    });

    /* Get terrain height of starting position */
    const pointOfInterest = Cesium.Cartographic.fromDegrees(
      coordinates[0][0],
      coordinates[0][1]
    );
    const initialGroundHeight = await getGroundHeight(viewer, pointOfInterest);
    const flightInitialHeight = coordinates[0][2];
    const groundDiff = flightInitialHeight - initialGroundHeight;

    const flightCoordinates = coordinates.map((coordinate) => {
      let height = coordinate[2] - groundDiff;
      const halfGliderHeight = 1; // TODO add half the height of the model
      // don't let the glider go below the ground
      if (height <= initialGroundHeight + halfGliderHeight) {
        height = initialGroundHeight + halfGliderHeight;
      }
      return { longitude: coordinate[0], latitude: coordinate[1], height };
    });

    animate(viewer, flightCoordinates, totalSeconds, recordTime);
  };

  const animate = (viewer, flightCoordinates, totalSeconds, recordTime) => {
    /* Clock setup */

    start = Cesium.JulianDate.fromIso8601(recordTime[0]);
    stop = Cesium.JulianDate.addSeconds(
      start,
      totalSeconds,
      new Cesium.JulianDate()
    );

    viewer.clock.clockRange = Cesium.Clock.LOOPED;

    viewer.clock.startTime = start.clone();
    viewer.clock.stopTime = stop.clone();
    viewer.clock.currentTime = start.clone();
    viewer.timeline.zoomTo(start, stop);
    // Speed up the playback speed 3x.
    viewer.clock.multiplier = 3;
    // Start playing the scene.
    viewer.clock.shouldAnimate = true;
    const positionProperty = new Cesium.SampledPositionProperty();

    for (let i = 0; i < flightCoordinates.length; i++) {
      const dataPoint = flightCoordinates[i];
      // recordTime is a parallel array to flightCoordinates
      const time = igcData.recordTime[i];
      const position = Cesium.Cartesian3.fromDegrees(
        dataPoint.longitude,
        dataPoint.latitude,
        dataPoint.height
      );
      positionProperty.addSample(time, position);
    }

    async function loadModel() {
      // 1412577 sailplane id
      // Load the glTF model from Cesium ion.
      const airplaneUri = await Cesium.IonResource.fromAssetId(1412577);
      airplaneEntity = viewer.entities.add({
        availability: new Cesium.TimeIntervalCollection([
          new Cesium.TimeInterval({ start: start, stop: stop }),
        ]),
        position: positionProperty,
        // Attach the 3D model instead of the green point.
        model: { uri: airplaneUri },
        // Automatically compute the orientation from the position.
        orientation: new Cesium.VelocityOrientationProperty(positionProperty),
        path: new Cesium.PathGraphics({
          width: 4,
          material: new Cesium.ColorMaterialProperty(
            Cesium.Color.fromBytes(255, 90, 95)
          ),
        }),
      });

      viewer.trackedEntity = airplaneEntity;
    }

    loadModel();
  };

  const getGroundHeight = async (viewer, position) => {
    const samples = await Cesium.sampleTerrainMostDetailed(
      viewer.terrainProvider,
      [position]
    );
    return samples[0].height;
  };

  const init = () => {
    initChart();
    initMap();
  };

  return (
    <div className={styles.container}>
      <Head>
        <link
          href="https://cesium.com/downloads/cesiumjs/releases/1.99/Build/Cesium/Widgets/widgets.css"
          rel="stylesheet"
        />
      </Head>
      <Script
        onReady={init}
        src="https://cesium.com/downloads/cesiumjs/releases/1.99/Build/Cesium/Cesium.js"
      />
      <div id="cesiumContainer" className={styles.mapContainer}></div>
      <div className={styles.uiContainer}>
        <canvas id="chart" className={styles.chart}></canvas>
      </div>
    </div>
  );
}

export default CMap;
