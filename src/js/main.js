$(document).ready(function() {
    $("#myInput").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        $(".dropdown-menu li").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });
});

var Vue = new Vue({
    el: '#pokedex-app',
    data: {

        //POKEMON
        pokemons: [],
        pokemon: [],
        indexPokemon: 1,
        moves: 'closed',
        quote: '',
        pokemonName: null,

        //PAGE
        filter: 'none',
        limit: 0,
        offset: 0,
        maxOnPage: 20,
        currentPage: 0,
        maxPages: 0,

        //DATA
        opp: null,
        pokedexLoading: false,
        error: null,

        //REGION
        regions: ['kanto', 'updated-johto', 'hoenn', 'extended-sinnoh', 'updated-unova', 'kalos-central', 'updated-alola', 'galar'],
        regionData: null,
        regionData: [],
        regionDescription: '',

        //TYPE
        types: ['normal', 'fire', 'water', 'grass', 'flying', 'fighting', 'poison', 'electric', 'ground', 'rock', 'psychic', 'ice', 'bug', 'ghost', 'steel', 'dragon', 'dark', 'fairy'],
        typeData: [],
    },
    mounted() {
        let self = this;
        Vue.limit = Vue.maxOnPage;
        setTimeout(self.noFilter, 1);
    },
    methods: {
        //NO FILTER
        async getAllPokemon() {
            Vue.pokedexLoading = true;
            Vue.url = 'https://pokeapi.co/api/v2/pokedex/national';
            await $.ajax({
                url: Vue.url,
                success: function(pokemon) {
                    Vue.pokemons = pokemon.pokemon_entries;
                    Vue.maxPages = Vue.pokemons.length;
                },
                error: function() {
                    Vue.pokedexLoading = false;
                    Vue.error = "Error";
                }
            })
            Vue.pokedexLoading = false;
        },
        noFilter() {
            let self = this;
            self.getAllPokemon();
            self.fixData('none');
        },




        //DATA
        addPokemonIndex() {
            this.pokemons.forEach(pokemon => {
                pokemon.id = Vue.indexPokemon;
                Vue.indexPokemon += 1;
            });
        },
        fixData(filter) {
            Vue.filter = filter;
            Vue.regionData = '';
            Vue.typeData = '';
            Vue.regionData = '';
            Vue.typeData = '';
            Vue.limit = 0;
            Vue.offset = Vue.maxOnPage;
        },
        replaceStatNames() {
            i = 0;
            pokemonStats = Vue.pokemon;
            pokemonStatsCaps = pokemonStats.stats.map((stat) => stat.stat.name.charAt(0).toUpperCase() + stat.stat.name.substring(1).toLowerCase());
            specialStatsReplace = pokemonStatsCaps.map((stat) => stat.replace("Special-", "Sp."));

            Vue.pokemon.stats.forEach((stat) => stat.stat.name = specialStatsReplace[i++]);
        },
        searchPokemon() {
            let self = this;
            pokemonUrl = 'https://pokeapi.co/api/v2/pokemon/' + Vue.pokemonName;

            $.ajax({
                url: pokemonUrl,
                success: function(pokemon) {
                    Vue.pokemon = pokemon;
                    self.replaceStatNames()

                    $('#pokedex-entry-modal').modal('show');

                },
                error: function(error) {
                    Vue.pokedexLoading = false;
                    Vue.error = error;
                }
            })
        },
        setMaxOnPage(result) {
            Vue.maxOnPage = result;
            Vue.offset = 0;
            Vue.limit = result;
        },




        //MODAL
        showPokemon(pokemonId) {
            let self = this;
            pokemonUrl = 'https://pokeapi.co/api/v2/pokemon/' + Vue.pokemons[pokemonId - 1].pokemon_species.name;

            $.ajax({
                url: pokemonUrl,
                success: function(pokemon) {
                    Vue.pokemon = pokemon;
                    Vue.pokemon.entry_number = pokemonId;
                    self.replaceStatNames()

                    console.log(pokemon)
                    $('#pokedex-entry-modal').modal('show');

                },
                error: function() {
                    Vue.pokedexLoading = false;
                    Vue.error = "Deze plaats bestaat niet!";
                }
            })
        },
        showMoves() {
            if (Vue.moves == 'closed') {
                $('#collapseOne').addClass('show');
                Vue.moves = 'open';
            } else {
                $('#collapseOne').removeClass('show');
                Vue.moves = 'closed';
            }
        },
        previousPokemon(pokemonId) {
            let self = this;
            $.ajax({
                url: 'https://pokeapi.co/api/v2/pokemon/' + Vue.pokemons[pokemonId - 2].pokemon_species.name,
                success: function(pokemon) {
                    console.log(pokemon);
                    Vue.pokemon = pokemon;
                    Vue.pokemon.entry_number = pokemonId - 1;
                    self.replaceStatNames()

                    if (pokemon.id == Vue.offset) {
                        Vue.previousPage();
                    }
                },
                error: function() {
                    Vue.pokedexLoading = false;
                    Vue.error = "Deze plaats bestaat niet!";
                }
            })
        },
        nextPokemon(pokemonId) {
            let self = this;
            $.ajax({
                url: 'https://pokeapi.co/api/v2/pokemon/' + Vue.pokemons[pokemonId].pokemon_species.name,
                success: function(pokemon) {
                    console.log(pokemon);
                    Vue.pokemon = pokemon;
                    Vue.pokemon.entry_number = pokemonId + 1;
                    self.replaceStatNames()

                    if (pokemon.id > Vue.limit) {
                        Vue.nextPage();
                    }

                },
                error: function() {
                    Vue.pokedexLoading = false;
                    Vue.error = "Deze plaats bestaat niet!";
                }
            })
        },
        pokemonFirstType() {
            if (Vue.pokemon.types) {
                return Vue.pokemon.types[0].type.name;
            } else {
                return;
            }
        },




        //PAGINA
        openFilter() {
            $('.dropdown-menu').modal('toggle');
        },
        async previousPage() {
            Vue.pokedexLoading = true;
            Vue.limit -= Vue.maxOnPage;
            Vue.offset -= Vue.maxOnPage;
            Vue.pokedexLoading = false;
        },
        async nextPage() {
            Vue.pokedexLoading = true;
            Vue.limit += Vue.maxOnPage;
            Vue.offset += Vue.maxOnPage;
            Vue.pokedexLoading = false;
        },




        //REGION
        async selectRegion(region) {
            let self = this;
            Vue.pokedexLoading = true;
            self.fixData('region');
            Vue.url = 'https://pokeapi.co/api/v2/pokedex/' + region;

            await $.ajax({
                url: Vue.url,
                success: function(region) {
                    console.log(region);
                    Vue.pokemons = region.pokemon_entries;
                    Vue.regionData = region;
                    Vue.opp = '0';
                    self.replaceStatNames();
                },
                error: function() {
                    Vue.pokedexLoading = false;
                    Vue.error = "error";
                }
            })
            Vue.pokedexLoading = false;
        },
    }
})