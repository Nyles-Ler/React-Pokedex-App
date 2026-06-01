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

type PokemonResultsProps = {
  pokemon: Pokemon;
};

export default function PokemonResults({ pokemon }: PokemonResultsProps) {
  return (
    <li>
      <img src={pokemon.sprites?.front_default} alt={pokemon.name} width="96" />
      <div>
        <strong>
          {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
        </strong>
      </div>
      <div>Pokedex #: {pokemon.id}</div>
      <div>Type: {pokemon.types.map((t) => t.type.name).join(", ")}</div>
    </li>
  );
}
