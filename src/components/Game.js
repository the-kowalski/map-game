import distance from "@turf/distance";
import { useEffect, useReducer, useState } from "react";

import Map from "./Map";
import styles from "./Game.module.css";
import cities from "../data/cities.json";

const ALL_CITIES = JSON.parse(JSON.stringify(cities));

const initialGameState = {
  phase: "guessing",
  score: 1500,
  numOfGuessedCities: 0,
  currentCity: ALL_CITIES.cities[0],
  currentCityDifference: 0,
  userCoordinates: null,
  finished: false,
};

const gameStateReducer = (state, action) => {
  switch (action.type) {
    case "newGame":
      return initialGameState;
    case "nextRound":
      return {
        ...state,
        phase: "guessing",
        currentCity: action.payload.city,
        currentCityDifference: 0,
        userCoordinates: null,
      };
    case "checkedSolution":
      let newScore = state.score - action.payload.difference;
      const isCorrect = action.payload.difference <= 50 ? true : false;
      return {
        ...state,
        phase: "displayResult",
        score: newScore < 0 ? 0 : newScore,
        numOfGuessedCities: isCorrect
          ? state.numOfGuessedCities + 1
          : state.numOfGuessedCities,
        currentCityDifference: action.payload.difference,
        finished: newScore <= 0 ? true : false,
      };
    case "placedUserMarker":
      return {
        ...state,
        userCoordinates: { lng: action.payload.lng, lat: action.payload.lat },
      };
    default:
      console.log("Error");
  }
};

const Game = () => {
  const [cities, setCities] = useState(ALL_CITIES.cities);
  const [gameState, dispatchGameState] = useReducer(
    gameStateReducer,
    initialGameState
  );

  useEffect(() => {
    setCities(ALL_CITIES.cities);
  }, []);

  const checkSolutionHandler = () => {
    const difference = Math.round(
      distance(
        [gameState.userCoordinates.lng, gameState.userCoordinates.lat],
        [gameState.currentCity.lng, gameState.currentCity.lat],
        { units: "kilometers" }
      )
    );
    dispatchGameState({ type: "checkedSolution", payload: { difference } });
  };

  const nextRoundHandler = () => {
    const index = Math.floor(Math.random() * cities.length);
    const city = cities[index];
    dispatchGameState({ type: "nextRound", payload: { city } });
  };

  const newGameHandler = () => {
    dispatchGameState({ type: "newGame" });
  };

  return (
    <section>
      <Map
        gamePhase={gameState.phase}
        currentCity={gameState.currentCity}
        setUserCoordinates={(lng, lat) =>
          dispatchGameState({ type: "placedUserMarker", payload: { lng, lat } })
        }
      />
      <div className={styles.gameControls}>
        <div>
          <p>{`${gameState.numOfGuessedCities} ${
            gameState.numOfGuessedCities === 1 ? "city" : "cities"
          } placed correctly`}</p>
          <p>{`${gameState.score}km left`}</p>
          <hr />
          <p>{`Select the location of ${gameState.currentCity.name}!`}</p>
        </div>
        {gameState.phase === "guessing" && gameState.userCoordinates !== null && (
          <div>
            <button className="button" onClick={checkSolutionHandler}>
              Check!
            </button>
          </div>
        )}
        {gameState.phase === "displayResult" && (
          <div>
            {gameState.currentCityDifference <= 50 ? (
              <h4 style={{ color: "green" }}>Correct!</h4>
            ) : (
              <h4 style={{ color: "red" }}>Failed!</h4>
            )}
            <p>{`Distance: ${gameState.currentCityDifference}km`}</p>
            {!gameState.finished && (
              <button className="button" onClick={nextRoundHandler}>
                Next!
              </button>
            )}
          </div>
        )}
      </div>
      {gameState.finished && (
        <div className={styles.finishBanner}>
          <h2>{`You guessed ${gameState.numOfGuessedCities} ${
            gameState.numOfGuessedCities === 1 ? "city" : "cities"
          } correctly!`}</h2>
          <button className="button" onClick={newGameHandler}>
            New Game
          </button>
        </div>
      )}
    </section>
  );
};

export default Game;
