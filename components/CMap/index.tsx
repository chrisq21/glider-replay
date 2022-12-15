import Head from 'next/head'
import Script from 'next/script'
import styles from './cmap.module.css'
import * as d3 from 'd3'

function CMap({igcData}) {
  /* Gather IGC data */
  const {recordTime, latLong, pressureAltitude} = igcData
  const startTime = new Date(recordTime[0]).getTime()
  const endTime = new Date(recordTime[recordTime.length - 1]).getTime()
  const totalTime = Math.abs(endTime - startTime)
  const totalSeconds = totalTime / 1000

  const coordinates = []
  for (let i = 0; i < pressureAltitude.length - 1; i++) {
    coordinates.push([latLong[i][1], latLong[i][0], pressureAltitude[i]])
  }

  let viewer
  let gliderEntity
  let start
  let stop
  let x
  let initialGroundHeight = 0

  const initChart = () => {
    const data = []

    for (let i = 0; i < recordTime.length - 1; i++) {
      // TODO check into the formatting (especially '.000Z')
      data.push({
        time: d3.utcParse('%Y-%m-%dT%H:%M:%S')(recordTime[i].split('.')[0]),
        altitude: pressureAltitude[i],
      })
    }

    const chartEl = document.querySelector('#chart')
    const chartWidth = chartEl.offsetWidth
    const chartHeight = chartEl.offsetHeight

    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 30, bottom: 30, left: 60},
      width = chartWidth - margin.left - margin.right,
      height = chartHeight - margin.top - margin.bottom

    // append the svg object to the body of the page
    var svg = d3
      .select('#chart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    // Add X axis --> it is a date format
    x = d3
      .scaleTime()
      .domain(
        d3.extent(data, function (d) {
          return d.time
        })
      )
      .range([0, width])
    svg
      .append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x))

    // Add Y axis
    var y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(data, function (d) {
          return +d.altitude
        }),
      ])
      .range([height, 0])
    svg.append('g').call(d3.axisLeft(y))

    // Add the line
    svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .attr(
        'd',
        d3
          .line()
          .x(function (d) {
            return x(d.time)
          })
          .y(function (d) {
            return y(d.altitude)
          })
      )

    // add vertical line
    const trackTime = d3.utcParse('%Y-%m-%dT%H:%M:%S.%LZ')(recordTime[0])
    svg
      .append('line')
      .attr('x1', x(trackTime)) //<<== change your code here
      .attr('y1', 0)
      .attr('x2', x(trackTime)) //<<== and here
      .attr('id', 'track-line')
      .attr('y2', height - margin.top - margin.bottom)
      .style('stroke-width', 2)
      .style('stroke', 'red')
      .style('fill', 'none')

    // add hover line
    const hoverTrackTime = d3.utcParse('%Y-%m-%dT%H:%M:%S.%LZ')(recordTime[0])
    const hoverLine = svg
      .append('line')
      .attr('x1', x(hoverTrackTime)) //<<== change your code here
      .attr('y1', 0)
      .attr('x2', x(hoverTrackTime)) //<<== and here
      .attr('id', 'track-line')
      .attr('y2', height - margin.top - margin.bottom)
      .style('stroke-width', 2)
      .style('stroke', 'gray')
      .style('opacity', '0')
      .style('fill', 'none')

    const handleTrackClick = (e) => {
      const mousePosition = d3.pointer(e)
      const clickX = mousePosition[0]
      if (!clickX) return

      const timeValue = x.invert(clickX)
      const newTime = Cesium.JulianDate.fromDate(new Date(timeValue))
      viewer.clock.currentTime = newTime
    }

    const handleTrackHover = (e) => {
      const mousePosition = d3.pointer(e)
      const clickX = mousePosition[0]
      if (!clickX) return

      const timeValue = x.invert(clickX)
      const newTime = Cesium.JulianDate.fromDate(timeValue)
      const testDate = Cesium.JulianDate.toIso8601(newTime)
      const parsedTime = d3.utcParse('%Y-%m-%dT%H:%M:%S')(testDate.split('.')[0])
      if (x) {
        hoverLine.style('opacity', '0.5')
        hoverLine.attr('x1', x(parsedTime))
        hoverLine.attr('x2', x(parsedTime))
      }
    }

    const handleTrackHoverExit = () => {
      hoverLine.style('opacity', '0')
    }

    svg
      .append('rect')
      .attr('class', 'listening-rect')
      .attr('width', width)
      .attr('height', height)
      .attr('opacity', '0')
      .on('click', handleTrackClick)
      .on('mousemove', handleTrackHover)
      .on('mouseout', handleTrackHoverExit)
  }

  const initMap = async () => {
    // TODO null check and catch errors
    Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_ACCESS_TOKEN

    viewer = new Cesium.Viewer('cesiumContainer', {
      terrainProvider: Cesium.createWorldTerrain(),
    })

    /* Get terrain height of starting position */
    const pointOfInterest = Cesium.Cartographic.fromDegrees(coordinates[0][0], coordinates[0][1])
    initialGroundHeight = await getGroundHeight(viewer, pointOfInterest)
    const flightInitialHeight = coordinates[0][2]
    const groundDiff = flightInitialHeight - initialGroundHeight

    const flightCoordinates = coordinates.map((coordinate) => {
      let height = coordinate[2] - groundDiff
      const halfGliderHeight = 1 // TODO add half the height of the model
      // don't let the glider go below the ground
      if (height <= initialGroundHeight + halfGliderHeight) {
        height = initialGroundHeight + halfGliderHeight
      }
      return {longitude: coordinate[0], latitude: coordinate[1], height}
    })

    animate(viewer, flightCoordinates, totalSeconds, recordTime)
  }

  const animate = (viewer, flightCoordinates, totalSeconds, recordTime) => {
    /* Clock setup */

    start = Cesium.JulianDate.fromIso8601(recordTime[0])
    stop = Cesium.JulianDate.addSeconds(start, totalSeconds, new Cesium.JulianDate())

    viewer.clock.clockRange = Cesium.Clock.LOOPED

    viewer.clock.startTime = start.clone()
    viewer.clock.stopTime = stop.clone()
    viewer.clock.currentTime = start.clone()
    viewer.timeline.zoomTo(start, stop)
    // Speed up the playback speed 3x.
    viewer.clock.multiplier = 3
    const timelineTrackEl = document.querySelector('#track-line')
    viewer.clock.onTick.addEventListener(function (clock) {
      // Update timeline track
      const newTime = Cesium.JulianDate.toIso8601(clock.currentTime)
      const parsedTime = d3.utcParse('%Y-%m-%dT%H:%M:%S')(newTime.split('.')[0])
      if (x) {
        timelineTrackEl.setAttribute('x1', x(parsedTime))
        timelineTrackEl.setAttribute('x2', x(parsedTime))
      }
    })

    // Start playing the scene.
    viewer.clock.shouldAnimate = true
    const positionProperty = new Cesium.SampledPositionProperty()

    for (let i = 0; i < flightCoordinates.length; i++) {
      const dataPoint = flightCoordinates[i]
      // recordTime is a parallel array to flightCoordinates
      const time = igcData.recordTime[i]
      const position = Cesium.Cartesian3.fromDegrees(dataPoint.longitude, dataPoint.latitude, dataPoint.height)
      positionProperty.addSample(time, position)
    }

    function addGliderLine() {
      if (gliderEntity) {
        viewer.entities.add({
          id: 'glider-track-line',
          polyline: {
            positions: new Cesium.CallbackProperty(function (time) {
              if (!gliderEntity) return
              const position = gliderEntity.position.getValue(time)
              const degrees = Cesium.Cartographic.fromCartesian(position)
              return Cesium.Cartesian3.fromDegreesArrayHeights([
                Cesium.Math.toDegrees(degrees.longitude),
                Cesium.Math.toDegrees(degrees.latitude),
                0,
                Cesium.Math.toDegrees(degrees.longitude),
                Cesium.Math.toDegrees(degrees.latitude),
                degrees.height,
              ])
            }),
            width: 2,
            material: new Cesium.ColorMaterialProperty(Cesium.Color.fromBytes(255, 238, 128)),
          },
        })
      }
    }

    async function loadModel() {
      // 1412577 sailplane id
      // Load the glTF model from Cesium ion.
      const airplaneUri = await Cesium.IonResource.fromAssetId(1412577)
      gliderEntity = viewer.entities.add({
        id: 'glider',
        availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({start: start, stop: stop})]),
        position: positionProperty,
        // Attach the 3D model instead of the green point.
        model: {uri: airplaneUri},
        // Automatically compute the orientation from the position.
        orientation: new Cesium.VelocityOrientationProperty(positionProperty),
        path: new Cesium.PathGraphics({
          width: 4,
          material: new Cesium.ColorMaterialProperty(Cesium.Color.fromBytes(255, 90, 95)),
        }),
      })

      viewer.trackedEntity = gliderEntity

      addGliderLine()
    }

    loadModel()
  }

  const getGroundHeight = async (viewer, position) => {
    const samples = await Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, [position])
    return samples[0].height
  }

  const init = () => {
    initChart()
    initMap()
  }

  return (
    <div className={styles.container}>
      <Head>
        <link href="https://cesium.com/downloads/cesiumjs/releases/1.99/Build/Cesium/Widgets/widgets.css" rel="stylesheet" />
      </Head>
      <Script onReady={init} src="https://cesium.com/downloads/cesiumjs/releases/1.99/Build/Cesium/Cesium.js" />
      <div id="cesiumContainer" className={styles.mapContainer}></div>
      <div className={styles.uiContainer}>
        <div id="chart" className={styles.chart}></div>
      </div>
    </div>
  )
}

export default CMap
