import { useState } from "react";
// Imports the components I added
import StatusMessage from "./SearchStatus";
import PokemonResults from "./PokemonResults";
import "mvp.css";
import "./styles.css";

// API Dataset I used to fetch pokemon data
const API_URL = "https://graphql-pokeapi.graphcdn.app/";

// Added for pokemon object returned from the API cause i was getting error
type Pokemon = {
  id: number;
  name: string;
  sprites?: {
    front_default?: string;
  };
  types: {
    type: {
      name: string;
    };
  }[];
};

// Main component
export default function App() {
  // Variables to store search inputs
  const [pokemonName, setPokemonName] = useState("");
  const [pokemonType, setPokemonType] = useState("");
  const [pokedexNumber, setPokedexNumber] = useState("");
  const [orderBy, setOrderBy] = useState("name");
  const [status, setStatus] = useState("");
  const [results, setResults] = useState<Pokemon[]>([]);
  // Change state of search
  const [swapped, setSwapped] = useState(false);

  // Handling errors
  function handleErrors(response: Response) {
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response;
  }

  // Form submission
  function handleSubmit(event: { preventDefault: () => void }) {
    event.preventDefault();

    setStatus("Loading...");
    setResults([]);
    // If user doesnt input anything
    if (
      pokemonName.trim() === "" &&
      pokemonType.trim() === "" &&
      pokedexNumber.trim() === ""
    ) {
      setStatus("Please enter at least one search query.");
      return;
    }

    setSwapped(true);

    // Query provided by GraphQL for pokemon names
    const listQuery = `
      query pokemons($limit: Int, $offset: Int) {
        pokemons(limit: $limit, offset: $offset) {
          results {
            name
          }
        }
      }
    `;

    // Query provided by GraphQL for pokemon information
    const detailQuery = `
      query pokemon($name: String!) {
        pokemon(name: $name) {
          id
          name
          sprites {
            front_default
          }
          types {
            type {
              name
            }
          }
        }
      }
    `;

    // Retrieves list of pokemon names
    fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Limits to only gen 1 pokemon
      body: JSON.stringify({
        query: listQuery,
        variables: {
          limit: 151,
          offset: 0,
        },
      }),
    })
      .then(handleErrors)
      // API to JSON format
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        if (data.errors) {
          throw new Error(data.errors[0].message);
        }
        // Stores list of pokemon names
        const pokemonList = data.data.pokemons.results;
        // Fetch pokemon information
        return Promise.all(
          // Loop through pokemon names
          pokemonList.map((poke: { name: any }) =>
            fetch(API_URL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                query: detailQuery,
                variables: {
                  name: poke.name,
                },
              }),
            })
              .then(handleErrors)
              .then(function (response) {
                return response.json();
              })
              .then(function (detailData) {
                if (detailData.errors) {
                  throw new Error(detailData.errors[0].message);
                }

                return detailData.data.pokemon;
              })
          )
        );
      })
      .then(function (allPokemon: Pokemon[]) {
        let filteredResults = allPokemon;
        // Filter by pokemon name
        if (pokemonName.trim() !== "") {
          filteredResults = filteredResults.filter(function (pokemon) {
            return pokemon.name
              .toLowerCase()
              .includes(pokemonName.trim().toLowerCase());
          });
        }
        // Filter by pokemon type
        if (pokemonType.trim() !== "") {
          filteredResults = filteredResults.filter(function (pokemon) {
            return pokemon.types.some(function (t: { type: { name: string } }) {
              return (
                t.type.name.toLowerCase() === pokemonType.trim().toLowerCase()
              );
            });
          });
        }
        // Filter by pokedex number
        if (pokedexNumber.trim() !== "") {
          filteredResults = filteredResults.filter(function (pokemon) {
            return String(pokemon.id) === pokedexNumber.trim();
          });
        }
        // Sort results by name or pokedex number
        filteredResults.sort(function (a, b) {
          if (orderBy === "name") {
            return a.name.localeCompare(b.name);
          } else {
            return a.id - b.id;
          }
        });

        setResults(filteredResults);

        if (filteredResults.length === 0) {
          setStatus("No Pokemon found.");
        } else {
          setStatus("Found " + filteredResults.length + " result(s).");
        }
      })
      .catch(function (error) {
        setStatus("Error: " + error.message);
        setResults([]);
      });
  }
  // Clear search inputs and results
  function handleClear() {
    setPokemonName("");
    setPokemonType("");
    setPokedexNumber("");
    setOrderBy("name");
    setStatus("");
    setResults([]);
    setSwapped(false);
  }

  return (
    <main>
      <div className="App">
        <h1>Pokemon API: Gen 1</h1>
        <h2>Search below</h2>
      </div>

      <form id="searchForm" onSubmit={handleSubmit}>
        <div className="row">
          <div>
            <label htmlFor="pokemonName">Pokemon Name</label>
            <input
              id="pokemonName"
              type="text"
              placeholder="Example, 'Pikachu' or 'Squirtle'"
              value={pokemonName}
              onChange={(e) => setPokemonName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="pokemonType">Pokemon Type</label>
            <input
              id="pokemonType"
              type="text"
              placeholder="Example, 'Fire' or 'Water'"
              value={pokemonType}
              onChange={(e) => setPokemonType(e.target.value)}
            />
          </div>
        </div>

        <div className="row">
          <div>
            <label htmlFor="pokedexNumber">Pokedex #</label>
            <input
              id="pokedexNumber"
              type="text"
              placeholder="Example, '004' or '025'"
              value={pokedexNumber}
              onChange={(e) => setPokedexNumber(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="orderBy">Order By</label>
            <select
              id="orderBy"
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value)}
            >
              <option value="name">Pokemon Name</option>
              <option value="id">Pokedex #</option>
            </select>
          </div>
        </div>

        <div className="row">
          <button
            type="submit"
            className={swapped ? "clear-style" : "search-style"}
          >
            Search
          </button>

          <button
            type="button"
            id="clearBtn"
            onClick={handleClear}
            className={swapped ? "search-style" : "clear-style"}
          >
            Clear
          </button>
        </div>

        <StatusMessage status={status} />
      </form>

      <ul id="results">
        {results.map((pokemon) => (
          <PokemonResults key={pokemon.id} pokemon={pokemon} />
        ))}
      </ul>
    </main>
  );
}
