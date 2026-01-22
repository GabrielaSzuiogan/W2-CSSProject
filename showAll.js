const MAX_POKEMON = 55;
let listWrapper;
const searchInput = document.querySelector("#search-input");
let notFoundMessage;

let allPokemons = [];

fetch(`https://pokeapi.co/api/v2/pokemon?limit=${MAX_POKEMON}`)
  .then((response) => response.json())
  .then((data) => {
    allPokemons = data.results;
    listWrapper = document.querySelector(".list-wrapper");
    notFoundMessage = document.querySelector("#not-found-message");
    displayPokemons(allPokemons);
  });

async function fetchPokemonData(id) {
  try {
    const [pokemon, pokemonSpecies] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) =>
        res.json(),
      ),
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then((res) =>
        res.json(),
      ),
    ]);
    return { pokemon, pokemonSpecies };
  } catch (error) {
    console.error("Failed to fetch Pokemon data");
  }
}

function displayPokemons(pokemon) {
  listWrapper.innerHTML = "";

  pokemon.forEach((pokemon) => {

    const pokemonID = pokemon.url.split("/")[6];
    const listItem = document.createElement("div");
    listItem.className = "list-item";
    listItem.innerHTML = `
            <div class="number-wrap">#${pokemonID}</div>
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonID}.png" alt="${pokemon.name}" />
             <div class="name-wrap">#${pokemon.name}</div>
    `;

    listItem.addEventListener("click", async () => {
      const data = await fetchPokemonData(pokemonID);
      if (data) {
        showDetails(data);
      }
    });

    listWrapper.appendChild(listItem);
  });
}

searchInput.addEventListener("keyup", handleSearch);

function handleSearch() {
  const searchTerm = searchInput.value.toLowerCase();
  let filteredPokemons = allPokemons.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(searchTerm)
  );

  displayPokemons(filteredPokemons);

  if (filteredPokemons.length === 0) {
    notFoundMessage.style.display = "block";
  } else {
    notFoundMessage.style.display = "none";
  }
}


function showDetails({ pokemon, pokemonSpecies }) {
  const container = document.querySelector(".container");
  const description = pokemonSpecies.flavor_text_entries.find(entry => entry.language.name === 'en')?.flavor_text || 'No description available.';
  const types = pokemon.types.map(type => type.type.name).join(', ');
  const stats = pokemon.stats.map(stat => `${stat.stat.name}: ${stat.base_stat}`).join('<br>');

  searchInput.disabled = true;

  container.innerHTML = `
    <div class="detail-wrapper">
      <div class="poke-photo">
        <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}" />
      </div>
      <div class="poke-side">
        <div class="poke-name">${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</div>
        <div class="poke-info">
          <div>Height: ${pokemon.height / 10} m</div>
          <div>Weight: ${pokemon.weight / 10} kg</div>
          <div>Types: ${types}</div>
          <div>Description: ${description}</div>
        </div>
      </div>
      <div class="poke-stats">
        <h3>Base Stats</h3>
        <div>${stats}</div>
      </div>
      <button id="back-button">Back to List</button>
    </div>
  `;

  document.querySelector("#back-button").addEventListener("click", () => {
    container.innerHTML = '<div class="list-wrapper"></div><div id="not-found-message">Pokemon not found</div>';
    listWrapper = document.querySelector(".list-wrapper");
    notFoundMessage = document.querySelector("#not-found-message");
    searchInput.value = "";

    searchInput.disabled = false;
    displayPokemons(allPokemons);
  });
}
