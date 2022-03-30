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
        nextPokemonId: null,
        previousPokemonId: null,
        evolution: [],

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
        regions: ['kanto', 'updated-johto', 'hoenn', 'extended-sinnoh', 'original-unova', 'kalos-central', 'updated-alola', 'galar'],
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
                    Vue.error = "Kan pokemon niet laten zien!";
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
            Vue.limit = Vue.maxOnPage;
            Vue.offset = 0;
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
                    Vue.pokemon.entry_number = Vue.pokemon.id;
                    self.replaceStatNames()

                    Vue.nextPokemonId = self.spliceUrl(Vue.pokemons[Vue.pokemon.entry_number].pokemon_species.url);
                    Vue.previousPokemonId = self.spliceUrl(Vue.pokemons[Vue.pokemon.entry_number - 2].pokemon_species.url);

                    $('#pokedex-entry-modal').modal('show');

                },
                error: function() {
                    Vue.pokedexLoading = false;
                    Vue.error = "Deze pokemon bestaat niet!";
                }
            })
        },
        setMaxOnPage(result) {
            Vue.maxOnPage = result;
            Vue.offset = 0;
            Vue.limit = result;
        },
        spliceUrl(pokemonUrl) {
            return pokemonUrl.split('/')[6];
        },




        //MODAL
        showPokemon(pokemonId) {
            let self = this;
            console.log(pokemonId);
            pokemonUrl = 'https://pokeapi.co/api/v2/pokemon/' + Vue.pokemons[pokemonId - 1].pokemon_species.name;

            $.ajax({
                url: pokemonUrl,
                success: function(pokemon) {
                    Vue.pokemon = pokemon;
                    Vue.pokemon.entry_number = pokemonId;

                    self.replaceStatNames();

                    if (Vue.pokemon.entry_number < Vue.pokemons.length) {
                        Vue.nextPokemonId = self.spliceUrl(Vue.pokemons[Vue.pokemon.entry_number].pokemon_species.url);
                    }
                    if (Vue.pokemon.entry_number - 2 > 0) {
                        Vue.previousPokemonId = self.spliceUrl(Vue.pokemons[Vue.pokemon.entry_number - 2].pokemon_species.url);
                    }

                    console.log(pokemon)
                    $('#pokedex-entry-modal').modal('show');

                },
                error: function() {
                    Vue.pokedexLoading = false;
                    Vue.error = "Kan pokemon niet laten zien!";
                }
            })
        },
        showMoves() {
            $('#pokedex-moves-modal').modal('show');
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

                    Vue.nextPokemonId = self.spliceUrl(Vue.pokemons[Vue.pokemon.entry_number].pokemon_species.url);
                    Vue.previousPokemonId = self.spliceUrl(Vue.pokemons[Vue.pokemon.entry_number - 2].pokemon_species.url);

                    if (pokemon.entry_number == Vue.offset) {
                        Vue.previousPage();
                    }
                },
                error: function() {
                    Vue.pokedexLoading = false;
                    Vue.error = "Kan niet naar deze Pokemon!";
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

                    Vue.nextPokemonId = self.spliceUrl(Vue.pokemons[Vue.pokemon.entry_number].pokemon_species.url);
                    Vue.previousPokemonId = self.spliceUrl(Vue.pokemons[Vue.pokemon.entry_number - 2].pokemon_species.url);

                    if (pokemon.entry_number > Vue.limit) {
                        Vue.nextPage();
                    }

                },
                error: function() {
                    Vue.pokedexLoading = false;
                    Vue.error = "Kan niet naar deze Pokemon!";
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
                    Vue.regionData = region;
                    Vue.pokemons = region.pokemon_entries;
                    Vue.maxPages = Vue.pokemons.length;
                    self.setRegionDescription(region.descriptions);
                },
                error: function() {
                    Vue.pokedexLoading = false;
                    Vue.error = "Kan regio niet vinden!";
                }
            })
            Vue.pokedexLoading = false;
        },
        setRegionDescription(descriptions) {
            description = descriptions.filter((descriptions) => descriptions.language.name == "en");
            Vue.regionDescription = description[0].description;
        }
    }
})