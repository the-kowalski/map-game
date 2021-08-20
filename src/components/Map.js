import mapboxgl from "mapbox-gl";
import React, { useRef, useEffect, useState, useCallback } from "react";
import styles from "./OpenMap.module.css";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken =
  "pk.eyJ1Ijoia293YWxza2lkZXY3IiwiYSI6ImNrc2htdzBzNTAxcXQyb25jdmt2OTEwbDYifQ.Y7w2cwT7wBZWB17prVvSWA";

let markers = {
  userMarker: null,
  solutionMarker: null,
};

const Map = ({ gamePhase, currentCity, setUserCoordinates }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(15);
  const [lat, setLat] = useState(55);
  const [zoom, setZoom] = useState(3);

  const placeUserMarker = (userLng, userLat) => {
    if (gamePhase === "displayResult") return;
    if (markers.userMarker !== null) {
      markers.userMarker.remove();
      markers.userMarker = null;
    }
    const marker = new mapboxgl.Marker({
      color: "#eb9534",
    })
      .setLngLat([userLng, userLat])
      .addTo(map.current);
    markers.userMarker = marker;
    setUserCoordinates(userLng, userLat);
  };

  const drawDistanceLine = (map, userMarkerLngLat, solutionMarkerLngLat) => {
    map.current.addSource("route", {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [
            [userMarkerLngLat.lng, userMarkerLngLat.lat],
            [solutionMarkerLngLat.lng, solutionMarkerLngLat.lat],
          ],
        },
      },
    });
    map.current.addLayer({
      id: "route",
      type: "line",
      source: "route",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#888",
        "line-width": 8,
      },
    });
  };

  const displaySolution = useCallback(() => {
    //Add Solution Marker
    const solutionMarker = new mapboxgl.Marker({
      color: "#5ceb34",
    })
      .setLngLat([currentCity.lng, currentCity.lat])
      .addTo(map.current);
    markers.solutionMarker = solutionMarker;
    //Add Distance Line
    const userMarkerLngLat = markers.userMarker.getLngLat();
    const solutionMarkerLngLat = markers.solutionMarker.getLngLat();
    drawDistanceLine(map, userMarkerLngLat, solutionMarkerLngLat);
  }, [currentCity.lng, currentCity.lat]);

  const removeSolution = useCallback(() => {
    //remove markers
    markers.userMarker.remove();
    markers.userMarker = null;
    markers.solutionMarker.remove();
    markers.solutionMarker = null;
    //remove line
    map.current.removeLayer("route");
    map.current.removeSource("route");
    //clearSolutionMarker
    markers.solutionMarker = null;
  }, []);

  useEffect(() => {
    if (markers.userMarker === null) return;
    if (gamePhase === "guessing") {
      removeSolution();
    }
    if (gamePhase === "displayResult") {
      displaySolution();
    }
  }, [gamePhase, displaySolution, removeSolution]);

  useEffect(() => {
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/kowalskidev7/ckshnj6z698is17pjzhlguevd",
      center: [lng, lat],
      zoom: zoom,
    });
    map.current.on("click", (e) => {
      placeUserMarker(e.lngLat.lng, e.lngLat.lat);
    });
  });

  useEffect(() => {
    if (!map.current) return;
    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
  });

  return (
    <div>
      <div ref={mapContainer} className={styles.mapContainer} />
    </div>
  );
};

export default Map;
